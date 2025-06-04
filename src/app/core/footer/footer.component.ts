import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isDarkMode = false;
  showScrollButton = false;

  socialLinks = [
    { name: 'Facebook', icon: 'bx bxl-facebook', url: '#' },
    { name: 'Twitter', icon: 'bx bxl-twitter', url: '#' },
    { name: 'LinkedIn', icon: 'bx bxl-linkedin', url: '#' },
    { name: 'Instagram', icon: 'bx bxl-instagram', url: '#' }
  ];

  companyLinks = [
    { name: 'About Us', route: '/about' },
    { name: 'Careers', route: '/careers' },
    { name: 'Press', route: '/press' },
    { name: 'Blog', route: '/blog' }
  ];

  legalLinks = [
    { name: 'Privacy Policy', route: '/privacy' },
    { name: 'Terms of Service', route: '/terms' },
    { name: 'Cookie Policy', route: '/cookies' },
    { name: 'Legal Notice', route: '/legal' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show scroll button when user scrolls down more than 300px
    this.showScrollButton = window.pageYOffset > 300;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
