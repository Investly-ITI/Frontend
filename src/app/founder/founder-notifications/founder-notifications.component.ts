import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FounderNotificationService, PaginatedNotificationsDto } from '../_services/founder-notification.service';
import { notification, notificationSearch } from '../../_models/notification';

@Component({
  selector: 'app-founder-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './founder-notifications.component.html',
  styleUrls: ['./founder-notifications.component.css']
})
export class FounderNotificationsComponent implements OnInit {
  notifications: notification[] = [];
  isLoading: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  constructor(private founderNotificationService: FounderNotificationService) {}

  ngOnInit(): void {
    // Mark all as read before loading notifications
    this.founderNotificationService.markAllAsRead().subscribe({
      next: () => {
        this.founderNotificationService.setUnreadCount(0);
        this.loadNotifications();
      },
      error: () => {
        this.founderNotificationService.setUnreadCount(0);
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
    this.founderNotificationService.getUserNotifications(search).subscribe({
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
    this.founderNotificationService.softDeleteNotification(notificationId).subscribe({
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