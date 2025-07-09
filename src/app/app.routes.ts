import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { InvestorComponent } from './admin/investor/investor.component';
import { LoginComponent } from './account/login/login.component';
import { ResetPasswordRequestComponent } from './account/request-reset-password/request-reset-password.component';
import { LoginStaffComponent } from './account/login-staff/login-staff.component';
import { SignupComponent } from './account/signup/signup.component';
import { LandingPageComponent } from './main/landing-page/landing-page.component';
import { ExploreComponent } from './main/explore/explore.component';
import { IdeaDetailsComponent } from './main/idea-details/idea-details.component';
import { ContactUsComponent } from './main/contact-us/contact-us.component';
import { AboutUsComponent } from './main/about-us/about-us.component';
import { MainLayoutComponent } from './_shared/components/main-layout.component';
import { adminGuard } from './_guards/admin.guard';
import { BusinessIdeasComponent } from './admin/business-ideas/business-ideas.component';
import { FounderComponent } from './admin/founder/founder.component';
import { FounderComponent as FounderProfileComponent } from './founder/founder.component';
import { InvestorComponent as InvestorProfileComponent } from './investor/investor.component';
import { NotificationsComponent } from './admin/notifications/notifications.component';
import { ContactRequestComponent } from './admin/contact-request/contact-request.component';
import { NoAuthGuard } from './_guards/no-auth.guard';
import { clientGuard } from './_guards/client.guard';
import { FeedbacksComponent } from './admin/feedback/feedback.component';
import { AnalysisComponent } from './admin/analysis/analysis.component';

export const routes: Routes = [
   // Authentication routes (no layout - full screen)
   { path: 'login', canActivate:[NoAuthGuard], component: LoginComponent, title: 'Login - Investly' },
   { path: 'request-reset', canActivate: [NoAuthGuard],component: ResetPasswordRequestComponent, title: 'Reset Password - Investly' }, 
  { path: 'signup',canActivate:[NoAuthGuard], component: SignupComponent, title: 'Sign Up - Investly' },
   { path: 'staff-login', component: LoginStaffComponent, title: 'Staff Login - Investly' },
   
   // Main public route with layout (navbar + footer)
   {
      path: '',
      component: MainLayoutComponent,
      children: [
         { path: '', component: LandingPageComponent, title: 'Investly - Home' },
         { path: 'founder/profile',canActivate:[clientGuard], component: FounderProfileComponent, title: 'Profile - Investly' },
         { path: 'investor/profile',canActivate:[clientGuard], component: InvestorProfileComponent, title: 'Profile - Investly' },
         { path: 'explore', component: ExploreComponent, title: 'Explore Ideas - Investly' },
         { path: 'idea/:id', component: IdeaDetailsComponent, title: 'Business Idea Details - Investly' },
         { path: 'contact-us', component: ContactUsComponent, title: 'Contact Us - Investly' },
         { path: 'about-us', component: AboutUsComponent, title: 'About Us - Investly' },
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
      {path:'analysis',component:AnalysisComponent, title: 'Dashboard Analysis'}
]},

   {path:'',redirectTo:'/login',pathMatch:'full'},
   // { path: '**', redirectTo: '/admin' } // Wildcard route when no matching route is found


   // Wildcard route - must be last
   { path: '**', redirectTo: '', pathMatch: 'full' }
];
