import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError, messageFor } from '../../core/api-error';
import { GraphqlService } from '../../core/graphql.service';
import { MatchEntry, Score, Team, Tip } from '../../core/models';

const SUBMIT_TIP = `
  mutation SubmitTip($groupId: ID!, $matchId: ID!, $home: Int!, $away: Int!) {
    submitTip(groupId: $groupId, matchId: $matchId, home: $home, away: $away) { matchId home away updatedAt }
  }`;

const TZ = 'Europe/Berlin';
type CardState = 'open' | 'tipped' | 'locked' | 'finished' | 'postponed' | 'cancelled';

// Eine Spielkarte: Paarung, Status, Tipp-Eingabe oder Ergebnis mit Punkten
@Component({
  selector: 'app-match-card',
  imports: [FormsModule],
  templateUrl: './match-card.html',
  styleUrl: './match-card.css',
})
export class MatchCard {
  private readonly graphql = inject(GraphqlService);

  readonly match = input.required<MatchEntry>();
  readonly groupId = input.required<string>();
  // Geschätzte Serverzeit in ms, kommt vom Spieltag und läuft weiter
  readonly serverNow = input.required<number>();
  // Server meldet TIP_LOCKED: Spieltag neu laden
  readonly reloadRequested = output<void>();

  // Gespeicherter Tipp, startet mit myTip aus der API
  protected readonly savedTip = linkedSignal<Score | null>(() => this.match().myTip ?? null);
  protected readonly home = linkedSignal<string | number>(() => this.savedTip()?.home ?? '');
  protected readonly away = linkedSignal<string | number>(() => this.savedTip()?.away ?? '');
  protected readonly saving = signal(false);
  protected readonly message = signal<{ text: string; ok: boolean } | null>(null);

  // Sperre nur nach API-Feldern und Serverzeit, nie nach der Geräteuhr
  protected readonly state = computed<CardState>(() => {
    const m = this.match();
    if (m.status === 'CANCELLED') return 'cancelled';
    if (m.status === 'POSTPONED') return 'postponed';
    if (m.status === 'FINISHED') return 'finished';
    if (m.locked || m.status === 'LIVE' || Date.parse(m.kickoff) <= this.serverNow()) return 'locked';
    return this.savedTip() ? 'tipped' : 'open';
  });

  protected readonly editable = computed(() => this.state() === 'open' || this.state() === 'tipped');

  protected readonly badge = computed(() => {
    const m = this.match();
    const left = this.countdown();
    switch (this.state()) {
      case 'open':
        return { text: left ? `Offen · ${left}` : 'Offen', cls: 'badge-warning' };
      case 'tipped':
        return { text: left ? `Getippt · ${left}` : 'Getippt', cls: 'badge-success' };
      case 'locked':
        return { text: 'Gesperrt', cls: 'badge-locked' };
      case 'postponed':
        return { text: 'Verschoben', cls: 'badge-locked' };
      case 'cancelled':
        return { text: 'Abgesagt', cls: 'badge-locked' };
      default:
        if ((m.myPoints ?? 0) > 0) return { text: `+${m.myPoints} Punkte`, cls: 'badge-success' };
        if (m.myPoints == null && m.myTip) return { text: 'Wertung folgt', cls: 'badge-neutral' };
        return { text: m.myTip ? '0 Punkte' : 'Kein Tipp', cls: 'badge-neutral' };
    }
  });

  protected readonly time = computed(() =>
    new Date(this.match().kickoff).toLocaleTimeString('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }),
  );

  // Wappen, die nicht laden, durch Kürzel ersetzen
  protected readonly brokenCrests = signal<Set<string>>(new Set());

  protected abbr(team: Team): string {
    return (team.shortName || team.name || '?').replace(/[^A-Za-zÄÖÜäöü]/g, '').slice(0, 3).toUpperCase();
  }

  protected crestFailed(team: Team): void {
    this.brokenCrests.update((set) => new Set(set).add(team.name));
  }

  protected scoreText(score: Score | null | undefined): string {
    return score ? `${score.home} : ${score.away}` : '– : –';
  }

  protected save(): void {
    const home = this.parseGoals(this.home());
    const away = this.parseGoals(this.away());
    // Vorprüfung nur als Komfort, der Server prüft selbst
    if (home === null || away === null) {
      this.message.set({ text: 'Bitte für beide Teams eine ganze Zahl von 0 bis 20 eingeben.', ok: false });
      return;
    }
    this.saving.set(true);
    this.message.set(null);
    const variables = { groupId: this.groupId(), matchId: this.match().id, home, away };

    this.graphql.request<{ submitTip: Tip }>(SUBMIT_TIP, variables).subscribe({
      next: ({ submitTip }) => {
        this.saving.set(false);
        this.savedTip.set({ home: submitTip.home, away: submitTip.away });
        this.message.set({ text: 'Tipp gespeichert', ok: true });
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        this.message.set({ text: err.message || messageFor(err.code), ok: false });
        if (err.code === 'TIP_LOCKED') {
          this.reloadRequested.emit();
        }
      },
    });
  }

  private parseGoals(value: string | number | null): number | null {
    const text = String(value ?? '').trim();
    if (!/^\d{1,2}$/.test(text)) return null;
    const goals = Number(text);
    return goals >= 0 && goals <= 20 ? goals : null;
  }

  // Restzeit bis zum Anstoß gegen die Serverzeit, nur unter 24 Stunden
  private countdown(): string {
    const ms = Date.parse(this.match().kickoff) - this.serverNow();
    const mins = Math.floor(ms / 60000);
    if (ms <= 0 || mins >= 24 * 60) return '';
    if (mins === 0) return 'noch unter 1 Min';
    const h = Math.floor(mins / 60);
    return `noch ${h > 0 ? h + ' Std ' : ''}${mins % 60} Min`;
  }
}
