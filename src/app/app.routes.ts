import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { InvestorComponent } from './admin/investor/investor.component';

export const routes: Routes = [

   {path:'admin',component: AdminComponent,children:[

      {path:'investor',component:InvestorComponent, title: 'Investor Management'},
      {path:'',redirectTo:'investor',pathMatch:'full'},

   ]},

   {path:'',redirectTo:'/admin/investor',pathMatch:'full'},
   // { path: '**', redirectTo: '/admin' } // Wildcard route when no matching route is found


];
