import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Response } from "../_models/response";
import { Observable } from "rxjs";
import { Category } from "../_models/category";

@Injectable({
  providedIn: "root",       
  })
  export class CategoryService {
     private baseUrl = `${environment.apiUrl}/api/Category`
     constructor(private httpclient:HttpClient) {}
     GetAllCategories(): Observable<Response<Category[]>> {
       var res= this.httpclient.get<Response<Category[]>>(`${this.baseUrl}`);
       return res;
     }  
}