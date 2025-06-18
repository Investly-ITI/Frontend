import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../_models/response';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
 private unreadCount$=new BehaviorSubject<number>(0);
 private ApiUrl=environment.apiUrl;

  constructor(private http:HttpClient) { }

  fetchUnreadCount(): void {
    this.http
      .get<Response<number>>(`${environment.apiUrl}/api/auth/notification-unread-num`)
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
