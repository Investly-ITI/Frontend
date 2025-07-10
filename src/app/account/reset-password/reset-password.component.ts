import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { PasswordService } from '../../_services/password.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  isDarkMode = false;
  email: string = '';
  token: string = '';
  private unsubscribe: Subscription[] = [];

  // Carousel properties
  private carouselInterval: any;
  private currentSlideIndex = 3;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: AuthService,
    private toastr: ToastrService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\""{}|<>]).*$/)
      ]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (!this.email || !this.token) {
        this.toastr.error('Invalid password reset link', 'Error');
        this.router.navigate(['/request-reset']);
      }
    });

    this.checkDarkMode();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.email || !this.token) return;

    this.isLoading = true;
    const resetData = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
      confirmNewPassword: this.resetForm.value.confirmNewPassword
    };

    const sub = this.passwordService.resetPassword(resetData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.isSuccess = true;
            this.resetForm.reset();
            this.toastr.success('Password changed successfully', 'Success');
            setTimeout(() => this.router.navigate(['/login']), 3000);
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(
            err.error?.message || 'Failed to reset password', 
            'Error'
          );
        }
      });
    this.unsubscribe.push(sub);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  private checkDarkMode(): void {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const body = document.body;
    body.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    this.isDarkMode ? body.classList.add('dark') : body.classList.remove('dark');
    setTimeout(() => body.style.transition = '', 600);
  }

  private startCarousel(): void {
    this.carouselInterval = setInterval(() => this.nextSlide(), 2600);
  }

  private nextSlide(): void {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    
    slides[this.currentSlideIndex].classList.remove('active');
    this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
    slides[this.currentSlideIndex].classList.add('active');
  }
}