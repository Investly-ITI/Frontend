import { Component, ElementRef, ViewChild } from '@angular/core';
import { InvestorIdeasRequestComponent } from './investor-ideas-request/investor-ideas-request.component';
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
  imports: [CommonModule,InvestorInformationComponent, InvestorSecurityComponent, InvestorIdeasRequestComponent, InvestorNotificationsComponent],
  templateUrl: './investor.component.html',
  styleUrl: './investor.component.css'
})
export class InvestorComponent {
 @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('investorIdeasRequest') InvestorIdeasRequestComponent!: InvestorIdeasRequestComponent;

  activeSection: 'information' | 'security' | 'ideas' | 'notifications' = 'information';
  ideasCount: number = 0;
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
    private toastr:ToastrService

  ) {}

  ngOnInit(): void {
    // Handle query parameters to set active section and tab
   this.getProfileData();
  
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['section']) {
        this.activeSection = params['section'];
      }
      
      // If we're on ideas section and there's a tab parameter, pass it to the ideas component
      if (this.activeSection === 'ideas' && params['tab'] && this.InvestorIdeasRequestComponent) {
        // Set the active tab in the ideas component
        setTimeout(() => {
          if (this.InvestorIdeasRequestComponent) {
            this.InvestorIdeasRequestComponent.activeTab = params['tab'];
          }
        }, 0);
      }
    });
  }

getProfileData():void{ 
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


  setActiveSection(section: 'information' | 'security' | 'ideas' | 'notifications'): void {
    this.activeSection = section;
  }

  getUnreadNotificationsCount(): number {
    //return this.profileData.notifications.filter(n => !n.read).length;
    return 3
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
    this.ideasCount = count;
  }

  onNotificationsChange(notifications: any[]): void {
    this.profileData.notifications = notifications;
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
