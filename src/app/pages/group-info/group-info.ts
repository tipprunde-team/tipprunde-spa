import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ApiError } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { GraphqlService } from '../../core/graphql.service';
import { Group } from '../../core/models';
import { GroupTabs } from '../../shared/group-tabs';

const GROUP = `
  query Group($id: ID!) {
    group(id: $id) {
      id name role inviteCode
      members { userId username role joinedAt }
    }
  }`;

@Component({
  selector: 'app-group-info',
  imports: [GroupTabs],
  templateUrl: './group-info.html',
  styleUrl: './group-info.css',
})
export class GroupInfoPage {
  private readonly graphql = inject(GraphqlService);
  protected readonly auth = inject(AuthService);

  readonly id = input.required<string>();

  protected readonly group = signal<Group | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Einladungslink nur für Admins (inviteCode kommt nur dann vom Server), absolute URL der SPA
  protected readonly inviteLink = computed(() => {
    const code = this.group()?.inviteCode;
    return code ? `${location.origin}/join/${encodeURIComponent(code)}` : null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.loading.set(true);
        this.graphql.request<{ group: Group | null }>(GROUP, { id }).subscribe({
          next: ({ group }) => {
            this.loading.set(false);
            if (group) {
              this.group.set(group);
            } else {
              this.error.set('Diese Tippgruppe gibt es nicht.');
            }
          },
          error: (err: ApiError) => {
            this.loading.set(false);
            this.error.set(err.message);
          },
        });
      });
    });
  }

  protected joinedAt(iso: string): string {
    return new Date(iso).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
  }

  protected copy(link: string): void {
    navigator.clipboard
      .writeText(link)
      .then(() => this.status.set('Link kopiert'))
      .catch(() => this.status.set('Kopieren nicht möglich, bitte den Link markieren und kopieren.'));
  }

  // Teilen-Menü des Geräts (CR-01); Abbrechen ist ok, sonst Link kopieren
  protected share(link: string): void {
    navigator
      .share({ title: 'Tipprunde', text: `Tritt meiner Tippgruppe „${this.group()?.name}“ bei:`, url: link })
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          this.copy(link);
        }
      });
  }
}
