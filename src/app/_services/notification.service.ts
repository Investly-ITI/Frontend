import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../_models/response';
import { HttpClient } from '@angular/common/http';
import { notification, notificationSearch } from '../_models/notification';

export interface PaginatedNotificationsDto {
  notifications: notification[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCount$ = new BehaviorSubject<number>(0);
  private ApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserNotifications(search: notificationSearch): Observable<Response<PaginatedNotificationsDto>> {
    return this.http.get<Response<PaginatedNotificationsDto>>(
      `${this.ApiUrl}/api/notification/user`, { params: this.toHttpParams(search) }
    );
  }

  markAllAsRead(): Observable<Response<any>> {
    return this.http.put<Response<any>>(
      `${this.ApiUrl}/api/notification/mark-all-as-read`, {}
    );
  }

  getUnreadCount(): Observable<Response<number>> {
    return this.http.get<Response<number>>(`${this.ApiUrl}/api/notification/unread-count`);
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (res) => this.unreadCount$.next(res.data ?? 0),
      error: () => this.unreadCount$.next(0)
    });
  }

  setUnreadCount(count: number): void {
    this.unreadCount$.next(count);
  }

  softDeleteNotification(id: number) {
    return this.http.put<Response<any>>(
      `${this.ApiUrl}/api/notification/${id}/soft-delete`, {}
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


  fetchUnreadCount(): void {
    this.http
      .get<Response<number>>(`${this.ApiUrl}/api/notification/notification-unread-num`)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.unreadCount$.next(res.data);
          }
        },
        error: () => {
          this.unreadCount$.next(0);
        },
      });
  }

  getUnreadCount$(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  updateCountFromSignalR(count: number): void {
    this.unreadCount$.next(count);
  }
}
