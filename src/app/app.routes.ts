import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { InvestorComponent } from './admin/investor/investor.component';
import { LoginComponent } from './account/login/login.component';
import { LoginStaffComponent } from './account/login-staff/login-staff.component';
import { SignupComponent } from './account/signup/signup.component';
import { adminGuard } from './_guards/admin.guard';
import { BusinessIdeasComponent } from './admin/business-ideas/business-ideas.component';

export const routes: Routes = [

   {path:'login', component: LoginComponent, title: 'Login - Investly'},
   {path:'signup', component: SignupComponent, title: 'Sign Up - Investly'},
   {path:'staff-login', component: LoginStaffComponent, title: 'Staff Login - Investly'}, // Using existing component for now
   
   
   {path:'admin',component: AdminComponent,canActivate:[adminGuard], children:[

      {path:'investor',component:InvestorComponent, title: 'Investor Management'},
      {path:'business-ideas',component:BusinessIdeasComponent, title: 'Business Ideas Management'},
      {path:'',redirectTo:'investor',pathMatch:'full'},

   ]},

   {path:'',redirectTo:'/login',pathMatch:'full'},
   // { path: '**', redirectTo: '/admin' } // Wildcard route when no matching route is found


];
