import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { notification, notificationSearch } from '../../_models/notification';
import { NotificationService } from '../../_services/notification.service';
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
@Component({
  selector: 'app-investor-notifications',
  imports: [CommonModule],
  templateUrl: './investor-notifications.component.html',
  styleUrl: './investor-notifications.component.css'
})
export class InvestorNotificationsComponent {
 notifications: notification[] = [];
  isLoading: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

    constructor(private notificationService: NotificationService) {}
  ngOnInit(): void {
    // Mark all as read before loading notifications
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.setUnreadCount(0);
        this.loadNotifications();
      },
      error: () => {
        this.notificationService.setUnreadCount(0);
        this.loadNotifications();
      }
    });
  }
   loadNotifications(): void {
      this.isLoading = true;
      const search: notificationSearch = new notificationSearch(
        this.pageSize,
        this.pageNumber,
        0, // UserTypeFrom
        0, // UserTypeTo
        '', // SearchInput
        null, // isRead
        0 // Status
      );
      this.notificationService.getUserNotifications(search).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data && res.data.notifications) {
            this.notifications = res.data.notifications;
            this.totalCount = res.data.totalCount || 0;
          } else {
            this.notifications = [];
          }
          this.isLoading = false;
        },
        error: () => {
          this.notifications = [];
          this.isLoading = false;
        }
      });
    }


 

  
  deleteNotification(notificationId: number): void {
    this.notificationService.softDeleteNotification(notificationId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
        } else {
        }
      },
      error: () => {
      }
    });
  }

 getNotificationIcon(status?: number): string {
    switch (status) {
      case 1: return 'bx-info-circle'; // Active
      case 2: return 'bx-check-circle'; // Inactive
      case 3: return 'bx-x-circle'; // Deleted
      case 4: return 'bx-error-circle'; // Pending
      case 5: return 'bx-error-circle'; // Rejected
      default: return 'bx-info-circle';
    }
  }
}
