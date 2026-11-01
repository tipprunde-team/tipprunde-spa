import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { GraphqlService } from '../../core/graphql.service';
import { GroupSummary, InvitePreview } from '../../core/models';

const PREVIEW = `
  query InvitePreview($code: String!) {
    invitePreview(code: $code) { groupId groupName memberCount }
  }`;

const JOIN = `
  mutation JoinGroup($inviteCode: String!) {
    joinGroup(inviteCode: $inviteCode) { id name }
  }`;

@Component({
  selector: 'app-join',
  imports: [RouterLink],
  templateUrl: './join.html',
})
export class JoinPage implements OnInit {
  private readonly graphql = inject(GraphqlService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  // Code aus der URL /join/:code
  readonly code = input.required<string>();

  protected readonly preview = signal<InvitePreview | null>(null);
  protected readonly loading = signal(true);
  protected readonly joining = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Vorschau funktioniert auch ohne Anmeldung
    this.graphql.request<{ invitePreview: InvitePreview | null }>(PREVIEW, { code: this.code().trim() }).subscribe({
      next: ({ invitePreview }) => {
        this.loading.set(false);
        if (invitePreview) {
          this.preview.set(invitePreview);
        } else {
          this.error.set('Der Einladungscode ist ungültig.');
        }
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }

  protected join(): void {
    // Ohne Anmeldung erst zum Login, danach zurück auf diese Seite
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/join/${this.code()}` } });
      return;
    }
    this.joining.set(true);
    this.error.set(null);
    this.graphql.request<{ joinGroup: GroupSummary }>(JOIN, { inviteCode: this.code().trim() }).subscribe({
      next: ({ joinGroup }) => this.router.navigate(['/groups', joinGroup.id, 'matchday']),
      error: (err: ApiError) => {
        this.joining.set(false);
        // Schon Mitglied: direkt zur Gruppe, wie in der MPA
        const groupId = this.preview()?.groupId;
        if (err.code === 'ALREADY_MEMBER' && groupId) {
          this.router.navigate(['/groups', groupId, 'matchday']);
          return;
        }
        this.error.set(err.message);
      },
    });
  }
}
