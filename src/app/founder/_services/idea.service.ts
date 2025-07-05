import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Response } from "../../_models/response";
import { AiIdeaEvaluationResult } from "../../_models/aiIdeaEvaluationResult";
import { BusinessDto } from "../../_models/businesses";

@Injectable({
  providedIn: "root",
})
export class IdeaService {
  private baseUrl = `${environment.apiUrl}/api/founder/Business`;

  constructor(private httpclient: HttpClient) { }

  AddIdea(idea: FormData): Observable<Response<any>> {
    var res = this.httpclient.post<Response<any>>(`${this.baseUrl}`, idea);
    return res;
  }
  Evaluate(formData:FormData):Observable<Response<AiIdeaEvaluationResult>>{
    var res= this.httpclient.post<Response<any>>(`${this.baseUrl}/evaluate`, formData);
    return res;
  }
  GetAll():Observable<Response<BusinessDto[]>>{
    var res= this.httpclient.get<Response<BusinessDto[]>>(`${this.baseUrl}/all`);
    return res;
  }
   UpdateIdea(idea: FormData): Observable<Response<any>> {
    var res = this.httpclient.put<Response<any>>(`${this.baseUrl}`, idea);
    return res;
  }
  DeleteIdea(id:number): Observable<Response<any>> {
    var res = this.httpclient.put<Response<any>>(`${this.baseUrl}/${id}`,{});
    return res;
  }
}