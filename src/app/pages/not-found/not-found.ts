import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1>Seite nicht gefunden</h1>
    <section class="card">
      <p>Diese Seite gibt es nicht.</p>
      <p><a routerLink="/groups">Zu meinen Tippgruppen</a></p>
    </section>
  `,
})
export class NotFoundPage {}
