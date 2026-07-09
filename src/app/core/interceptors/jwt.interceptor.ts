import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const authService = inject(AuthService);

  let newReq = req;

  // Clone the request and add the authorization header if token exists
  if (token) {
    newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Send the cloned request to the next handler and catch any 401 errors globally
  return next(newReq).pipe(
    catchError((error) => {
      // 401 en el login = credenciales inválidas: dejar que el formulario lo maneje
      const isLoginRequest = req.url.includes('/auth/login');

      // Red de seguridad: token revocado/expirado a mitad de sesión
      if (error.status === 401 && !isLoginRequest) {
        authService.removeToken(); // solo las claves de sesión, no todo el storage
        router.navigate(['/auth/login']); // Redirect back to login
      }
      return throwError(() => error);
    })
  );
};
