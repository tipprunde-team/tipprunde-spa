import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { GraphqlService } from '../../core/graphql.service';
import { Group, GroupSummary } from '../../core/models';

const MY_GROUPS = `
  query MyGroups {
    myGroups { id name role memberCount myRank myPoints }
  }`;

const CREATE_GROUP = `
  mutation CreateGroup($name: String!) {
    createGroup(name: $name) { id name inviteCode role }
  }`;

@Component({
  selector: 'app-groups',
  imports: [RouterLink, FormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class GroupsPage implements OnInit {
  private readonly graphql = inject(GraphqlService);
  private readonly router = inject(Router);

  protected readonly groups = signal<GroupSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly newName = signal('');
  protected readonly creating = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly joinCode = signal('');

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

  protected create(): void {
    const name = this.newName().trim();
    // Vorprüfung nur als Komfort, der Server prüft 1 bis 50 Zeichen selbst
    if (name.length < 1 || name.length > 50) {
      this.createError.set('Der Name muss 1 bis 50 Zeichen lang sein.');
      return;
    }
    this.creating.set(true);
    this.createError.set(null);
    this.graphql.request<{ createGroup: Group }>(CREATE_GROUP, { name }).subscribe({
      // Nach dem Anlegen zur Gruppenansicht mit Einladungslink
      next: ({ createGroup }) => this.router.navigate(['/groups', createGroup.id, 'info']),
      error: (err: ApiError) => {
        this.creating.set(false);
        this.createError.set(err.message);
      },
    });
  }

  protected join(): void {
    const code = this.joinCode().trim();
    if (code) {
      this.router.navigate(['/join', code]);
    }
  }
}
