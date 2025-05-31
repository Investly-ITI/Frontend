import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-staff',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-staff.component.html',
  styleUrl: './login-staff.component.css'
})
export class LoginStaffComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  isDarkMode = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkDarkMode();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private checkDarkMode(): void {
    // Check if dark mode is stored in localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    this.applyTheme();
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
    
    // Remove transition after animation completes to avoid performance issues
    setTimeout(() => {
      body.style.transition = '';
    }, 600);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Staff Login form submitted:', this.loginForm.value);
        this.isLoading = false;
        // Here you would call an authentication service for staff
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
