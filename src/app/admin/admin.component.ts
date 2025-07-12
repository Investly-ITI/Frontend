import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationDropDownComponent } from "./_core/notification-drop-down/notification-drop-down.component";
import { DarkModeService } from './_services/dark-mode.service';
import { LoggedInUser } from '../_models/user';
import { AuthService } from '../_services/auth.service';
import { Subscription } from 'rxjs';
import { NotificationService  } from '../_services/notification.service';
import { NotificationService as AdminNotificationService } from './_services/notification.service';
import { notification } from '../_models/notification';


@Component({
  selector: 'app-admin',
  imports: [RouterModule, CommonModule, FormsModule, RouterOutlet, RouterLink, NotificationDropDownComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  //* Notifications Properties
  notificationsCount: number = 0;
  notifications: notification[] = []; //! you need to define notification interface / model and import it then start populating this array with data from your service in loadNotifications method
  isNotificationsOpen: boolean = false;
  isNotificationsClosing: boolean = false;
  loggedInUser:LoggedInUser|null=null;
  private  unsubscribe: Subscription[] = []; 
  private unreadCountSub?: Subscription;

  //* Theme Toggle Properties
  isDarkMode = false;

  constructor(
    private darkModeService: DarkModeService,
    private auth:AuthService,
    private notificationService:NotificationService,
    private AdminNotificationService:AdminNotificationService
  ){}


  //* Dark mode - sidebar - menu bar - notifications Toggles in onInit hook:
  ngOnInit() {
    
    // Initialize theme system
    this.checkDarkMode();
    
    // this.loadNotifications(); //+ Uncomment this line when you implement the loadNotifications method
     // Subscribe to shared unread count observable
    this.unreadCountSub = this.notificationService.getUnreadCount$().subscribe(count => {
      this.notificationsCount = count;
    });
    // Initial fetch
    this.notificationService.refreshUnreadCount();
    const allSideMenu = document.querySelectorAll(
      '#sidebar .side-menu.top li a'
    );

    allSideMenu.forEach((item) => {
      const li = item.parentElement;

      item.addEventListener('click', function () {
        allSideMenu.forEach((i) => {
          i.parentElement?.classList.remove('active');
        });
        li?.classList.add('active');
      });
    });

    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    if (menuBar && sidebar) {
      menuBar.addEventListener('click', function () {
        sidebar.classList.toggle('hide');
      });
    }

    // Remove old switch-mode logic - now using new theme toggle
    // const switchMode = document.getElementById('switch-mode') as HTMLInputElement;
    // if (switchMode) {
    //   switchMode.checked = this.darkModeService.isDarkMode();
    //   switchMode.addEventListener('change', () => {
    //     this.darkModeService.toggleDarkMode();
    //   });
    // }

     var sub=this.auth.CurrentUser$.subscribe(user=>{
           this.loggedInUser=user;
     })
     this.unsubscribe.push(sub);

  }

  //* Notifications Methods:
  toggleNotifications() {
    if (this.isNotificationsOpen) {
      this.closeNotifications();
    } else {
      this.isNotificationsOpen = true;
      this.loadNotifications();
//+ Uncomment this line when you implement the loadNotifications method
    }
  }

  closeNotifications() {
    this.isNotificationsClosing = true;
    setTimeout(() => {
      this.isNotificationsOpen = false;
      this.isNotificationsClosing = false;
    }, 280); 
  }

  loadNotifications() {
    
    this.AdminNotificationService.GetUnreadNotifications().subscribe({
      next: (response) => {   
        this.notifications = response.data;
       
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  logout(){
    this.auth.logout();
    location.reload();
    
  }

  //* Theme Toggle Methods
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.darkModeService.toggleDarkMode();
    this.applyTheme();
    // Store theme preference in localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private checkDarkMode(): void {
    // Check if dark mode is stored in localStorage or from service
    const storedTheme = localStorage.getItem('theme');
    this.isDarkMode = this.darkModeService.isDarkMode() || storedTheme === 'dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    const body = document.body;
    const parent3 = document.querySelector('.parent3');

    // Add transition for smooth animation
    if (parent3) {
      (parent3 as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    if (this.isDarkMode) {
      body.classList.add('dark');
      parent3?.classList.add('dark');
    } else {
      body.classList.remove('dark');
      parent3?.classList.remove('dark');
    }

    // Remove transition after animation completes
    setTimeout(() => {
      if (parent3) {
        (parent3 as HTMLElement).style.transition = '';
      }
    }, 600);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }


}
