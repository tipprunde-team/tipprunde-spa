import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiError, messageFor } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { GraphqlService } from '../../core/graphql.service';
import { TokenAnswer } from '../../core/models';

const LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      expiresAt
      user { id username }
    }
  }`;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly graphql = inject(GraphqlService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Rücksprung nach dem Login, z. B. zur Einladung (?returnUrl=/join/abc)
  readonly returnUrl = input<string>();

  protected readonly registerUrl = environment.mpaUrl + '/public/html/auth/Register.html';
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Bitte E-Mail-Adresse und Passwort eingeben.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    this.graphql.request<{ login: TokenAnswer }>(LOGIN, { email: email.trim().toLowerCase(), password }).subscribe({
      next: ({ login }) => {
        this.auth.saveSession(login);
        // Nur Pfade innerhalb der App zulassen, keine fremden Adressen
        const target = this.returnUrl()?.startsWith('/') ? this.returnUrl()! : '/groups';
        this.router.navigateByUrl(target);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        // Falsche Zugangsdaten immer mit derselben Meldung
        this.error.set(err.code === 'UNAUTHORIZED' ? messageFor('LOGIN_FAILED') : err.message);
      },
    });
  }
}
