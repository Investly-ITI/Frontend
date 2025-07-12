import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { InvestorComponent } from './investor/investor.component';
import { BusinessIdeasComponent } from './business-ideas/business-ideas.component';
import { FounderComponent } from './founder/founder.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ContactRequestComponent } from './contact-request/contact-request.component';
import { FeedbacksComponent } from './feedback/feedback.component';
import { CategoriesComponent } from './categories/categories.component';
import { AnalysisComponent } from './analysis/analysis.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'investor', component: InvestorComponent, title: 'Investor Management' },
      { path: 'business-ideas', component: BusinessIdeasComponent, title: 'Business Ideas Management' },
      { path: 'categories', component: CategoriesComponent, title: 'Categories Management' },
      { path: 'founder', component: FounderComponent, title: 'Founder Management' },
      { path: 'notification', component: NotificationsComponent, title: 'Notification Management' },
      { path: 'feedbacks', component: FeedbacksComponent, title: 'Feedbacks Management' },
      { path: 'Contact-Request', component: ContactRequestComponent, title: 'Investor Contact Request' },
      { path: 'analysis', component: AnalysisComponent, title: 'Dashboard Analysis' },
      { path: '', redirectTo: 'investor', pathMatch: 'full' }
    ]
  }
];
