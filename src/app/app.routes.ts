import { Routes } from '@angular/router';
import { MainLayoutComponent } from './_shared/components/main-layout.component';
import { adminGuard } from './_guards/admin.guard';
import { NoAuthGuard } from './_guards/no-auth.guard';
import { clientGuard } from './_guards/client.guard';

export const routes: Routes = [
   // Authentication routes (lazy loaded)
   { 
     path: 'login', 
     canActivate: [NoAuthGuard], 
     loadComponent: () => import('./account/login/login.component').then(c => c.LoginComponent),
     title: 'Login - Investly' 
   },
   { 
     path: 'signup',
     canActivate: [NoAuthGuard], 
     loadComponent: () => import('./account/signup/signup.component').then(c => c.SignupComponent),
     title: 'Sign Up - Investly' 
   },
   { 
     path: 'staff-login', 
     loadComponent: () => import('./account/login-staff/login-staff.component').then(c => c.LoginStaffComponent),
     title: 'Staff Login - Investly' 
   },
   
   // Main public route with layout (navbar + footer)
   {
      path: '',
      component: MainLayoutComponent,
      children: [
         { 
           path: '', 
           loadComponent: () => import('./main/landing-page/landing-page.component').then(c => c.LandingPageComponent),
           title: 'Investly - Home' 
         },
         { 
           path: 'founder/profile',
           canActivate: [clientGuard], 
           loadChildren: () => import('./founder/founder.routes').then(r => r.founderRoutes),
           title: 'Profile - Investly' 
         },
         { 
           path: 'investor/profile',
           canActivate: [clientGuard], 
           loadChildren: () => import('./investor/investor.routes').then(r => r.investorRoutes),
           title: 'Profile - Investly' 
         },
         { 
           path: 'explore', 
           loadComponent: () => import('./main/explore/explore.component').then(c => c.ExploreComponent),
           title: 'Explore Ideas - Investly' 
         },
         { 
           path: 'idea/:id', 
           loadComponent: () => import('./main/idea-details/idea-details.component').then(c => c.IdeaDetailsComponent),
           title: 'Business Idea Details - Investly' 
         },
         { 
           path: 'contact-us', 
           loadComponent: () => import('./main/contact-us/contact-us.component').then(c => c.ContactUsComponent),
           title: 'Contact Us - Investly' 
         },
         { 
           path: 'about-us', 
           loadComponent: () => import('./main/about-us/about-us.component').then(c => c.AboutUsComponent),
           title: 'About Us - Investly' 
         },
         { 
           path: 'profile',
           canActivate: [clientGuard], 
           loadChildren: () => import('./founder/founder.routes').then(r => r.founderRoutes),
           title: 'Profile - Investly' 
         }
      ]
   },
   
   // Admin routes (protected, lazy loaded)
   {
     path: 'admin',
     canActivate: [adminGuard], 
     loadChildren: () => import('./admin/admin.routes').then(r => r.adminRoutes)
   },

   { path: '', redirectTo: '/login', pathMatch: 'full' },
   
   // Wildcard route - must be last
   { path: '**', redirectTo: '', pathMatch: 'full' }
];
