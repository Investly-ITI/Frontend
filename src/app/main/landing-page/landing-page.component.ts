import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  // Featured investments data (like Wefunder)
  featuredInvestments = [
    {
      founder: 'Abdulrahman Ahmed',
      image: 'Me.jpg',
      invested: '2.4M EGP',
      investors: 1220,
      coinvestor: 'YCombinator'
    },
    {
      founder: 'Abdulrahman Abu-Elgheit', 
      image: 'AbuElgheit.jpg',
      invested: '3.8M EGP',
      investors: 2688,
      coinvestor: 'a16z'
    },
    {
      founder: 'Abanoub Magdy',
      image: 'Abanoub.jpg', 
      invested: '1.9M EGP',
      investors: 1948,
      coinvestor: 'Backstage Capital'
    },
    {
      founder: 'Aseel El-Sawy',
      image: 'Aseel.png',
      invested: '2.1M EGP', 
      investors: 1453,
      coinvestor: 'a16z'
    },
    {
      founder: 'Sarah Salem',
      image: 'Sarah.png',
      invested: '1.5M EGP',
      investors: 1125,
      coinvestor: 'FJ Labs'
    },
    {
      founder: 'Abdulrahman Ahmed',
      image: 'Me.jpg',
      invested: '950K EGP',
      investors: 896,
      coinvestor: 'Gaingels'
    },
    {
      founder: 'Abdulrahman Abu-Elgheit',
      image: 'AbuElgheit.jpg',
      invested: '2.8M EGP',
      investors: 1440,
      coinvestor: 'a16z'
    },
    {
      founder: 'Abanoub Magdy',
      image: 'Abanoub.jpg',
      invested: '680K EGP',
      investors: 574,
      coinvestor: 'M13'
    }
  ];

  // Second row of featured investments
  featuredInvestmentsRow2 = [
    {
      founder: 'Aseel El-Sawy',
      image: 'Aseel.png',
      invested: '1.7M EGP',
      investors: 1187,
      coinvestor: 'Sequoia Capital'
    },
    {
      founder: 'Sarah Salem',
      image: 'Sarah.png',
      invested: '3.2M EGP',
      investors: 2542,
      coinvestor: 'Kleiner Perkins'
    },
    {
      founder: 'Abdulrahman Ahmed',
      image: 'Me.jpg',
      invested: '1.3M EGP',
      investors: 932,
      coinvestor: 'Greylock Partners'
    },
    {
      founder: 'Abdulrahman Abu-Elgheit',
      image: 'AbuElgheit.jpg',
      invested: '4.1M EGP',
      investors: 3521,
      coinvestor: 'Benchmark'
    },
    {
      founder: 'Abanoub Magdy',
      image: 'Abanoub.jpg',
      invested: '820K EGP',
      investors: 687,
      coinvestor: 'First Round'
    },
    {
      founder: 'Aseel El-Sawy',
      image: 'Aseel.png',
      invested: '2.6M EGP',
      investors: 2210,
      coinvestor: 'Lightspeed'
    },
    {
      founder: 'Sarah Salem',
      image: 'Sarah.png',
      invested: '1.8M EGP',
      investors: 1543,
      coinvestor: 'NEA'
    },
    {
      founder: 'Abdulrahman Ahmed',
      image: 'Me.jpg',
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

  isUserLoggedIn(): boolean {
    return this.authService.getToken() !== null;
  }

  navigateToExplore() {
    this.router.navigate(['/explore']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
