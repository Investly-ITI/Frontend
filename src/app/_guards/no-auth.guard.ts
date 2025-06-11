import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { flatMap, map } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';
import { UserType } from '../_shared/enums';

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.CurrentUser$.pipe(
    map((user) => {
      if (user && user.userType!=UserType.Staff) {
        router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    })
  );
};