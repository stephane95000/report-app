import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./reports/reports.routes').then(m => m.ReportsRoutes),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./reports/reports.routes').then(m => m.ReportsRoutes),
  },
];
