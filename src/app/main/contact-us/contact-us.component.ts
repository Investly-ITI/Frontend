import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, Subscription, take, takeUntil, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Models and Services
import { DropdownDto, LoggedInUser } from '../../_models/user';
import { InvestorService } from '../../admin/_services/investor.service';
import { FounderService } from '../../admin/_services/founder.service';
import { UserFeedbackService } from '../../_services/user-feedback-service.service';
import { AuthService } from '../../_services/auth.service';
import { FeedbackCreateDto, FeedbackTargetType } from '../../_models/feedback';
import { UserType } from '../../_shared/enums';
import { Subject } from 'rxjs';
import { ProfileService as InvestorProfileService } from '../../investor/_services/profile.service';
import { ProfileService as FounderProfileService } from '../../founder/_services/profile.service';

interface Response<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

interface ContactFormData {
  email: string;
  contactType: FeedbackTargetType;
  targetPersonId?: number;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isSubmitting: boolean = false;
  
  private destroy$ = new Subject<void>();
  availableContacts: DropdownDto[] = [];
  isLoadingContacts: boolean = false;
  isAuthenticated: boolean = false;
  
  private subscriptions: Subscription = new Subscription();
  feedbackTypes = [
    { value: FeedbackTargetType.System, label: 'System Feedback' },
    { value: FeedbackTargetType.Investor, label: 'Investor Feedback' },
    { value: FeedbackTargetType.Founder, label: 'Founder Feedback' }
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    // private investorService: InvestorService,
    // private founderService: FounderService,
    private feedbackService: UserFeedbackService,
    private authService: AuthService,
    private investorProfileService: InvestorProfileService,
    private founderProfileService: FounderProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.contactForm = this.createForm();
  }

  public FeedbackTargetType = FeedbackTargetType;
  public showFeedbackTypeSelect = false;
  public UserType = UserType;
  public currentUser: LoggedInUser | null = null;

