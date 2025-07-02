import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Models and Services
import { ContactRequestStatus } from '../../_shared/enums';
import { DropdownDto } from '../../_models/user';
import { InvestorService } from '../../admin/_services/investor.service';
import { FounderService } from '../../admin/_services/founder.service';

interface ContactFormData {
  name: string;
  email: string;
  contactType: 'system_feedback' | 'investor_founder_feedback';
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
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  
  // Dropdown data for investor/founder selection
  availableContacts: DropdownDto[] = [];
  isLoadingContacts: boolean = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private investorService: InvestorService,
    private founderService: FounderService
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      contactType: ['system_feedback', Validators.required],
      targetPersonId: [null],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private setupFormSubscriptions(): void {
    // Watch for contact type changes
    const contactTypeSubscription = this.contactForm.get('contactType')?.valueChanges.subscribe(
      (contactType: string) => {
        if (contactType === 'investor_founder_feedback') {
          this.contactForm.get('targetPersonId')?.setValidators([Validators.required]);
          this.loadAvailableContacts();
        } else {
          this.contactForm.get('targetPersonId')?.clearValidators();
          this.availableContacts = [];
        }
        this.contactForm.get('targetPersonId')?.updateValueAndValidity();
        this.contactForm.get('targetPersonId')?.setValue(null);
      }
    );

    if (contactTypeSubscription) {
      this.subscriptions.add(contactTypeSubscription);
    }
  }

  private loadAvailableContacts(): void {
    this.isLoadingContacts = true;
    
    // In your implementation, you would need to load contacts that have accepted contact requests
    // For now, we'll load both investors and founders
    const investorSub = this.investorService.getInvestorsForDropdown().subscribe({
      next: (response) => {
        const investors = response.data.map(investor => ({
          ...investor,
          name: `${investor.name} (Investor)`
        }));
        
        // Load founders
        const founderSub = this.founderService.getFoundersForDropdown().subscribe({
          next: (founderResponse) => {
            const founders = founderResponse.data.map(founder => ({
              ...founder,
              name: `${founder.name} (Founder)`
            }));
            
            this.availableContacts = [...investors, ...founders];
            this.isLoadingContacts = false;
          },
          error: (error) => {
            console.error('Error loading founders:', error);
            this.availableContacts = investors;
            this.isLoadingContacts = false;
          }
        });
        
        this.subscriptions.add(founderSub);
      },
      error: (error) => {
        console.error('Error loading investors:', error);
        this.isLoadingContacts = false;
        this.toastr.error('Failed to load contact options', 'Error');
      }
    });
    
    this.subscriptions.add(investorSub);
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData: ContactFormData = this.contactForm.value;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Contact form submitted:', formData);
        
        this.toastr.success(
          'Your message has been sent successfully. We\'ll get back to you within 24 hours!',
          'Message Sent'
        );
        
        this.contactForm.reset();
        this.contactForm.get('contactType')?.setValue('system_feedback');
        this.isSubmitting = false;
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for template
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get contactType() { return this.contactForm.get('contactType'); }
  get targetPersonId() { return this.contactForm.get('targetPersonId'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }

  // Helper methods for template
  hasError(controlName: string, errorType: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control?.errors || !control?.touched) return '';

    const errors = control.errors;
    
    if (errors['required']) return `${this.getFieldLabel(controlName)} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `${this.getFieldLabel(controlName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.getFieldLabel(controlName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
    
    return 'Invalid input';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      contactType: 'Contact Type',
      targetPersonId: 'Contact Person',
      subject: 'Subject',
      message: 'Message'
    };
    return labels[controlName] || controlName;
  }
} 