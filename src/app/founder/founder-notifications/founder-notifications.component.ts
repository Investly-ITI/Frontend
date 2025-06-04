import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class FounderNotificationsComponent {
  @Input() notifications!: Notification[];
  @Output() notificationsChange = new EventEmitter<Notification[]>();

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsChange.emit(this.notifications);
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