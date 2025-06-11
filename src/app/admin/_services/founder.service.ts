import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { FounderSearch } from "../../_models/founder";
import { Observable } from "rxjs";
import { Response } from "../../_models/response";
import { DropdownDto } from "../../_models/user";

@Injectable({
  providedIn: "root",   
})
export class FounderService {
  private baseUrl = `${environment.apiUrl}/api/admin/founder`;
  
  constructor(private httpclinet:HttpClient) { }
GetAllFoundersPaginated(Search:FounderSearch):Observable<Response<any>> 
{
    var res= this.httpclinet.post<Response<any>>(`${this.baseUrl}/PaginatedFounders`, Search);
    return res;
}
GetTotalFoundersActiveIactive():Observable<Response<any>>
{
    var res= this.httpclinet.get<Response<any>>(`${this.baseUrl}/ActiveInactiveFounders`);
    return res;
}
ChangeFounderStatus(id:number,status:number):Observable<Response<any>>
{
    var res= this.httpclinet.put<Response<any>>(`${this.baseUrl}/ChangeFounderStatus/${id}?status=${status}`,null);
    return res;
}
GetFounderByID(id:number):Observable<Response<any>>
{
    var res= this.httpclinet.get<Response<any>>(`${this.baseUrl}/GetFounderById/${id}`);
    return res;
}

getFoundersForDropdown(): Observable<Response<DropdownDto[]>> {
  return this.httpclinet.get<Response<DropdownDto[]>>(`${this.baseUrl}/dropdown`);
}

}