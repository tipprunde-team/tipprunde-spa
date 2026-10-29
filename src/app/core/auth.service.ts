import { Injectable, computed, signal } from '@angular/core';
import { TokenAnswer } from './models';

// Schlüssel im sessionStorage, Sitzung endet mit dem Tab (wie in der MPA)
const KEY_TOKEN = 'tipprunde.spa.token';
const KEY_EXPIRES = 'tipprunde.spa.expiresAt';
const KEY_USER_ID = 'tipprunde.spa.userId';
const KEY_USERNAME = 'tipprunde.spa.username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token = signal<string | null>(this.readValidToken());
  private readonly name = signal<string | null>(sessionStorage.getItem(KEY_USERNAME));

  readonly isLoggedIn = computed(() => this.token() !== null);
  readonly username = this.name.asReadonly();

  // Token für den Interceptor, abgelaufene Tokens zählen nicht
  getToken(): string | null {
    if (this.token() && this.isExpired()) {
      this.clearSession();
    }
    return this.token();
  }

  saveSession(answer: TokenAnswer): void {
    sessionStorage.setItem(KEY_TOKEN, answer.token);
    sessionStorage.setItem(KEY_EXPIRES, answer.expiresAt);
    sessionStorage.setItem(KEY_USER_ID, answer.user.id);
    sessionStorage.setItem(KEY_USERNAME, answer.user.username);
    this.token.set(answer.token);
    this.name.set(answer.user.username);
  }

  clearSession(): void {
    [KEY_TOKEN, KEY_EXPIRES, KEY_USER_ID, KEY_USERNAME].forEach((key) => sessionStorage.removeItem(key));
    this.token.set(null);
    this.name.set(null);
  }

  private readValidToken(): string | null {
    const token = sessionStorage.getItem(KEY_TOKEN);
    return token && !this.isExpired() ? token : null;
  }

  private isExpired(): boolean {
    const expiresAt = sessionStorage.getItem(KEY_EXPIRES);
    return !expiresAt || Date.parse(expiresAt) <= Date.now();
  }
}
