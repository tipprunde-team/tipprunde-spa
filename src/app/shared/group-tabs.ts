import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Reiter Spieltag, Rangliste und Gruppe für alle Gruppenansichten (wie group-nav.js in der MPA)
@Component({
  selector: 'app-group-tabs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="tabs" aria-label="Gruppenansichten">
      <a [routerLink]="['/groups', groupId(), 'matchday']" routerLinkActive="active">Spieltag</a>
      <a [routerLink]="['/groups', groupId(), 'ranking']" routerLinkActive="active">Rangliste</a>
      <a [routerLink]="['/groups', groupId(), 'info']" routerLinkActive="active">Gruppe</a>
    </nav>
  `,
  styles: `
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-5);
    }
    a {
      flex: 1;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      font-family: var(--font-heading);
      font-weight: 700;
      text-transform: uppercase;
      text-decoration: none;
      border-bottom: 3px solid transparent;
    }
    a.active {
      color: var(--color-text);
      border-bottom-color: var(--color-accent);
    }
  `,
})
export class GroupTabs {
  readonly groupId = input.required<string>();
}
