import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

@Component({
  selector: 'app-founder-notifications',
  imports: [CommonModule],
  templateUrl: './founder-notifications.component.html',
  styleUrl: './founder-notifications.component.css'
})
export class FounderNotificationsComponent implements OnInit {
  @Input() notifications!: Notification[];
  @Output() notificationsChange = new EventEmitter<Notification[]>();

  ngOnInit(): void {
    // Automatically mark all notifications as read when the component loads
    this.markAllNotificationsAsRead();
  }

  markAllNotificationsAsRead(): void {
    if (this.notifications && this.notifications.length > 0) {
      let hasChanges = false;
      this.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          hasChanges = true;
        }
      });
      
      // Only emit change if there were actual changes
      if (hasChanges) {
        this.notificationsChange.emit(this.notifications);
      }
    }
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notificationsChange.emit(this.notifications);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'bx-check-circle';
      case 'warning': return 'bx-error-circle';
      case 'error': return 'bx-x-circle';
      case 'info': return 'bx-info-circle';
      default: return 'bx-info-circle';
    }
  }
} 