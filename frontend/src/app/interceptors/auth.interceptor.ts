import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip token attachment for auth endpoints
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Attach access token if available
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - attempt token refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry original request with new token
            const newToken = authService.getAccessToken();
            if (newToken) {
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(clonedRequest);
            }
            return throwError(() => error);
          }),
          catchError(refreshError => {
            // Refresh failed, logout user
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};
