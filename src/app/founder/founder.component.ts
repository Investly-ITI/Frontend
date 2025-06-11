import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FounderInformationComponent } from './founder-information/founder-information.component';
import { FounderSecurityComponent } from './founder-security/founder-security.component';
import { FounderIdeasComponent } from './founder-ideas/founder-ideas.component';
import { FounderNotificationsComponent } from './founder-notifications/founder-notifications.component';

interface ProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    countryCode: string;
    phoneNumber: string;
    street: string;
    government: string;
    city: string;
    nationalId: string;
    gender: string;
    profilePicture: string;
  };
  securitySettings: {
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    loginAlerts: boolean;
    lastPasswordChange: string;
    accountStatus: 'active' | 'suspended' | 'pending';
  };

  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

@Component({
  selector: 'app-founder',
  imports: [
    CommonModule, 
    FounderInformationComponent, 
    FounderSecurityComponent, 
    FounderIdeasComponent, 
    FounderNotificationsComponent
  ],
  templateUrl: './founder.component.html',
  styleUrl: './founder.component.css'
})
export class FounderComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('founderIdeas') founderIdeasComponent!: FounderIdeasComponent;

  activeSection: 'information' | 'security' | 'ideas' | 'notifications' = 'information';
  ideasCount: number = 0;
  
  // Security alert indicator
  showSecurityAlert = true; // Set to true to show red exclamation mark next to Security
  
  profileData: ProfileData = {
    personalInfo: {
      firstName: 'Abdulrhman',
      lastName: 'Ahmed',
      email: 'abdulrhman.ahmed@example.com',
      dateOfBirth: '1990-03-22',
      countryCode: '+20',
      phoneNumber: '1012345678',
      street: '15 Ahmed Shawqi Street, Roushdy',
      government: 'Dakahlia',
      city: 'Mansoura',
      nationalId: '28803221234567',
      gender: 'male',
      profilePicture: 'Me.jpg',
    },
    securitySettings: {
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      loginAlerts: true,
      lastPasswordChange: '2024-01-15',
      accountStatus: 'active'
    },
    notifications: [
      {
        id: '1',
        type: 'error',
        title: 'Idea Submission Declined',
        message: 'Your Smart Home Automation System proposal has been declined. Please review feedback and resubmit.',
        timestamp: '2024-02-25T10:30:00Z',
        read: false
      },
      {
        id: '2',
        type: 'info',
        title: 'New Investor Interest',
        message: 'A potential investor has shown interest in your EcoDelivery Service.',
        timestamp: '2024-02-24T15:45:00Z',
        read: false
      },
      {
        id: '3',
        type: 'warning',
        title: 'Profile Incomplete',
        message: 'Please complete your founder profile to access premium features.',
        timestamp: '2024-02-23T09:15:00Z',
        read: true
      },
      {
        id: '4',
        type: 'success',
        title: 'Idea Approved',
        message: 'Congratulations! Your AI-Powered Learning Platform has been approved for funding consideration.',
        timestamp: '2024-02-22T12:00:00Z',
        read: true
      }
    ]
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Handle query parameters to set active section and tab
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['section']) {
        this.activeSection = params['section'];
      }
      
      // If we're on ideas section and there's a tab parameter, pass it to the ideas component
      if (this.activeSection === 'ideas' && params['tab'] && this.founderIdeasComponent) {
        // Set the active tab in the ideas component
        setTimeout(() => {
          if (this.founderIdeasComponent) {
            this.founderIdeasComponent.activeTab = params['tab'];
          }
        }, 0);
      }
    });
  }

  setActiveSection(section: 'information' | 'security' | 'ideas' | 'notifications'): void {
    this.activeSection = section;
  }

  getUnreadNotificationsCount(): number {
    return this.profileData.notifications.filter(n => !n.read).length;
  }

  // Profile picture upload functionality
  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onProfilePictureChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      // Create a file reader to preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Update the profile picture URL
        this.profileData.personalInfo.profilePicture = imageUrl;
        
        // Here you would typically upload the file to your server
        this.uploadProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
  }

  private async uploadProfilePicture(file: File): Promise<void> {
    try {
      // Simulate API call to upload profile picture
      console.log('Uploading profile picture:', file.name);
      
      // In a real application, you would send the file to your backend
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  }

  // Event handlers for child component data changes
  onPersonalInfoChange(personalInfo: any): void {
    this.profileData.personalInfo = personalInfo;
  }

  onSecuritySettingsChange(securitySettings: any): void {
    this.profileData.securitySettings = securitySettings;
  }

  onIdeasCountChange(count: number): void {
    this.ideasCount = count;
  }

  onNotificationsChange(notifications: any[]): void {
    this.profileData.notifications = notifications;
  }
} 