  ngOnInit(): void {
    this.setupAuthSubscriptions();
    this.setupFormSubscriptions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: [{ value: '', disabled: !this.isAuthenticated }, [Validators.required, Validators.email]],
      contactType: [{ value: FeedbackTargetType.System, disabled: !this.isAuthenticated }, Validators.required],
      targetPersonId: [{ value: null, disabled: false }],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private setupAuthSubscriptions(): void {
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.updateFormForAuthState();
        this.updateEmailFieldState();
      })
    );

    this.subscriptions.add(
      this.authService.CurrentUser$.subscribe(user => {
        this.currentUser = user;
        this.updateAvailableFeedbackTypes();
        const currentType = this.contactForm.get('contactType')?.value;
        if (currentType && currentType !== FeedbackTargetType.System) {
          this.loadAvailableContacts(currentType);
        }
      })
    );
  }

  private setupFormSubscriptions(): void {
    const contactTypeControl = this.contactForm.get('contactType');
    if (!contactTypeControl) return;

    this.subscriptions.add(
      contactTypeControl.valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe((type: FeedbackTargetType) => {
        this.availableContacts = [];
        this.contactForm.get('targetPersonId')?.reset(null, { emitEvent: false });

        const targetPersonControl = this.contactForm.get('targetPersonId');
        if (type !== FeedbackTargetType.System) {
          targetPersonControl?.setValidators([Validators.required]);
          this.loadAvailableContacts(type);
        } else {
          targetPersonControl?.clearValidators();
        }
        targetPersonControl?.updateValueAndValidity();
        this.cdr.detectChanges();
      })
    );
  }

  private updateAvailableFeedbackTypes(): void {
    if (!this.currentUser) {
      this.feedbackTypes = [{ value: FeedbackTargetType.System, label: 'System Feedback' }];
      return;
    }

    switch (this.currentUser.userType) {
      case UserType.Investor:
        this.feedbackTypes = [
          { value: FeedbackTargetType.System, label: 'System Feedback' },
          { value: FeedbackTargetType.Founder, label: 'Founder Feedback' }
        ];
        break;
      case UserType.Founder:
        this.feedbackTypes = [
          { value: FeedbackTargetType.System, label: 'System Feedback' },
          { value: FeedbackTargetType.Investor, label: 'Investor Feedback' }
        ];
        break;
      default:
        this.feedbackTypes = [
          { value: FeedbackTargetType.System, label: 'System Feedback' },
          { value: FeedbackTargetType.Investor, label: 'Investor Feedback' },
          { value: FeedbackTargetType.Founder, label: 'Founder Feedback' }
        ];
    }

    const currentType = this.contactForm.get('contactType')?.value;
    if (!this.feedbackTypes.some(t => t.value === currentType)) {
      this.contactForm.get('contactType')?.setValue(FeedbackTargetType.System);
    }
  }

  private loadAvailableContacts(feedbackType: FeedbackTargetType): void {
    this.isLoadingContacts = true;
    this.availableContacts = [];

    if (feedbackType === FeedbackTargetType.Investor) {
      this.loadInvestors();
    } else if (feedbackType === FeedbackTargetType.Founder) {
      this.loadFounders();
    } else {
      this.isLoadingContacts = false;
    }
  }

  private loadInvestors(): void {
    this.investorProfileService.getInvestorsForDropdown().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.availableContacts = response.data.map(investor => ({
            id: investor.id,
            name: `${investor.name} (Investor)`
          }));
        } else {
          this.availableContacts = [];
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Failed to load investors', 'Error');
          }
        }
        this.isLoadingContacts = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingContacts = false;
        this.availableContacts = [];
        this.toastr.error('Failed to load investors', 'Error');
      }
    });
  }

  private loadFounders(): void {
    this.founderProfileService.getFoundersForDropdown().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.availableContacts = response.data.map(founder => ({
            id: founder.id,
            name: `${founder.name} (Founder)`
          }));
        } else {
          this.availableContacts = [];
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Failed to load founders', 'Error');
          }
        }
        this.isLoadingContacts = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingContacts = false;
        this.availableContacts = [];
        this.toastr.error('Failed to load founders', 'Error');
      }
    });
  }

  private updateFormForAuthState(): void {
    const contactTypeControl = this.contactForm.get('contactType');
    if (!contactTypeControl) return;

    if (this.isAuthenticated) {
      this.showFeedbackTypeSelect = true;
      contactTypeControl.enable({ emitEvent: false });
    } else {
      this.showFeedbackTypeSelect = false;
      contactTypeControl.setValue(FeedbackTargetType.System, { emitEvent: false });
      contactTypeControl.disable({ emitEvent: false });
    }
  }

  private updateEmailFieldState(): void {
    const emailControl = this.contactForm.get('email');
    if (!emailControl) return;

    if (this.isAuthenticated) {
      this.authService.CurrentUser$.pipe(
        take(1),
        takeUntil(this.destroy$)
      ).subscribe(user => {
        if (user?.email) {
          emailControl.setValue(user.email, { emitEvent: false });
          emailControl.disable({ emitEvent: false });
        }
      });
    } else {
      emailControl.enable({ emitEvent: false });
      if (!emailControl.value) {
        emailControl.setValue('', { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.contactForm.getRawValue();
      const feedbackDto = this.mapFormToFeedbackDto(formData);
      
      this.feedbackService.createFeedback(feedbackDto).subscribe({
        next: (response) => {
          this.toastr.success('Your feedback has been submitted successfully!', 'Feedback Sent');
          this.contactForm.reset({
            contactType: FeedbackTargetType.System,
            email: this.isAuthenticated ? this.contactForm.get('email')?.value : ''
          });
          if (this.isAuthenticated) {
            this.contactForm.get('email')?.disable();
          }
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to submit feedback', 'Error');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private mapFormToFeedbackDto(formData: ContactFormData): FeedbackCreateDto {
    return {
      email: formData.email,
      subject: formData.subject,
      description: formData.message,
      feedbackType: formData.contactType,
      userIdTo: formData.contactType === FeedbackTargetType.System ? null : formData.targetPersonId,
      status: 1
    };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }

  // Template getters
  get email() { return this.contactForm.get('email'); }
  get contactType() { return this.contactForm.get('contactType'); }
  get targetPersonId() { return this.contactForm.get('targetPersonId'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control?.errors || !control?.touched) return '';

    if (control.errors['required']) return `${this.getFieldLabel(controlName)} is required`;
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) return `${this.getFieldLabel(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `${this.getFieldLabel(controlName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
    
    return 'Invalid input';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      contactType: 'Feedback Type',
      targetPersonId: 'Contact Person',
      subject: 'Subject',
      message: 'Message'
    };
    return labels[controlName] || controlName;
  }
}