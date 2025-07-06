import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategorySearch, Category, AddCategoryWithStandards, AddCategoryStandard, UpdateCategoryWithStandards } from '../../_models/category';
import { Response } from '../../_models/response';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = `${environment.apiUrl}/api/Category`
  
  constructor(private httpClient: HttpClient) { }

  getpagintedData(dataSearch: CategorySearch): Observable<Response<any>> {
    var result = this.httpClient.post<Response<any>>(`${this.baseUrl}/Paginated`, dataSearch);
    return result;
  }

  addCategoryWithStandards(categoryData: AddCategoryWithStandards): Observable<Response<any>> {
    return this.httpClient.post<Response<any>>(`${this.baseUrl}/AddWithStandards`, categoryData);
  }

  updateCategoryWithStandards(categoryData: UpdateCategoryWithStandards): Observable<Response<any>> {
    return this.httpClient.put<Response<any>>(`${this.baseUrl}/UpdateWithStandards`, categoryData);
  }

  changeStatus(categoryId: number, status: number): Observable<Response<any>> {
    return this.httpClient.put<Response<any>>(`${this.baseUrl}/ChangeStatus/${categoryId}/${status}`, {});
  }

  getTotalActiveInactive(): Observable<Response<any>> {
    return this.httpClient.get<Response<any>>(`${this.baseUrl}/total-active-inactive`);
  }
}
