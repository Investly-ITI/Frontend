import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DropdownDto, LoggedInUser, User, UserLogin } from '../_models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { Response } from '../_models/response';
import { jwtDecode } from 'jwt-decode';



export interface DecodedToken {
  exp: number,
  email: string,
  userType: number,
  name: string,
  status:number,
  profilePicPath:string,
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl=`${environment.apiUrl}/api/auth`;

  private tokenKey = 'token';
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  private UserLoggedIn = new BehaviorSubject<LoggedInUser | null>(this.getUserData())
  public isAuthenticated$ = this.authStatus.asObservable();
  public CurrentUser$ = this.UserLoggedIn.asObservable();
  constructor(private httpClient:HttpClient) { }


  login(token: string): void {
    console.log(token);
    this.saveToken(token);
    this.UserLoggedIn.next(this.getUserData());
    this.authStatus.next(true);

  }

  logout(): void {
    this.clearToken();
    this.UserLoggedIn.next(null);
    this.authStatus.next(false);
  }

  

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }





  private saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }


  private getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000); 
    return decoded.exp < now;
  }

  private hasToken(): boolean {
    return this.getToken() != null;
  }


 getUserData(): LoggedInUser | null {
    const decoded = this.getDecodedToken();
    if (!decoded) { return null }
    var data: LoggedInUser = {
      email: decoded?.email,
      name: decoded?.name,
      userType: Number(decoded?.userType),
      status:Number(decoded?.status),
      profilePicPath:decoded?.profilePicPath,
    }
    return data;
  }


  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public getRelatedUsersForFeedback() : Observable<Response<DropdownDto[]>>
  {
    return this.httpClient.get<Response<DropdownDto[]>>(`${this.baseUrl}/appropriate-feedback-users`);
  }

  public requestPasswordReset(email: string): Observable<Response<string>> {
    return this.httpClient.post<Response<string>>(
      `${this.baseUrl}/request-password-reset`,
      { email }
    );
  }

}
