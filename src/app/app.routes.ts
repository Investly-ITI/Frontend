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
import { NotificationsComponent } from './admin/notifications/notifications.component';
import { ContactRequestComponent } from './admin/contact-request/contact-request.component';
import { NoAuthGuard } from './_guards/no-auth.guard';
import { clientGuard } from './_guards/client.guard';
import { FeedbacksComponent } from './admin/feedback/feedback.component';

export const routes: Routes = [
   // Authentication routes (no layout - full screen)
   { path: 'login', canActivate:[NoAuthGuard], component: LoginComponent, title: 'Login - Investly' },
   { path: 'signup',canActivate:[NoAuthGuard], component: SignupComponent, title: 'Sign Up - Investly' },
   { path: 'staff-login', component: LoginStaffComponent, title: 'Staff Login - Investly' },
   
   // Main public route with layout (navbar + footer)
   {
      path: '',
      component: MainLayoutComponent,
      children: [
         { path: '', component: LandingPageComponent, title: 'Investly - Home' },
         { path: 'profile',canActivate:[clientGuard], component: FounderProfileComponent, title: 'Profile - Investly' }
      ]
   },
   
   // Admin routes (protected, with their own layout)
 
   {path:'admin',component: AdminComponent,canActivate:[adminGuard], children:[

      {path:'investor',component:InvestorComponent, title: 'Investor Management'},
      {path:'business-ideas',component:BusinessIdeasComponent, title: 'Business Ideas Management'},
      {path:'',redirectTo:'investor',pathMatch:'full'},
      {path:'founder',component:FounderComponent, title: 'Founder Management'},
       {path:'notification',component:NotificationsComponent, title: 'Notifcation Management'},
       {path:'feedbacks',component:FeedbacksComponent, title: 'Feedbacks Management'},
      
      {path:'Contact-Request',component:ContactRequestComponent, title: 'Investor Contact Request'},
     

   ]},

   {path:'',redirectTo:'/login',pathMatch:'full'},
   // { path: '**', redirectTo: '/admin' } // Wildcard route when no matching route is found


   // Wildcard route - must be last
   { path: '**', redirectTo: '', pathMatch: 'full' }
];
