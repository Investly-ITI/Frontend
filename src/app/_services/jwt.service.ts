import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import { LoggedInUser } from '../_models/user';



export interface DecodedToken {
  exp: number,
  email: string,
  userType: number,
  name: string
}
@Injectable({
  providedIn: 'root'
})
export class JwtService {
 private tokenKey = 'token';
  private expirationKey = 'token_expiration';

  saveToken(token: string) {
    const decoded:DecodedToken=jwtDecode(token);
    const expiration=decoded.exp*1000;  
    localStorage.setItem(this.tokenKey,token);
    localStorage.setItem(this.expirationKey,expiration.toString());
  }
   getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

   getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

    getExpiration(): number | null {
    const expiration = localStorage.getItem(this.expirationKey);
    return expiration ? parseInt(expiration, 10) : null;
  }

  isTokenValid(): boolean {
    const expiration = this.getExpiration();
    return expiration ? Date.now() < expiration : false;
  }

  getUserData(): LoggedInUser|null {
    const decoded = this.getDecodedToken();
    if(!decoded){return null}
     var data:LoggedInUser={
      email:decoded?.email,
      name:decoded?.name,
      userType:decoded?.userType
     }
     return data;
  }

 
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expirationKey);
  }  


}
