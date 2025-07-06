import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartType, ChartOptions, ChartData,
          PieController, ArcElement, Tooltip, Legend,
          BarController, BarElement, CategoryScale,
          LinearScale, LineController, LineElement,
          PointElement, DoughnutController,
          RadarController, PolarAreaController, RadialLinearScale } from 'chart.js';
import { AnalysisService } from '../_services/analysis.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { TimeframeType } from '../../_shared/enums';
import { DarkModeService } from '../_services/dark-mode.service';
import { Subscription } from 'rxjs';

// Register required Chart.js components for all chart types
Chart.register(
  PieController, ArcElement, Tooltip, Legend,
  BarController, BarElement, CategoryScale, LinearScale,
  LineController, LineElement, PointElement,
  DoughnutController,
  RadarController, PolarAreaController, RadialLinearScale
);

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    NgxSpinnerModule
  ],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css'],
})
export class AnalysisComponent implements OnInit, OnDestroy {
  public TimeframeType = TimeframeType;
  counts: any = {};

  // Chart data holders
  timeAnalytics: any = null;
  monthlyContactRequests: any[] = [];
  ideasByCategory: any[] = [];
  mostActiveInvestors: any[] = [];
  mostSupportedFounders: any[] = [];
  userCountsByGovernment: any[] = [];
  userCountsByCity: any[] = [];
  ideasByStage: any[] = [];
  avgAiRateByCategory: any[] = [];
  ideasByInvestmentType: any[] = [];

  // Chart options with proper TypeScript typing
  public pieChartOptions: ChartOptions<'pie'> = this.getPieChartOptions();
  public doughnutChartOptions: ChartOptions<'doughnut'> = this.getDoughnutChartOptions();
  public barChartOptions: ChartOptions<'bar'> = this.getBarChartOptions();
  public horizontalBarChartOptions: ChartOptions<'bar'> = this.getHorizontalBarChartOptions();
  public lineChartOptions: ChartOptions<'line'> = this.getLineChartOptions();
  public polarAreaChartOptions: ChartOptions<'polarArea'> = this.getPolarAreaChartOptions();
  public radarChartOptions: ChartOptions<'radar'> = this.getRadarChartOptions();

  // Chart data
  timeAnalyticsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  monthlyContactRequestsChartData: ChartData<'line'> = { labels: [], datasets: [] };
  ideasByCategoryChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  mostActiveInvestorsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  mostSupportedFoundersChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  userCountsByGovernmentChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  userCountsByCityChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ideasByStageChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  avgAiRateByCategoryChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ideasByInvestmentTypeChartData: ChartData<'polarArea'> = { labels: [], datasets: [] };

  selectedTimeframe: TimeframeType = TimeframeType.LastMonth;
  timeframeOptions = [
    { label: 'Last Month', value: TimeframeType.LastMonth },
    { label: 'Last 3 Months', value: TimeframeType.Last3Months },
    { label: 'Last 6 Months', value: TimeframeType.Last6Months },
    { label: 'Last Year', value: TimeframeType.LastYear },
    { label: 'All Time', value: TimeframeType.AllTime }
  ];

  isDarkMode: boolean = false;
  private darkModeSubscription: Subscription = new Subscription();

