import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtService } from '../_services/jwt.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const token = jwtService.getToken();
  const router=inject(Router);

  let authReq=req;
  if (token) {
     authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return next(authReq).pipe(
    catchError(err=>{
      if(err.status===403){
        //jwtService.clearToken()
        router.navigate(['/staff-login'])
      }
       return throwError(() => err);
    })

  );
};
