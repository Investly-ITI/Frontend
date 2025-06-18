import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationSignalRService {
  private hubConnection!: signalR.HubConnection;
  private _notifationCount$ = new BehaviorSubject<number>(0);
  private ApiUrl = environment.apiUrl;

  public notificationCount$ = this._notifationCount$.asObservable();

  constructor() { }

  public startConnection(token: string) {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.ApiUrl}/notificationHub`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();


    this.hubConnection.start().catch(err => console.error("error hub",err));
    this.hubConnection.on('RecieveNotificationCount', (count: number) => {
      this._notifationCount$.next(count);
    })
  }
  public stopConnection() {
    this.hubConnection?.stop();
  }
}
