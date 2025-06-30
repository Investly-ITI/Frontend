import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { notification, notificationSearch } from '../../_models/notification';
import { Response } from '../../_models/response';

export interface PaginatedNotificationsDto {
  notifications: notification[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class FounderNotificationService {
  private baseUrl = `${environment.apiUrl}/api/Notification`;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshUnreadCount();
  }

  getUserNotifications(search: notificationSearch): Observable<Response<PaginatedNotificationsDto>> {
    return this.http.get<Response<PaginatedNotificationsDto>>(
      `${this.baseUrl}/user`, { params: this.toHttpParams(search) }
    );
  }

  markAllAsRead(): Observable<Response<any>> {
    return this.http.put<Response<any>>(
      `${this.baseUrl}/mark-all-as-read`, {}
    );
  }

  getUnreadCount(): Observable<Response<number>> {
    return this.http.get<Response<number>>(`${this.baseUrl}/unread-count`);
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (res) => this.unreadCountSubject.next(res.data ?? 0),
      error: () => this.unreadCountSubject.next(0)
    });
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  softDeleteNotification(id: number) {
    return this.http.put<Response<any>>(
      `${this.baseUrl}/${id}/soft-delete`, {}
    );
  }

  private toHttpParams(obj: any): any {
    const params: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        params[key] = obj[key];
      }
    });
    return params;
  }
}
