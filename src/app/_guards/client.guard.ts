import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { map } from 'rxjs';
import { UserType } from '../_shared/enums';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
   return authService.CurrentUser$.pipe(map(user => {
     if (user && (user.userType == UserType.Investor || user.userType==UserType.Founder)) {
       return true;
     } else {
       router.navigate(['/login']);
       return false;
     }
   }));
 
};
