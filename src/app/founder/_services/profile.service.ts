// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from '../../../environments/environment';
// import { Founder } from '../../_models/founder';
// import { Observable } from 'rxjs';
// import { Response } from '../../_models/response';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProfileService {
//   private ApiUrl=environment.apiUrl;
//   constructor(private http :HttpClient) {}

//   getProfileData():Observable<Response<Founder>>{
//     var res=this.http.get<Response<Founder>>(`${this.ApiUrl}/api/founder/profile`);
//     return res;
//   }

// }


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChangePassword, Founder, UpdateFounder, UpdateNationalIdRequest, UpdateNationalIdResponse, UpdateProfilePictureRequest } from '../../_models/founder';
import { Observable } from 'rxjs';
import { Response } from '../../_models/response';
import { DropdownDto } from '../../_models/user';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private ApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfileData(): Observable<Response<Founder>> {
    return this.http.get<Response<Founder>>(`${this.ApiUrl}/api/founder/profile`);
  }

  updateFounder(email: string, founderData: UpdateFounder): Observable<Response<string>> {
    return this.http.put<Response<string>>(
      `${this.ApiUrl}/api/founder/profile/${email}`,
      founderData
    );
  }

  changePassword(passwordData: ChangePassword): Observable<Response<string>> {
    return this.http.post<Response<string>>(
      `${this.ApiUrl}/api/founder/profile/change-password`,
      passwordData
    );
  }

  updateProfilePicture(request: UpdateProfilePictureRequest): Observable<Response<string>> {
    const formData = new FormData();
    formData.append('Email', request.email);
    formData.append('PicFile', request.profilePic);

    return this.http.patch<Response<string>>(
      `${this.ApiUrl}/api/founder/Profile/profile-picture`,
      formData
    );
  }

  updateNationalIdImages(request: UpdateNationalIdRequest): Observable<Response<UpdateNationalIdResponse>> {
    const formData = new FormData();
    formData.append('Email', request.email);
    
    if (request.frontIdFile) {
      formData.append('FrontIdFile', request.frontIdFile);
    }
    
    if (request.backIdFile) {
      formData.append('BackIdFile', request.backIdFile);
    }

    return this.http.patch<Response<UpdateNationalIdResponse>>(
      `${this.ApiUrl}/api/founder/Profile/national-id`,
      formData
    );
  }






}