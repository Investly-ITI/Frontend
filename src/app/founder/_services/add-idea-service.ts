import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Response } from "../../_models/response";

@Injectable({
  providedIn: "root",   
  })
  export class AddIdeaService {
     private baseUrl = `${environment.apiUrl}/api/founder/Business`;
    constructor(private httpclient:HttpClient) {}
    AddIdea(idea: FormData):Observable<Response<any>> {
      var res= this.httpclient.post<Response<any>>(`${this.baseUrl}`, idea);
      return res;
    }
    
  }