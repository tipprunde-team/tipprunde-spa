import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthService } from './core/auth.service';

// Rahmen der SPA: Kopfzeile, Inhalt je Route, Fußzeile
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly mpaUrl = environment.mpaUrl;

  // Abmelden ist zustandslos: Token im Browser löschen genügt
  protected logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }
}
