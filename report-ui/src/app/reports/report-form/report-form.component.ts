import { BackNavigationService } from '../../shared/services/back-navigation.service';
import { ReportService } from '../shared/services/report.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Report } from '../shared/models/report.interface';
import {
  catchError,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { IReportForm } from '../shared/models/report-form.interface';
import { Router } from '@angular/router';
import { Gender } from '../shared/models/gender.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationSnackbarService } from '../../shared/services/notification-snackbar.service';

interface ReportForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  gender: FormControl<string>;
  birthDate: FormControl<Date | null>;
  description: FormControl<string>;
  observations: FormControl<number[]>;
}

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportFormComponent implements OnInit, OnDestroy {
  @Input() report?: Report;

  public buttonLabel = 'CREATE';
  public isSubmitInProgress?: boolean;
  public observationsChips$?: Observable<{
    loading: boolean;
    value?: number[];
  }>;
  public observations?: Map<number, string>;
  public genders = Object.values(Gender);
  public generalError = false;
  public minDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 100)
  );
  public maxDate = new Date(new Date().setDate(new Date().getDate() - 1));
  public reportForm = new FormGroup<ReportForm>({
    firstName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    lastName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    gender: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    birthDate: new FormControl<Date | null>(null, [Validators.required]),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(256)],
    }),
    observations: new FormControl<number[]>([], { nonNullable: true }),
  });

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly reportService: ReportService,
    private readonly router: Router,
    private readonly backNavigationService: BackNavigationService,
    private readonly notificationSnackbarService: NotificationSnackbarService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initReportForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public submitReportForm(): void {
    if (this.reportForm.valid && !this.isSubmitInProgress) {
      if (this.reportForm.dirty) {
        const report = this.getIReportForm();
        this.createOrUpdateForm(report);
      } else {
        this.router.navigateByUrl('/');
      }
    }
  }

  public goBack(): void {
    this.backNavigationService.back();
  }

  private createOrUpdateForm(value: IReportForm): void {
    this.isSubmitInProgress = true;
    let submitReport$: Observable<void>;
    let notificationMessage: string;
    if (this.report) {
      submitReport$ = this.reportService.updateReport(this.report.id, value);
      notificationMessage = 'Report updated successfully';
    } else {
      submitReport$ = this.reportService.createReport(value);
      notificationMessage = 'Report created successfully';
    }

    submitReport$.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: () => {
        this.isSubmitInProgress = false;
        this.changeDetectorRef.detectChanges();
        this.router.navigateByUrl('/');
        this.notificationSnackbarService.success(notificationMessage);
      },
      error: err => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 400 &&
          this.isEmailAlreadyUsed(err)
        ) {
          this.reportForm.controls.email.setErrors({ emailAlreadyUsed: true });
        } else {
          this.generalError = true;
        }
        this.isSubmitInProgress = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private isEmailAlreadyUsed(err: HttpErrorResponse): boolean {
    return err.error?.['author']?.['email']?.includes(
      'This value already exist'
    );
  }

  private initReportForm(): void {
    this.observationsChips$ = this.reportService.getObservations().pipe(
      map(observations => {
        this.observations = new Map(
          observations.map(element => [element.id, element.name])
        );
        const value = observations.map(observation => observation.id);
        return { loading: false, value };
      }),
      startWith({ loading: true }),
      catchError(() => of({ loading: false }))
    );

    if (this.report) {
      this.buttonLabel = 'UPDATE';
      this.reportForm.controls.firstName.setValue(
        this.report.author.first_name
      );
      this.reportForm.controls.lastName.setValue(this.report.author.last_name);
      this.reportForm.controls.birthDate.setValue(
        this.report.author.birth_date
      );
      this.reportForm.controls.email.setValue(this.report.author.email);
      this.reportForm.controls.gender.setValue(this.report.author.sex);
      this.reportForm.controls.description.setValue(this.report.description);
      this.reportForm.controls.observations.setValue(
        this.report.observations.map(v => v.id)
      );
    }
  }

  private getIReportForm(): IReportForm {
    return {
      author: {
        first_name: this.reportForm.controls.firstName.value,
        last_name: this.reportForm.controls.lastName.value,
        email: this.reportForm.controls.email.value,
        birth_date: this.reportForm.controls.birthDate.value!,
        sex: this.reportForm.controls.gender.value as Gender,
      },
      observations: this.reportForm.controls.observations.value,
      description: this.reportForm.controls.description.value,
    };
  }
}
