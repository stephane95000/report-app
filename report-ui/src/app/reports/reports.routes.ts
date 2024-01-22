import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';

export const ReportsRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./report-list/report-list.component').then(
            c => c.ReportListComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./report-list/report-list.component').then(
            c => c.ReportListComponent
          ),
      },
      {
        path: 'report/:id',
        loadComponent: () =>
          import('./report-details/report-details.component').then(
            c => c.ReportDetailsComponent
          ),
      },
      {
        path: 'create-report',
        loadComponent: () =>
          import('./create-report/create-report.component').then(
            c => c.CreateReportComponent
          ),
      },
      {
        path: 'update-report/:id',
        loadComponent: () =>
          import('./update-report/update-report.component').then(
            c => c.UpdateReportComponent
          ),
      },
    ],
  },
];
