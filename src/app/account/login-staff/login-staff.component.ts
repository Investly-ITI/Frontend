import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../_services/auth.service';
import { UserLogin } from '../../_models/user';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { JwtService } from '../../_services/jwt.service';
import { Subscription } from 'rxjs';

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
  loginData: UserLogin = {
    email: "",
    password: ""
  }
  private  unsubscribe: Subscription[] = []; 

  constructor(private formBuilder: FormBuilder
    , private auth: AuthService
    , private toastr: ToastrService
    , private router: Router
    , private jwt:JwtService
  ) { }

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
      this.loginData = { ...this.loginForm.value }
      var sub = this.jwt.generateToken(this.loginData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastr.success(response.message, "Success");
            this.auth.login(response.data);
            setTimeout(() => {
              this.router.navigate(['admin/investor']);
            }, 1500);

          } else {
            this.toastr.error(response.message, "Error");
          }
        },error:(err)=>{
          this.toastr.error("something went wrong","Error");
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // Navigate to landing page when brand is clicked
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
