import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FounderInformationComponent } from './founder-information/founder-information.component';
import { FounderSecurityComponent } from './founder-security/founder-security.component';
import { FounderIdeasComponent } from './founder-ideas/founder-ideas.component';
import { FounderNotificationsComponent } from './founder-notifications/founder-notifications.component';
import { ProfileService } from './_services/profile.service';
import { NotificationService, PaginatedNotificationsDto } from '../_services/notification.service';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { getStatusLabel } from '../_shared/utils/enum.utils';
import { Status } from '../_shared/enums';
import { AuthService } from '../_services/auth.service';
import { RouterLink } from '@angular/router';

interface ProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    countryCode: string;
    phoneNumber: string;
    address: string;
    government: string;
    city: string;
    nationalId: string;
    cityId: number | null;
    governmentId: number | null;
    gender: string;
    profilePicture: string;
  };
  securitySettings: {
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    loginAlerts: boolean;
    lastPasswordChange: string;
    accountStatus:string;
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
    FounderNotificationsComponent,RouterLink
  ],
  templateUrl: './founder.component.html',
  styleUrl: './founder.component.css'
})
export class FounderComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('founderIdeas') founderIdeasComponent!: FounderIdeasComponent;

  activeSection: 'information' | 'security' | 'ideas' | 'notifications'|'feedback' = 'information';
  ideasCount: number = 0;
  subscribe: Subscription[] = [];
  showIdeasTab:boolean = false;


  // Security alert indicator
  showSecurityAlert = false;

  profileData: ProfileData = {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      countryCode: '+20',
      phoneNumber: '',
      address: '',
      government: '',
      city: '',
      nationalId: '',
      gender: '',
      profilePicture: 'Me.png',
      cityId : null,
      governmentId: null
    },
    securitySettings: {
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      loginAlerts: true,
      lastPasswordChange: '2024-01-15',
      accountStatus: "active"
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

  unreadCount: number = 0;
  private unreadCountSub?: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    // Handle query parameters to set active section and tab
    this.getProfileData();
    this.authService.CurrentUser$.subscribe(user => {
         if(user?.status==Status.Active){
          this.showIdeasTab = true;
         }
    });
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
    // Subscribe to shared unread count observable
    this.unreadCountSub = this.notificationService.getUnreadCount$().subscribe(count => {
      this.unreadCount = count;
    });
    // Initial fetch
    this.notificationService.refreshUnreadCount();
  }

  getProfileData(): void {
    const sub = this.profileService.getProfileData().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const user = res.data.user;
          console.log(user);
          this.profileData.personalInfo = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            dateOfBirth: new Date(user.dateOfBirth).toISOString().split('T')[0],
            countryCode: '+20',
            phoneNumber: user.phoneNumber,
            address: user.address,
            government: user.government?.nameEn || '',
            city: user.city?.nameEn || '',
            nationalId: user.nationalId,
            cityId: user.cityId,
            governmentId: user.governmentId ,
            gender: user.gender,
            profilePicture: user.profilePicPath
              ? `${environment.apiUrl}/${user.profilePicPath}?${new Date().getTime()}`
              : "assets/images/default-profile.png"
          };

          this.profileData.securitySettings = {
            twoFactorEnabled: false,
            emailNotifications: false,
            smsNotifications: false,
            loginAlerts: false,
            lastPasswordChange: "1-1-2000",
            accountStatus: getStatusLabel(user.status)
          }
          this.showSecurityAlert=user.status!=Status.Active
        } else {
          console.error('Failed to fetch profile data', res.message);
        }
      },
      error: (err) => {
        console.error('Error fetching profile data', err);
      }
    });
    this.subscribe.push(sub); 
  }

  setActiveSection(section: 'information' | 'security' | 'ideas' | 'notifications'|'feedback'): void {
    this.activeSection = section;
    if (section === 'notifications') {
      this.notificationService.setUnreadCount(0);
    }
  }

  ngOnDestroy(): void {
    this.unreadCountSub?.unsubscribe();
    this.subscribe.forEach((sb) => sb.unsubscribe());
  }

  getUnreadNotificationsCount(): number {
    return this.unreadCount;
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
      // Create a file reader to preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Temporarily update the profile picture URL for preview
        this.profileData.personalInfo.profilePicture = imageUrl;

        // Upload the file to server
        this.uploadProfilePicture(file);
      };
      reader.readAsDataURL(file);

      // Reset the file input
      target.value = '';
    }
  }

  private async uploadProfilePicture(file: File): Promise<void> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Only JPG and PNG files are allowed');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB');
        return;
      }

      const request = {
        email: this.profileData.personalInfo.email,
        profilePic: file
      };

      this.profileService.updateProfilePicture(request).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastr.success('Profile picture updated successfully');

            // Refresh user data to get the updated profile picture path
            this.getProfileData();
          } else {
            this.toastr.error(response.message || 'Failed to update profile picture');
            // Revert to previous image if upload failed
            this.getProfileData();
          }
        },
        error: (err) => {
          const errorMessage = err.error?.message ||
            'An error occurred while updating profile picture';
          this.toastr.error(errorMessage);
          // Revert to previous image on error
          this.getProfileData();
        }
      });

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      this.toastr.error('Failed to upload profile picture');
      this.getProfileData();
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