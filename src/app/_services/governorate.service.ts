import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Response } from "../_models/response";

@Injectable({
  providedIn: "root",
})
export class GovernrateService {
  private baseUrl = `${environment.apiUrl}/api/Government`

  constructor(private httpclinet:HttpClient) { }

  
  getGovernrates():Observable<Response<any>> {
  var res= this.httpclinet.get<Response<any>>(`${this.baseUrl}`);
  return res;
  }
   getCitiesByGovernrateId(id:number):Observable<Response<any>> {
  var res= this.httpclinet.get<Response<any>>(`${this.baseUrl}/${id}/cities`);
  return res;
  }
}