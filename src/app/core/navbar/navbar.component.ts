import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { LoggedInUser } from '../../_models/user';
import { UserType,Status } from '../../_shared/enums';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isIdeasDropdownOpen = false;
  isMobileMenuOpen = false;
  isAuthenticated = false;
  currentUser: LoggedInUser | null = null;
  UserType = UserType; 
  Status=Status
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const authSub = this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
    
    const userSub = this.authService.CurrentUser$.subscribe(
      user => this.currentUser = user
    );
    
    this.subscriptions.push(authSub, userSub);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // Check if we're in mobile mode (768px and below)
    const isMobile = window.innerWidth <= 768;
    
    // For both mobile and desktop: keep dropdown open only when clicking in Ideas area
    const ideasSection = target.closest('.dropdown');
    
    if (isMobile) {
      // Close mobile menu if clicking outside navbar
      const navbar = target.closest('.navbar');
      if (!navbar) {
        this.isMobileMenuOpen = false;
      }
    }
    
    // Close Ideas dropdown if clicking outside Ideas section (for both mobile and desktop)
    if (!ideasSection) {
      this.closeDropdowns();
    }
  }

  toggleIdeasDropdown() {
    this.isIdeasDropdownOpen = !this.isIdeasDropdownOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeDropdowns() {
    this.isIdeasDropdownOpen = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeDropdowns();
    this.isMobileMenuOpen = false;
  }

  navigateToProfile(section: string, tab?: string) {
    const queryParams: any = { section };
    if (tab) {
      queryParams.tab = tab;
    }
    
    this.router.navigate(['/profile'], { queryParams });
    this.closeDropdowns();
    this.isMobileMenuOpen = false;
  }

  // Navigate to founder/profile when profile picture is clicked
  onProfilePictureClick() {
    if (this.currentUser?.userType === UserType.Founder) {
      this.router.navigate(['/profile']);
    } else {
      // For other user types, you can implement different navigation logic
      this.router.navigate(['/profile']);
    }
    this.closeDropdowns();
    this.isMobileMenuOpen = false;
  }

  // Logout functionality
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeDropdowns();
    this.isMobileMenuOpen = false;
  }

  // Get user profile picture URL
  getProfilePictureUrl(): string {
     if(this.currentUser?.profilePicPath!=null &&this.currentUser?.profilePicPath!='' &&this.currentUser?.profilePicPath!=undefined){
      return environment.apiUrl+"/"+this.currentUser.profilePicPath
     }else{
       return 'Me.png'; 
     }
  }
}
