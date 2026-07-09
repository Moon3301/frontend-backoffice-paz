import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Guard asíncrono: bloquea la navegación hasta confirmar que la sesión es
 * válida. Evita el bug de entrar a un módulo con un token expirado y ser
 * expulsado segundos después por el primer 401 de datos.
 *
 * Orden de validación:
 *  1. Sin token           -> login inmediato.
 *  2. Token expirado (local, decodificando el JWT) -> limpiar + login.
 *  3. Confirmación contra el backend (GET /auth/me, con caché de 5 min).
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const redirectToLogin = () => {
    authService.removeToken();
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  };

  const token = localStorage.getItem('access_token');
  if (!token) {
    return redirectToLogin();
  }

  // Validación local: token expirado no pasa (sin esperar al backend)
  if (authService.isTokenExpired()) {
    return redirectToLogin();
  }

  // Confirmación server-side: espera lo que tenga que esperar antes de permitir el acceso
  const sessionOk = await authService.validateSession();
  if (!sessionOk) {
    return redirectToLogin();
  }

  return true;
};
