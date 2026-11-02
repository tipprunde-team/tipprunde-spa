import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ApiError } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { GraphqlService } from '../../core/graphql.service';
import { TokenAnswer } from '../../core/models';
import { LOGIN_MUTATION } from '../login/login';

const REGISTER = `
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(email: $email, username: $username, password: $password) { id }
  }`;

// Gleiche Regeln wie in der MPA (register.js); der Core prüft noch einmal
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterPage {
  private readonly graphql = inject(GraphqlService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Rücksprung nach der Registrierung, z. B. zur Einladung (?returnUrl=/join/abc)
  readonly returnUrl = input<string>();

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Nur Pfade innerhalb der App zulassen, keine fremden Adressen
  private readonly safeReturnUrl = computed(() => {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : null;
  });
  protected readonly loginParams = computed(() => {
    const url = this.safeReturnUrl();
    return url ? { returnUrl: url } : {};
  });

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: [''],
    username: [''],
    password: [''],
    password2: [''],
  });

  constructor() {
    // Schon angemeldet: gleich zu den Tippgruppen
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/groups');
    }
  }

  protected submit(): void {
    const { email, username, password, password2 } = this.form.getRawValue();
    const problem = validate(email.trim(), username.trim(), password, password2);
    if (problem) {
      this.error.set(problem);
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    // Erst Konto anlegen, dann direkt anmelden (register liefert kein Token)
    let registered = false;
    this.graphql
      .request<{ register: { id: string } }>(REGISTER, {
        email: email.trim(),
        username: username.trim(),
        password,
      })
      .pipe(
        switchMap(() => {
          registered = true;
          return this.graphql.request<{ login: TokenAnswer }>(LOGIN_MUTATION, {
            email: email.trim().toLowerCase(),
            password,
          });
        }),
      )
      .subscribe({
        next: ({ login }) => {
          this.auth.saveSession(login);
          this.router.navigateByUrl(this.safeReturnUrl() ?? '/groups');
        },
        error: (err: ApiError) => {
          this.loading.set(false);
          // Konto ist angelegt, nur die Anmeldung danach ist fehlgeschlagen
          this.error.set(
            registered ? 'Dein Konto ist angelegt. Bitte melde dich jetzt an.' : err.message,
          );
        },
      });
  }
}

// Prüft die Eingaben, gibt den Fehlertext zurück oder null (nur Komfort)
export function validate(
  email: string,
  username: string,
  password: string,
  password2: string,
): string | null {
  if (email === '') {
    return 'Bitte gib deine E-Mail-Adresse ein.';
  }
  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein (höchstens 254 Zeichen).';
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Der Benutzername muss 3 bis 30 Zeichen lang sein und darf nur Buchstaben, Ziffern, _ . - enthalten.';
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return 'Das Passwort muss zwischen 8 und 72 Zeichen lang sein.';
  }
  if (password !== password2) {
    return 'Die beiden Passwörter stimmen nicht überein.';
  }
  return null;
}
