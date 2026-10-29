import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

// Platzhalter, folgt mit SPA Teil 2 (Rangliste)
@Component({
  selector: 'app-ranking',
  imports: [RouterLink],
  template: `
    <h1>Rangliste</h1>
    <section class="card">
      <p class="muted">Gruppe {{ id() }}: Rangliste folgt in Kürze.</p>
      <p><a [routerLink]="['/groups', id(), 'matchday']">Zum Spieltag</a></p>
    </section>
  `,
})
export class RankingPage {
  readonly id = input.required<string>();
}
