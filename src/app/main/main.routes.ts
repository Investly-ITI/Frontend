import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ExploreComponent } from './explore/explore.component';
import { IdeaDetailsComponent } from './idea-details/idea-details.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AboutUsComponent } from './about-us/about-us.component';

export const mainRoutes: Routes = [
  { path: '', component: LandingPageComponent, title: 'Investly - Home' },
  { path: 'explore', component: ExploreComponent, title: 'Explore Ideas - Investly' },
  { path: 'idea/:id', component: IdeaDetailsComponent, title: 'Business Idea Details - Investly' },
  { path: 'contact-us', component: ContactUsComponent, title: 'Contact Us - Investly' },
  { path: 'about-us', component: AboutUsComponent, title: 'About Us - Investly' }
];
