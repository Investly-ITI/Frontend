import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

interface TeamMember {
  name: string;
  position: string;
  image: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
}

interface CompanyValue {
  icon: string;
  title: string;
  description: string;
}

interface Statistic {
  number: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit, OnDestroy {
  
  // Animation and state management
  private subscriptions: Subscription = new Subscription();
  currentStatIndex = 0;
  
  // Company Statistics
  statistics: Statistic[] = [
    {
      number: '500+',
      label: 'Successful Investments',
      icon: 'bx bx-trending-up'
    },
    {
      number: '50M+',
      label: 'EGP Raised',
      icon: 'bx bx-dollar-circle'
    },
    {
      number: '1000+',
      label: 'Active Users',
      icon: 'bx bx-group'
    },
    {
      number: '95%',
      label: 'Success Rate',
      icon: 'bx bx-check-circle'
    },
    {
      number: '24/7',
      label: 'Support Available',
      icon: 'bx bx-support'
    }
  ];

  // Team Members
  teamMembers: TeamMember[] = [
    {
      name: 'Sarah Salem',
      position: 'CEO & Co-Founder',
      image: 'Businessmen.jpg',
      bio: 'Visionary leader with 10+ years in fintech and investment. Passionate about connecting Egyptian entrepreneurs with global opportunities.'
    },
    {
      name: 'Abdulrahman Ahmed',
      position: 'CTO & Co-Founder',
      image: 'Me.jpg',
      bio: 'Tech expert specializing in financial platforms. Committed to building secure, scalable solutions for the investment community.'
    },
    {
      name: 'Abanoub Magdy',
      position: 'Head of Investments',
      image: 'Handshake2.jpg',
      bio: 'Investment strategist with deep knowledge of Egyptian market dynamics. Helps match the right investors with promising startups.'
    },
    {
      name: 'Aseel El-Sawy',
      position: 'Head of Community',
      image: 'Cowork.jpg',
      bio: 'Community builder focused on creating meaningful connections. Ensures every user has a positive experience on our platform.'
    },
    {
      name: 'Abdulrahman Abu-Elgheit',
      position: 'Head of Community',
      image: 'Cowork.jpg',
      bio: 'Community builder focused on creating meaningful connections. Ensures every user has a positive experience on our platform.'
    }
  ];

  // Company Values
  companyValues: CompanyValue[] = [
    {
      icon: 'bx bx-rocket',
      title: 'Innovation First',
      description: 'We continuously innovate to provide cutting-edge solutions that empower entrepreneurs and investors to succeed.'
    },
    {
      icon: 'bx bx-heart',
      title: 'Community Driven',
      description: 'Our platform is built by the community, for the community. Every feature is designed with our users\' success in mind.'
    },
    {
      icon: 'bx bx-target-lock',
      title: 'Results Focused',
      description: 'We measure our success by the success of our users. Every connection made should lead to meaningful outcomes.'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setupStatisticsAnimation();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupStatisticsAnimation(): void {
    // Rotate through statistics every 3 secondssssssssssssssssssssssssssssssssssssssss
    const statAnimation = interval(3000).subscribe(() => {
      this.currentStatIndex = (this.currentStatIndex + 1) % this.statistics.length;
    });
    
    this.subscriptions.add(statAnimation);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact-us']);
  }

  navigateToExplore(): void {
    this.router.navigate(['/explore']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  // Helper method to get current highlighted statistic
  getCurrentStat(): Statistic {
    return this.statistics[this.currentStatIndex];
  }

  // Helper method to check if a stat is currently highlighted
  isCurrentStat(index: number): boolean {
    return index === this.currentStatIndex;
  }
} 