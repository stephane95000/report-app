import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ReportCard {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  observations: Array<{ id: number; name: string }>;
  modifyPath: string;
  consultPath: string;
}

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    RouterLink,
    NgFor,
    NgIf,
  ],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCardComponent {
  @Input() card?: ReportCard;
}
