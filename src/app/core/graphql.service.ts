import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiError, messageFor } from './api-error';
import { AuthService } from './auth.service';

interface GraphqlResponse<T> {
  data?: T | null;
  errors?: { message: string; extensions?: { code?: string } }[];
}

// Eco-Dynos brauchen nach dem Schlafen einige Sekunden (wie API_TIMEOUT_MS in der MPA)
const REQUEST_TIMEOUT_MS = 15000;

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Eine Anfrage an den GraphQL-Service; Fehler kommen als ApiError mit deutscher Meldung
  request<T>(query: string, variables: Record<string, unknown> = {}): Observable<T> {
    return this.http.post<GraphqlResponse<T>>(environment.graphqlUrl, { query, variables }).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map((response) => {
        const first = response.errors?.[0];
        if (first) {
          const code = first.extensions?.code ?? 'CORE_ERROR';
          throw new ApiError(code, messageFor(code, first.message));
        }
        if (!response.data) {
          throw new ApiError('CORE_ERROR', messageFor('CORE_ERROR'));
        }
        return response.data;
      }),
      catchError((err: unknown) => {
        const apiError = this.toApiError(err);
        // Abgelaufene oder ungültige Sitzung: abmelden und zum Login
        if (apiError.code === 'UNAUTHORIZED' && this.auth.isLoggedIn()) {
          this.auth.clearSession();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
        return throwError(() => apiError);
      }),
    );
  }

  private toApiError(err: unknown): ApiError {
    if (err instanceof ApiError) {
      return err;
    }
    if (err instanceof HttpErrorResponse && err.status === 401) {
      return new ApiError('UNAUTHORIZED', messageFor('UNAUTHORIZED'));
    }
    if (err instanceof HttpErrorResponse && err.status !== 0) {
      return new ApiError('CORE_UNAVAILABLE', messageFor('CORE_UNAVAILABLE'));
    }
    return new ApiError('NETWORK_ERROR', messageFor('NETWORK_ERROR'));
  }
}
