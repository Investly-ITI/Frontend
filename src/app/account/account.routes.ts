import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginStaffComponent } from './login-staff/login-staff.component';
import { SignupComponent } from './signup/signup.component';

export const accountRoutes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login - Investly' },
  { path: 'signup', component: SignupComponent, title: 'Sign Up - Investly' },
  { path: 'staff-login', component: LoginStaffComponent, title: 'Staff Login - Investly' }
];
