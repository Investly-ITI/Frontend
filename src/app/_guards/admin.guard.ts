import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { inject } from '@angular/core';
import { UserType } from '../_shared/enums';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.CurrentUser$.pipe(map(user => {

    if (user && user.userType == UserType.Staff) {
      return true;
    } else {
      router.navigate(['/staff-login']);
      return false;
    }
  }));

};
