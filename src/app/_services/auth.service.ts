import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserLogin } from '../_models/user';
import { Observable } from 'rxjs';
import { Response } from '../_models/response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/auth`
  constructor(private httpClient: HttpClient) { }

  login(data: UserLogin): Observable<Response<string>> {
    var result = this.httpClient.post<Response<string>>(`${this.baseUrl}/login`, data);
    return result;
  }

}
