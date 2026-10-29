import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { GraphqlService } from '../../core/graphql.service';
import { GroupSummary } from '../../core/models';

const MY_GROUPS = `
  query MyGroups {
    myGroups { id name role memberCount myRank myPoints }
  }`;

@Component({
  selector: 'app-groups',
  imports: [RouterLink],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class GroupsPage implements OnInit {
  private readonly graphql = inject(GraphqlService);

  protected readonly groups = signal<GroupSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.graphql.request<{ myGroups: GroupSummary[] }>(MY_GROUPS).subscribe({
      next: ({ myGroups }) => {
        this.groups.set(myGroups);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
