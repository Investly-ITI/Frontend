import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedbackCreateDto } from '../_models/feedback';
import { Response } from '../_models/response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserFeedbackService {
  private baseUrl = `${environment.apiUrl}/api/feedback`; 

  constructor(private http: HttpClient) { }

  createFeedback(dto: FeedbackCreateDto): Observable<Response<string>> {
    return this.http.post<Response<string>>(`${this.baseUrl}/create-feedback`, dto);
  }
}