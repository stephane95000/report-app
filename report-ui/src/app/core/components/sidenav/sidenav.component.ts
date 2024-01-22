import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgFor } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

interface Link {
  path: string;
  label: string;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatButtonModule,
    MatSidenavModule,
    HeaderComponent,
    MatIconModule,
    RouterLink,
    MatListModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  links: Link[] = [
    { path: '/', label: 'Reporting list' },
    { path: '/create-report', label: 'Create report' },
  ];
  isMobile: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isMobile = this.breakpointObserver
      .observe(['(max-width: 900px)'])
      .pipe(map(state => state.matches));
  }
}
