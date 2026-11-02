import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { ApiError } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { GraphqlService } from '../../core/graphql.service';
import { RankingEntry } from '../../core/models';
import { GroupTabs } from '../../shared/group-tabs';

const RANKING = `
  query Ranking($groupId: ID!) {
    ranking(groupId: $groupId) { rank userId username points exactTips }
  }`;

@Component({
  selector: 'app-ranking',
  imports: [GroupTabs],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css',
})
export class RankingPage {
  private readonly graphql = inject(GraphqlService);
  protected readonly auth = inject(AuthService);

  readonly id = input.required<string>();

  protected readonly entries = signal<RankingEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Gesamtrangliste der Gruppe; gleicher Rang bei Punktgleichheit kommt vom Server
    effect(() => {
      const groupId = this.id();
      untracked(() => {
        this.loading.set(true);
        this.graphql.request<{ ranking: RankingEntry[] }>(RANKING, { groupId }).subscribe({
          next: ({ ranking }) => {
            this.entries.set(ranking);
            this.loading.set(false);
          },
          error: (err: ApiError) => {
            this.error.set(err.message);
            this.loading.set(false);
          },
        });
      });
    });
  }
}
