import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-reset-password-request',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-reset-password.component.html',
  styleUrl: './request-reset-password.component.css'
})
export class ResetPasswordRequestComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  isLoading = false;
  isDarkMode = false;
  isSuccess = false;
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private passwordService: AuthService,
    private toastr: ToastrService
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
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private checkDarkMode(): void {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    this.applyTheme();
  }

  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 2600);
  }

  private nextSlide(): void {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    slides[this.currentSlideIndex].classList.remove('active');
    this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
    slides[this.currentSlideIndex].classList.add('active');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const body = document.body;
    body.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    if (this.isDarkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }

    setTimeout(() => {
      body.style.transition = '';
    }, 600);
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.isSuccess = false;
      
      const sub = this.passwordService.requestPasswordReset(this.resetForm.value.email).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.isSuccess = true;
            this.resetForm.reset();
          } else {
            this.toastr.error(response.message, "Error");
          }
        },
        error: (err) => {
          this.isLoading = false;
          const errorMsg = err.error?.message || "Something went wrong. Please try again.";
          this.toastr.error(errorMsg, "Error");
        }
      });
      
      this.unsubscribe.push(sub);
    } else {
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}