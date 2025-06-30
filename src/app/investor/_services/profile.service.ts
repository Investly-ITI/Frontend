import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Response } from '../../_models/response';
import { Investor } from '../../_models/investor';
import { ChangePassword } from '../../_models/founder';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private ApiUrl=environment.apiUrl;
  constructor(private http :HttpClient) {}

  getProfileData():Observable<Response<Investor>>{
    var res=this.http.get<Response<Investor>>(`${this.ApiUrl}/api/investor/profile`);
    return res;
  }
   update(data:FormData):Observable<Response<Investor>>{
      var result= this.http.put<Response<Investor>>(`${this.ApiUrl}/api/investor/profile`,data);
      return result;
    }
     updateNationalId(NationalIdPics: FormData): Observable<Response<string>> {

var res=  this.http.patch<Response<string>>( `${this.ApiUrl}/api/investor/profile/nationalid`, NationalIdPics);
return res;
    }
   updateProfilePicture(profielpic: FormData): Observable<Response<string>> {

var res=  this.http.patch<Response<string>>( `${this.ApiUrl}/api/investor/profile`, profielpic);
return res;
    }
    changePassword(passwordData: ChangePassword): Observable<Response<string>> {
        return this.http.patch<Response<string>>(
          `${this.ApiUrl}/api/investor/profile/changepassword`, passwordData
        );
      }
    
 

}
