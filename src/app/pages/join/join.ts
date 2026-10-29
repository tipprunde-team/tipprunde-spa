import { Component, input } from '@angular/core';

// Platzhalter, folgt mit SPA Teil 1 (Einladungsvorschau und Beitritt)
@Component({
  selector: 'app-join',
  template: `
    <h1>Tippgruppe beitreten</h1>
    <section class="card"><p class="muted">Einladungscode {{ code() }}: Beitritt folgt in Kürze.</p></section>
  `,
})
export class JoinPage {
  readonly code = input.required<string>();
}