  constructor(
    private analysisService: AnalysisService,
    private spinner: NgxSpinnerService,
    private darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
      this.updateChartColors();
    });

    this.spinner.show();
    this.fetchAllData();
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }

  private fetchAllData(): void {
    this.fetchCounts();
    this.fetchTimeAnalytics(this.selectedTimeframe);
    this.fetchMonthlyContactRequests();
    this.fetchIdeasByCategory();
    this.fetchMostActiveInvestors();
    this.fetchMostSupportedFounders();
    this.fetchUserCountsByGovernment();
    this.fetchUserCountsByCity();
    this.fetchIdeasByStage();
    this.fetchAvgAiRateByCategory();
    this.fetchIdeasByInvestmentType();
  }

  private getPieChartOptions(): ChartOptions<'pie'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: this.getTextColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            },
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          bodyFont: {
            family: 'Poppins, sans-serif',
            size: 12
          }
        }
      }
    };
  }

  private getDoughnutChartOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: this.getTextColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            },
            padding: 20
          }
        }
      }
    };
  }

  private getBarChartOptions(): ChartOptions<'bar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
          labels: {
            color: this.getTextColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            }
          }
        },
        tooltip: {
          enabled: true,
          bodyFont: {
            family: 'Poppins, sans-serif',
            size: 12
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: this.getAxisColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            }
          }
        },
        y: {
          grid: { color: this.getGridColor() },
          ticks: {
            color: this.getAxisColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            },
            stepSize: 1,
            callback: (value: string | number) => {
              if (typeof value === 'number' && Number.isInteger(value)) {
                return value;
              }
              return null;
            }
          }
        }
      }
    };
  }

  private getHorizontalBarChartOptions(): ChartOptions<'bar'> {
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
          labels: {
            color: this.getTextColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            }
          }
        },
        tooltip: {
          enabled: true,
          bodyFont: {
            family: 'Poppins, sans-serif',
            size: 12
          }
        }
      },
      scales: {
        x: {
          grid: { color: this.getGridColor() },
          ticks: {
            color: this.getAxisColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            },
            stepSize: 1,
            callback: (value: string | number) => {
              if (typeof value === 'number' && Number.isInteger(value)) {
                return value;
              }
              return null;
            }
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            color: this.getAxisColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            }
          }
        }
      }
    };
  }

  private getLineChartOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
          labels: {
            color: this.getTextColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            }
          }
        },
        tooltip: {
          enabled: true,
          bodyFont: {
            family: 'Poppins, sans-serif',
            size: 12
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: this.getAxisColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            }
          }
        },
        y: {
          grid: { color: this.getGridColor() },
          ticks: {
            color: this.getAxisColor(),
            font: {
              family: 'Poppins, sans-serif',
              size: 12
            },
            stepSize: 1,
            callback: (value: string | number) => {
              if (typeof value === 'number' && Number.isInteger(value)) {
                return value;
              }
              return null;
            }
          }
        }
      }
    };
  }

  private getPolarAreaChartOptions(): ChartOptions<'polarArea'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: this.getTextColor(),
            font: { family: 'Poppins, sans-serif', size: 12 },
            padding: 20
          }
        }
      }
    };
  }

  private getRadarChartOptions(): ChartOptions<'radar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
          labels: {
            color: this.getTextColor(),
            font: { family: 'Poppins, sans-serif', size: 12 }
          }
        }
      }
    };
  }

  private getTextColor(): string {
    return this.isDarkMode ? '#FFFFFF' : '#2c3e50';
  }

  private getAxisColor(): string {
    return this.isDarkMode ? '#A0AEC0' : '#7f8c8d';
  }

  private getGridColor(): string {
    return this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  }

  updateChartColors(): void {
    this.pieChartOptions = this.getPieChartOptions();
    this.doughnutChartOptions = this.getDoughnutChartOptions();
    this.barChartOptions = this.getBarChartOptions();
    this.horizontalBarChartOptions = this.getHorizontalBarChartOptions();
    this.lineChartOptions = this.getLineChartOptions();
    this.polarAreaChartOptions = this.getPolarAreaChartOptions();
    this.radarChartOptions = this.getRadarChartOptions();

    // Trigger chart updates by reassigning data
    if (this.timeAnalytics) {
      this.timeAnalyticsChartData = {...this.timeAnalyticsChartData};
    }
    if (this.monthlyContactRequests.length) {
      this.monthlyContactRequestsChartData = {...this.monthlyContactRequestsChartData};
    }
    if (this.ideasByCategory.length) {
      this.ideasByCategoryChartData = {...this.ideasByCategoryChartData};
    }
    if (this.mostActiveInvestors.length) {
      this.mostActiveInvestorsChartData = {...this.mostActiveInvestorsChartData};
    }
    if (this.mostSupportedFounders.length) {
      this.mostSupportedFoundersChartData = {...this.mostSupportedFoundersChartData};
    }
    if (this.userCountsByGovernment.length) {
      this.userCountsByGovernmentChartData = {...this.userCountsByGovernmentChartData};
    }
    if (this.userCountsByCity.length) {
      this.userCountsByCityChartData = {...this.userCountsByCityChartData};
    }
    if (this.ideasByStage.length) {
      this.ideasByStageChartData = {...this.ideasByStageChartData};
    }
    if (this.avgAiRateByCategory.length) {
      this.avgAiRateByCategoryChartData = {...this.avgAiRateByCategoryChartData};
    }
    if (this.ideasByInvestmentType.length) {
      this.ideasByInvestmentTypeChartData = {...this.ideasByInvestmentTypeChartData};
    }
  }

  // Fetch methods with proper error handling
  fetchCounts() {
    this.analysisService.getDashboardCounts().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.counts = res.data;
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching dashboard counts:', err);
        this.spinner.hide();
      }
    });
  }

  fetchTimeAnalytics(timeframe: TimeframeType) {
    this.selectedTimeframe = timeframe;
    this.analysisService.getTimeBasedAnalytics(timeframe).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.timeAnalytics = res.data;
          this.timeAnalyticsChartData = {
            labels: ['Founders Joined', 'Investors Joined', 'Ideas Submitted'],
            datasets: [{
              label: res.data.timeframe,
              data: [res.data.foundersJoined, res.data.investorsJoined, res.data.ideasSubmitted],
              backgroundColor: ['#3C91E6', '#FFCE26', '#30acaa'],
              borderRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching time analytics:', err);
        this.spinner.hide();
      }
    });
  }

  fetchMonthlyContactRequests() {
    this.analysisService.getMonthlyAcceptedContactRequests().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.monthlyContactRequests = res.data;
          this.monthlyContactRequestsChartData = {
            labels: res.data.map((d: any) => d.monthName),
            datasets: [{
              label: 'Accepted Contact Requests',
              data: res.data.map((d: any) => d.count),
              borderColor: '#FD7238',
              backgroundColor: 'rgba(253,114,56,0.3)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: '#FD7238',
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching monthly contact requests:', err);
        this.spinner.hide();
      }
    });
  }

  // Add all other fetch methods here following the same pattern...
  fetchIdeasByCategory() {
    this.analysisService.getIdeasByCategory().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.ideasByCategory = res.data;
          this.ideasByCategoryChartData = {
            labels: res.data.map((d: any) => d.categoryName),
            datasets: [{
              data: res.data.map((d: any) => d.ideasCount),
              backgroundColor: [
                '#30acaa', '#3C91E6', '#FFCE26', '#FD7238',
                '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB'
              ],
              borderWidth: 0
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching ideas by category:', err);
        this.spinner.hide();
      }
    });
  }

  fetchMostActiveInvestors() {
    this.spinner.show();
    this.analysisService.getMostActiveInvestors().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.mostActiveInvestors = res.data;
          this.mostActiveInvestorsChartData = {
            labels: res.data.map((d: any) => d.investorName),
            datasets: [{
              label: 'Requests',
              data: res.data.map((d: any) => d.requestCount),
              backgroundColor: '#FFCE26',
              borderRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching most active investors:', err);
        this.spinner.hide();
      }
    });
  }

  fetchMostSupportedFounders() {
    this.spinner.show();
    this.analysisService.getMostSupportedFounders().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.mostSupportedFounders = res.data;
          this.mostSupportedFoundersChartData = {
            labels: res.data.map((d: any) => d.founderName),
            datasets: [{
              label: 'Supported Ideas',
              data: res.data.map((d: any) => d.supportedIdeasCount),
              backgroundColor: '#30acaa', // Solid color for horizontal bars
              borderRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching most supported founders:', err);
        this.spinner.hide();
      }
    });
  }

  fetchUserCountsByGovernment() {
    this.spinner.show();
    this.analysisService.getUserCountsByGovernment().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.userCountsByGovernment = res.data;
          this.userCountsByGovernmentChartData = {
            labels: res.data.map((d: any) => d.governmentName),
            datasets: [{
              label: 'Users',
              data: res.data.map((d: any) => d.userCount),
              backgroundColor: '#3C91E6',
              borderRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching user counts by government:', err);
        this.spinner.hide();
      }
    });
  }

  fetchUserCountsByCity() {
    this.spinner.show();
    this.analysisService.getUserCountsByCity().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.userCountsByCity = res.data;
          this.userCountsByCityChartData = {
            labels: res.data.map((d: any) => d.cityName),
            datasets: [{
              label: 'Users',
              data: res.data.map((d: any) => d.userCount),
              backgroundColor: '#FFCE26',
              borderRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching user counts by city:', err);
        this.spinner.hide();
      }
    });
  }

  fetchIdeasByStage() {
    this.spinner.show();
    this.analysisService.getIdeasByStage().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.ideasByStage = res.data;
          this.ideasByStageChartData = {
            labels: res.data.map((d: any) => d.stageName),
            datasets: [{
              data: res.data.map((d: any) => d.ideasCount),
              backgroundColor: [
                '#30acaa', '#3C91E6', '#FFCE26', '#FD7238',
                '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB'
              ],
              borderWidth: 0
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching ideas by stage:', err);
        this.spinner.hide();
      }
    });
  }

  fetchAvgAiRateByCategory() {
    this.spinner.show();
    this.analysisService.getAvgAiRateByCategory().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.avgAiRateByCategory = res.data;
          this.avgAiRateByCategoryChartData = {
            labels: res.data.map((d: any) => d.categoryName),
            datasets: [{
              label: 'Avg AI Rate',
              data: res.data.map((d: any) => d.averageAiRate),
              backgroundColor: '#3C91E6',
              borderRadius: 6
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching avg AI rate by category:', err);
        this.spinner.hide();
      }
    });
  }

  fetchIdeasByInvestmentType() {
    this.spinner.show();
    this.analysisService.getIdeasByInvestmentType().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.ideasByInvestmentType = res.data;
          this.ideasByInvestmentTypeChartData = {
            labels: res.data.map((d: any) => d.investmentTypeName),
            datasets: [{
              data: res.data.map((d: any) => d.ideasCount),
              backgroundColor: [
                '#30acaa', '#3C91E6', '#FFCE26', '#FD7238',
                '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB'
              ]
            }]
          };
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching ideas by investment type:', err);
        this.spinner.hide();
      }
    });
  }
}