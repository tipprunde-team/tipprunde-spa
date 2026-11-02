import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Geschützte Ansichten: ohne Anmeldung zum Login, danach zurück zur gewünschten Seite
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).getToken()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
