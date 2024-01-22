import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { IFilterForm } from '../shared/models/filter-form.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subject, takeUntil } from 'rxjs';

interface FilterForm {
  id: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  email: FormControl<string | null>;
}

@Component({
  selector: 'app-report-filter-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  templateUrl: './report-filter-form.component.html',
  styleUrl: './report-filter-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportFilterFormComponent implements OnDestroy {
  @Output() formChangeEvent = new EventEmitter<IFilterForm>();

  public filterForm = new FormGroup<FilterForm>({
    id: new FormControl<string>(''),
    firstName: new FormControl<string>(''),
    lastName: new FormControl<string>(''),
    email: new FormControl<string>(''),
  });

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor() {
    this.filterForm.valueChanges
      .pipe(debounceTime(400), takeUntil(this.ngUnsubscribe))
      .subscribe(value => {
        const filter: IFilterForm = {
          id: value.id!,
          firstName: value.firstName!,
          lastName: value.lastName!,
          email: value.email!,
        };
        this.formChangeEvent.emit(filter);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
