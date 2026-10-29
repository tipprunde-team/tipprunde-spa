import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

// Platzhalter, folgt mit SPA Teil 2 (Spieltag mit Tippen und Sperre)
@Component({
  selector: 'app-matchday',
  imports: [RouterLink],
  template: `
    <h1>Spieltag</h1>
    <section class="card">
      <p class="muted">Gruppe {{ id() }}: Spieltag mit Tippen folgt in Kürze.</p>
      <p><a [routerLink]="['/groups', id(), 'ranking']">Zur Rangliste</a></p>
    </section>
  `,
})
export class MatchdayPage {
  readonly id = input.required<string>();
}
