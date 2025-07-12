import { Routes } from '@angular/router';
import { InvestorComponent } from './investor.component';

export const investorRoutes: Routes = [
  {
    path: '',
    component: InvestorComponent,
    children: [
      // { path: 'idea-requests', loadComponent: () => import('./investor-idea-requests/investor-idea-requests.component').then(c => c.InvestorIdeaRequestsComponent) },
      // { path: 'information', loadComponent: () => import('./investor-information/investor-information.component').then(c => c.InvestorInformationComponent) },
      // { path: 'notifications', loadComponent: () => import('./investor-notifications/investor-notifications.component').then(c => c.InvestorNotificationsComponent) },
      // { path: 'security', loadComponent: () => import('./investor-security/investor-security.component').then(c => c.InvestorSecurityComponent) },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
