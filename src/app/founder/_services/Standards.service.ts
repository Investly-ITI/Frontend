import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Response } from "../../_models/response";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",   
  })
  export class StandardService {
     private baseUrl = `${environment.apiUrl}/api/founder/Standards`;
    constructor(private httpclient:HttpClient) {}
    GetStandardsByCategory(categoryId: number):Observable<Response<any>> {
      var res= this.httpclient.get<Response<any>>(`${this.baseUrl}/GetStandardsByCategory/${categoryId}`);
      return res;
    }
    
  }