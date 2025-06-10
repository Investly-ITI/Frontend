import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private carouselInterval: any;
  private investmentCardsInterval: any;
  currentInvestmentSetIndex = 0;

  // Featured investments data (like Wefunder)
  featuredInvestments = [
    {
      founder: 'Ahmed Mohamed Ali',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      invested: '2.4M EGP',
      investors: 1220,
      coinvestor: 'YCombinator'
    },
    {
      founder: 'Mohamed Ahmed Hassan', 
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
      invested: '3.8M EGP',
      investors: 2688,
      coinvestor: 'a16z'
    },
    {
      founder: 'Fatima Abd El-Rahman',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face', 
      invested: '1.9M EGP',
      investors: 1948,
      coinvestor: 'Backstage Capital'
    },
    {
      founder: 'Omar Khaled Selim',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      invested: '2.1M EGP', 
      investors: 1453,
      coinvestor: 'a16z'
    },
    {
      founder: 'Nora Ibrahim',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      invested: '1.5M EGP',
      investors: 1125,
      coinvestor: 'FJ Labs'
    },
    {
      founder: 'Youssef Adel Mansour',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      invested: '950K EGP',
      investors: 896,
      coinvestor: 'Gaingels'
    },
    {
      founder: 'Mariam Saad El-Din',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      invested: '2.8M EGP',
      investors: 1440,
      coinvestor: 'a16z'
    },
    {
      founder: 'Karim Tarek Fouad',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      invested: '680K EGP',
      investors: 574,
      coinvestor: 'M13'
    }
  ];

  // Second row of featured investments
  featuredInvestmentsRow2 = [
    {
      founder: 'Yasmin Mahmoud',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      invested: '1.7M EGP',
      investors: 1187,
      coinvestor: 'Sequoia Capital'
    },
    {
      founder: 'Hossam El-Din Ahmed',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face',
      invested: '3.2M EGP',
      investors: 2542,
      coinvestor: 'Kleiner Perkins'
    },
    {
      founder: 'Dina Abd El-Aziz',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      invested: '1.3M EGP',
      investors: 932,
      coinvestor: 'Greylock Partners'
    },
    {
      founder: 'Moataz Salah Abdo',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
      invested: '4.1M EGP',
      investors: 3521,
      coinvestor: 'Benchmark'
    },
    {
      founder: 'Nada Ramadan Ali',
      image: 'https://images.unsplash.com/photo-1567532900872-f4e906cbf06a?w=150&h=150&fit=crop&crop=face',
      invested: '820K EGP',
      investors: 687,
      coinvestor: 'First Round'
    },
    {
      founder: 'Khaled Wael Mohamed',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      invested: '2.6M EGP',
      investors: 2210,
      coinvestor: 'Lightspeed'
    },
    {
      founder: 'Sara Emad El-Din',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
      invested: '1.8M EGP',
      investors: 1543,
      coinvestor: 'NEA'
    },
    {
      founder: 'Adham Abdullah',
      image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
      invested: '3.5M EGP',
      investors: 2898,
      coinvestor: 'Accel Partners'
    }
  ];

  // Statistics for the hero section
  platformStats = {
    totalRaised: '912M',
    foundersSupported: '3,660',
    investors: '1M+',
    medianInvestment: '250 EGP',
    successfulExits: '480',
    avgRate: '24%'
  };

  // Hero carousel images
  heroImages = [
    'Handshake2.jpg',
    'Handshake.jpg',
    'Cowork.jpg',
    'Businessmen.jpg'
  ];

  currentHeroImageIndex = 0;

  ngOnInit() {
    this.startCarousel();
    this.startInvestmentCardsRotation();
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.investmentCardsInterval) {
      clearInterval(this.investmentCardsInterval);
    }
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.currentHeroImageIndex = (this.currentHeroImageIndex + 1) % this.heroImages.length;
    }, 5000);
  }

  startInvestmentCardsRotation() {
    // Continuous scrolling will be handled by CSS animation
  }

  getCurrentInvestments() {
    return this.featuredInvestments;
  }

  navigateToExplore() {
    // Will be implemented with router navigation
  }

  navigateToSignup() {
    // Will be implemented with router navigation
  }
}
