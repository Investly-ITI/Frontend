import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtService } from '../_services/jwt.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const router=inject(Router);

  let authReq=req;
  if (token) {
     authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return next(authReq).pipe(
    catchError(err=>{
      if(err.status===403||err.status===401){
        authService.logout();
        location.reload();
      }
       return throwError(() => err);
    })

  );
};
