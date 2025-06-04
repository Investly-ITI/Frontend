import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { InvestorComponent } from './admin/investor/investor.component';
import { LoginComponent } from './account/login/login.component';
import { LoginStaffComponent } from './account/login-staff/login-staff.component';
import { SignupComponent } from './account/signup/signup.component';
import { LandingPageComponent } from './main/landing-page/landing-page.component';
import { MainLayoutComponent } from './_shared/components/main-layout.component';
import { adminGuard } from './_guards/admin.guard';
import { BusinessIdeasComponent } from './admin/business-ideas/business-ideas.component';
import { FounderComponent } from './admin/founder/founder.component';
import { FounderComponent as FounderProfileComponent } from './founder/founder.component';

export const routes: Routes = [
   // Authentication routes (no layout - full screen)
   { path: 'login', component: LoginComponent, title: 'Login - Investly' },
   { path: 'signup', component: SignupComponent, title: 'Sign Up - Investly' },
   { path: 'staff-login', component: LoginStaffComponent, title: 'Staff Login - Investly' },
   
   // Main public route with layout (navbar + footer)
   {
      path: '',
      component: MainLayoutComponent,
      children: [
         { path: '', component: LandingPageComponent, title: 'Investly - Home' },
         { path: 'profile', component: FounderProfileComponent, title: 'Profile - Investly' }
      ]
   },
   
   // Admin routes (protected, with their own layout)
   {
      path: 'admin',
      component: AdminComponent,
      canActivate: [adminGuard],
      children: [
         { path: 'investor', component: InvestorComponent, title: 'Investor Management - Investly' },
         { path: 'founder', component: FounderComponent, title: 'Founder Management - Investly' },
         { path: '', redirectTo: 'investor', pathMatch: 'full' }
      ]
   },

   // Wildcard route - must be last
   { path: '**', redirectTo: '', pathMatch: 'full' }
];
