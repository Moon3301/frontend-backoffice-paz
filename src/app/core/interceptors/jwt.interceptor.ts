import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  
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
      // Logic for catching 401 Unauthorized globally
      if (error.status === 401) {
        localStorage.clear(); // Ensure storage is cleared on 401
        router.navigate(['/auth/login']); // Redirect back to login
      }
      return throwError(() => error);
    })
  );
};
