import { Routes } from '@angular/router';
import { FounderComponent } from './founder.component';

export const founderRoutes: Routes = [
  {
    path: '',
    component: FounderComponent,
    children: [
      // { path: 'ideas', loadComponent: () => import('./founder-ideas/founder-ideas.component').then(c => c.FounderIdeasComponent) },
      // { path: 'information', loadComponent: () => import('./founder-information/founder-information.component').then(c => c.FounderInformationComponent) },
      // { path: 'notifications', loadComponent: () => import('./founder-notifications/founder-notifications.component').then(c => c.FounderNotificationsComponent) },
      // { path: 'security', loadComponent: () => import('./founder-security/founder-security.component').then(c => c.FounderSecurityComponent) },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
