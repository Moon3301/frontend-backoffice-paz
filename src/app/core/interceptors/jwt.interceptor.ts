import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { API_URL } from '../../../environments/environments';

/**
 * Agrega el token SOLO a las llamadas a nuestra API.
 *
 * Antes se adjuntaba a toda petición, incluidas las del CRM externo (módulo
 * Testing Leads): el token de sesión viajaba a otro servidor, y un 401 del CRM
 * cerraba la sesión del backoffice.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const esNuestraApi = req.url.startsWith(API_URL);
  if (!esNuestraApi) return next(req);

  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const authService = inject(AuthService);

  const newReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(newReq).pipe(
    catchError((error) => {
      // 401 en el login = credenciales inválidas: dejar que el formulario lo maneje
      const isLoginRequest = req.url.includes('/auth/login');

      // Red de seguridad: token revocado/expirado o cuenta desactivada a mitad de sesión
      if (error.status === 401 && !isLoginRequest) {
        authService.removeToken(); // solo las claves de sesión, no todo el storage
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url, motivo: 'sesion' },
        });
      }
      return throwError(() => error);
    })
  );
};
