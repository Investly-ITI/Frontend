import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserLogin } from '../../_models/user';
import { JwtService } from '../../_services/jwt.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../_services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  isDarkMode = false;
  loginData: UserLogin = {
    email: "",
    password: ""
  };
  private unsubscribe: Subscription[] = [];

  // Carousel properties
  private carouselInterval: any;
  private currentSlideIndex = 3;
  private readonly carouselImages = [
    'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ];

  constructor(private formBuilder: FormBuilder
    , private jwt: JwtService
    , private toastr: ToastrService
    , private router: Router
    , private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.checkDarkMode();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
      //, rememberMe: [false]
    });
  }

  private checkDarkMode(): void {
    // Check if dark mode is stored in localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    this.applyTheme();
  }

  private startCarousel(): void {
    // Start carousel auto-switching every 2 seconds
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 2600);
  }

  private nextSlide(): void {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    // Remove active class from current slide
    slides[this.currentSlideIndex].classList.remove('active');

    // Move to next slide
    this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;

    // Add active class to new slide
    slides[this.currentSlideIndex].classList.add('active');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const body = document.body;

    // Add transition class for smooth animation
    body.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    if (this.isDarkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }

    // Remove transition after animation completes
    setTimeout(() => {
      body.style.transition = '';
    }, 600);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.loginData = { ...this.loginForm.value }
      var sub = this.jwt.generateToken(this.loginData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastr.success(response.message, "Success");
            this.auth.login(response.data);
            setTimeout(() => {
              //this.router.navigate(['admin/investor']);
            }, 1500);

          } else {
            this.toastr.error(response.message, "Error");
          }
        }, error: (err) => {
          this.toastr.error("something went wrong", "Error");
        }
      })
      this.unsubscribe.push(sub);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Navigate to landing page when brand is clicked
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
