import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  constructor(private http: HttpClient) {}

  getDashboardCounts() {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/dashboard-counts`);
  }

  getTimeBasedAnalytics(timeframe: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/time-based-analytics`, {
      params: new HttpParams().set('timeframe', timeframe.toString())
    });
  }

  getMonthlyAcceptedContactRequests(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/monthly-accepted-contact-requests`);
  }

  getIdeasByCategory(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/ideas-by-category`);
  }

  getMostActiveInvestors(topN: number = 5): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/most-active-investors`, {
      params: new HttpParams().set('topN', topN)
    });
  }

  getMostSupportedFounders(topN: number = 5): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/most-supported-founders`, {
      params: new HttpParams().set('topN', topN)
    });
  }

  getUserCountsByGovernment(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/user-counts-by-government`);
  }

  getUserCountsByCity(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/user-counts-by-city`);
  }

  getIdeasByStage(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/ideas-by-stage`);
  }

  getAvgAiRateByCategory(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/avg-ai-rate-by-category`);
  }

  getIdeasByInvestmentType(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/analysis/ideas-by-investment-type`);
  }
}
