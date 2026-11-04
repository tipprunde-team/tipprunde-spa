import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // KI-Log NS-26 "Angular-Gerüst im Tipprunde-Design mit CI."
    // Routenparameter wie :id kommen direkt als input() in die Komponenten
    provideRouter(routes, withComponentInputBinding()),
    // KI-Log NS-27 "GraphQL mit Token im Header, geschützte Routen."
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
