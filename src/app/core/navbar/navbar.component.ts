import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isIdeasDropdownOpen = false;
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Navbar initialization (theme is now handled by footer component)
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
}
