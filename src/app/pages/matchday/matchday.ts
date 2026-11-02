import { Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { GraphqlService } from '../../core/graphql.service';
import { MatchEntry, Matchday } from '../../core/models';
import { GroupTabs } from '../../shared/group-tabs';
import { MatchCard } from './match-card';

const MATCHDAY = `
  query Matchday($groupId: ID!, $matchday: Int) {
    matchday(groupId: $groupId, matchday: $matchday) {
      matchday
      serverTime
      matches {
        id kickoff status locked
        homeTeam { name shortName crest }
        awayTeam { name shortName crest }
        result { home away }
        myTip { home away }
        myPoints
      }
    }
  }`;

const TZ = 'Europe/Berlin';
const FIRST_MATCHDAY = 1;
const LAST_MATCHDAY = 34;
// Alle 15 s Serverzeit fortschreiben, damit Karten ab Anstoß ohne Neuladen sperren (US-21)
const CLOCK_TICK_MS = 15000;

@Component({
  selector: 'app-matchday',
  imports: [GroupTabs, MatchCard],
  templateUrl: './matchday.html',
  styleUrl: './matchday.css',
})
export class MatchdayPage {
  private readonly graphql = inject(GraphqlService);
  private readonly router = inject(Router);

  // :id aus der URL und ?matchday= aus der Query
  readonly id = input.required<string>();
  readonly matchday = input<string>();

  protected readonly data = signal<Matchday | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Abstand Serverzeit zu Geräteuhr; die Geräteuhr misst nur vergangene Zeit
  private serverOffsetMs = 0;
  protected readonly serverNow = signal(Date.now());

  // Spiele nach Kalendertag in deutscher Zeit gruppiert
  protected readonly days = computed(() => {
    const groups = new Map<string, MatchEntry[]>();
    // Nach Anstoß sortieren, egal in welcher Reihenfolge die API liefert
    const sorted = [...(this.data()?.matches ?? [])].sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
    for (const match of sorted) {
      const day = new Date(match.kickoff).toLocaleDateString('de-DE', {
        timeZone: TZ,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      groups.set(day, [...(groups.get(day) ?? []), match]);
    }
    return [...groups.entries()].map(([label, matches]) => ({ label, matches }));
  });

  constructor() {
    // Neu laden, wenn sich Gruppe oder Spieltag in der URL ändern
    effect(() => {
      const groupId = this.id();
      const matchday = this.matchday();
      untracked(() => this.load(groupId, matchday));
    });

    const timer = setInterval(() => this.serverNow.set(Date.now() + this.serverOffsetMs), CLOCK_TICK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected reload(): void {
    this.load(this.id(), this.matchday());
  }

  protected go(step: number): void {
    const current = this.data()?.matchday;
    if (!current) return;
    const next = Math.min(LAST_MATCHDAY, Math.max(FIRST_MATCHDAY, current + step));
    // Spieltag in die URL, damit Neuladen und Zurück-Taste funktionieren
    this.router.navigate([], { queryParams: { matchday: next } });
  }

  private load(groupId: string, matchday?: string): void {
    const number = matchday ? Number(matchday) : null;
    const valid = number !== null && Number.isInteger(number) && number >= FIRST_MATCHDAY && number <= LAST_MATCHDAY;
    this.loading.set(true);
    this.error.set(null);

    this.graphql.request<{ matchday: Matchday | null }>(MATCHDAY, { groupId, matchday: valid ? number : null }).subscribe({
      next: ({ matchday: result }) => {
        this.loading.set(false);
        if (!result) {
          this.error.set('Für diesen Spieltag gibt es keine Daten.');
          return;
        }
        this.serverOffsetMs = Date.parse(result.serverTime) - Date.now();
        this.serverNow.set(Date.parse(result.serverTime));
        this.data.set(result);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }
}
