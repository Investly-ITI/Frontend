import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { notification, notificationSearch, sendnotification } from "../../_models/notification";
import { Observable } from "rxjs";
import { Response } from "../../_models/response";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private baseUrl = `${environment.apiUrl}/api/admin/Notification`;
  constructor(private httpclient:HttpClient) {}

  SendNotification(Notification: sendnotification):Observable<Response<any>> {
   var res=this.httpclient.post<Response<any>>(`${this.baseUrl}/SendNotification`, Notification);
   return res;
  }

  getNotifications(search:notificationSearch): Observable<Response<any>> {
    var res =this.httpclient.post<Response<any>>(`${this.baseUrl}/PaginatedNotifications`,search);
   return res;
  }

  ChangeNotificationStatus(id:number,status:number): Observable<Response<any>> {
    var res = this.httpclient.put<Response<any>>(`${this.baseUrl}/ChangeStatus/${id}?status=${status}`, null);
    return res;
   
  }
  GetTotalNotificationsActiveDeleted():Observable<Response<any>> {
    var res = this.httpclient.get<Response<any>>(`${this.baseUrl}/TotalNotificationsActiveDeleted`);
    return res;
  }
  GetUnreadNotifications():Observable<Response<notification[]>> {
    var res = this.httpclient.get<Response<notification[]>>(`${this.baseUrl}/UnreadNotifications`);
    return res;
  }
}