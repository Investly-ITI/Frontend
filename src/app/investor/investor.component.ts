import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../investor/_services/profile.service';
import { environment } from '../../environments/environment';
import { InvestorInformationComponent } from "./investor-information/investor-information.component";
import { InvestorSecurityComponent } from "./investor-security/investor-security.component";
import { InvestorNotificationsComponent } from "./investor-notifications/investor-notifications.component";
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { getStatusLabel } from '../_shared/utils/enum.utils';
import { Status } from '../_shared/enums';
import { NotificationService } from '../_services/notification.service';
import { InvestorIdeaRequestsComponent } from "./investor-idea-requests/investor-idea-requests.component";
import { ContactRequestCountsDto } from '../_models/contact-request';
import { animate, style, transition, trigger } from '@angular/animations';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  lastPasswordChange: string;
  accountStatus: string;
}
@Component({
  selector: 'app-investor',
  imports: [CommonModule, InvestorInformationComponent, InvestorSecurityComponent, InvestorNotificationsComponent, InvestorIdeaRequestsComponent],
  templateUrl: './investor.component.html',
  styleUrl: './investor.component.css',
})
export class InvestorComponent {
 @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('investorIdeasRequest') InvestorIdeasRequestComponent!: InvestorIdeaRequestsComponent;

  activeSection: 'information' | 'security' | 'ContactRequests' | 'notifications'|'feedback' = 'information';
  ContactRequestCount: ContactRequestCountsDto = { totalContactRequestCount: 0 };
  url=environment.apiUrl;
  // Security alert indicator
  showSecurityAlert = true; // Set to true to show red exclamation mark next to Security
    private subscriptions: Subscription[] = [];
 profileData: any; 
 imageUrl:string| null = null;
 securitySettings: SecuritySettings={
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      loginAlerts: true,
      lastPasswordChange: '2024-01-15',
      accountStatus: "active"
    }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private profileService:ProfileService,
    private toastr:ToastrService,
     private notificationService: NotificationService,

  ) {}
    unreadCount: number = 0;
  private unreadCountSub?: Subscription;
isLoading = false; 

  ngOnInit(): void {
    this.getProfileData();
    this.getRequestsCount();
   
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['section']) {
        this.activeSection = params['section'];
      }
      
    });
     // Subscribe to shared unread count observable
    this.unreadCountSub = this.notificationService.getUnreadCount$().subscribe(count => {
      this.unreadCount = count;
    });
    // Initial fetch
    this.notificationService.refreshUnreadCount();
  }

getProfileData():void{ 
  this.isLoading = true;
  this.subscriptions.push(
    this.profileService.getProfileData().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {

          this.profileData = res.data;
          console.log(this.profileData);
          
          this.securitySettings = {
            twoFactorEnabled: false,
            emailNotifications: false,
            smsNotifications: false,
            loginAlerts: false,
            lastPasswordChange: "1-1-2000",
            accountStatus: getStatusLabel(this.profileData.user.status)
          }
          this.showSecurityAlert = this.profileData.user.status != Status.Active;
        } else {
          console.error('Failed to fetch profile data', res.message);
        }
      },
      error: (err) => {
        console.error('Error fetching profile data', err);
      }
    })
  );

  // Fetch contact requests count
const sub = this.profileService.getProfileData().subscribe({
 
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.profileData = res.data;
        console.log(this.profileData);
        
                  this.securitySettings = {
                    twoFactorEnabled: false,
                    emailNotifications: false,
                    smsNotifications: false,
                    loginAlerts: false,
                    lastPasswordChange: "1-1-2000",
                    accountStatus: getStatusLabel(this.profileData.user.status)
                  }
                  this.showSecurityAlert=this.profileData.user.status!=Status.Active
      } else {
        console.error('Failed to fetch profile data', res.message);
      }
    },
    error: (err) => {
      console.error('Error fetching profile data', err);
    }
  });
 


 }

 getRequestsCount()
 {
   const sub1=this.profileService.GetContactRequestsCount().subscribe({
    next: (res) => {
      if (res.isSuccess ) {
        this.ContactRequestCount.totalContactRequestCount = +res.data.totalContactRequestCount;
       
      } else {
        console.error('Failed to fetch profile data', res.message);
      }
    },
    error: (err) => {
      console.error('Error fetching profile data', err);
    }
  })
 }

  setActiveSection(section: 'information' | 'security' | 'ContactRequests' | 'notifications'|'feedback'): void {
    this.activeSection = section;
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
        this.imageUrl = e.target?.result as string;
        // Update the profile picture URL
        this.profileData.user.profilePicPath = this.imageUrl;
        
        // Here you would typically upload the file to your server
        this.uploadProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
  }

   private async uploadProfilePicture(file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('profilepic', file);

    this.profileService.updateProfilePicture(formData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
             this.getProfileData();
          this.toastr.success('Profile picture updated successfully');
       
        } else {
            this.getProfileData();

          this.toastr.error(response.message || 'Failed to update profile picture');
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'An error occurred while updating profile picture';
        this.toastr.error(errorMessage);
       
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
            this.getProfileData();

    this.toastr.error('Failed to upload profile picture');
 
  }
}


  // Event handlers for child component data changes
  onPersonalInfoChange(personalInfo: any): void {
    this.profileData.user = personalInfo;
    this.getProfileData();
  }

  onSecuritySettingsChange(securitySettings: any): void {
    this.profileData.securitySettings = securitySettings;
  }

  onIdeasCountChange(count: number): void {
    this.ContactRequestCount.totalContactRequestCount = count;
  }

  onNotificationsChange(notifications: any[]): void {
    this.profileData.notifications = notifications;
  }
  ngOnDestroy(): void {
    this.unreadCountSub?.unsubscribe();
  }
}
