import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { LoggedInUser } from '../../_models/user';
import { UserType } from '../../_shared/enums';
import { Subscription } from 'rxjs';

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
  UserType = UserType; // Expose enum to template
  
  // Profile notification indicator
  showProfileAlert = true; // Set to true to show red exclamation mark
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to authentication state
    const authSub = this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
    
    // Subscribe to current user data
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
    // For now, return a default profile picture
    // You can modify this to return actual user profile picture URL from user data
    // If user has a profile picture, use: this.currentUser?.profilePicture || fallback
    return 'Me.jpg'; // Using existing image from public folder as default
  }

  // Navigate to notifications section in founder profile
  navigateToNotifications(): void {
    // Navigate to notifications for all authenticated users
    if (this.isAuthenticated && this.currentUser) {
      this.router.navigate(['/profile'], { queryParams: { section: 'notifications' } });
    }
    
    this.closeDropdowns();
    this.isMobileMenuOpen = false;
  }

  // Get total notifications count (mock data for now)
  getTotalNotificationsCount(): number {
    // Check if user is currently viewing notifications section
    const currentUrl = this.router.url;
    const isOnNotificationsSection = currentUrl.includes('/profile') && currentUrl.includes('section=notifications');
    
    // If viewing notifications, return 0 since all notifications are marked as read
    if (isOnNotificationsSection) {
      return 0;
    }
    
    // TODO: Replace with actual notification service call
    // For now, return unread notifications count (mock: 2 unread out of 4 total)
    return 2; // Mock unread notification count
  }
}
