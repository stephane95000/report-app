import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFormComponent } from './report-form.component';
import { ReportService } from '../shared/services/report.service';
import { NotificationSnackbarService } from '../../shared/services/notification-snackbar.service';
import { Router } from '@angular/router';
import { BackNavigationService } from '../../shared/services/back-navigation.service';
import { of, Subject } from 'rxjs';
import { Observation } from '../shared/models/observation.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Gender } from '../shared/models/gender.enum';
import { Report } from '../shared/models/report.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('ReportFormComponent', () => {
  let component: ReportFormComponent;
  let fixture: ComponentFixture<ReportFormComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let notificationSnackbarService: jasmine.SpyObj<NotificationSnackbarService>;
  let backNavService: jasmine.SpyObj<BackNavigationService>;
  let router: jasmine.SpyObj<Router>;

  const selectors = {
    form: 'form',
    loader: '.report-form__empty > mat-spinner',
    errorBlock: 'p.report-form__empty',
    submitButton: '[type="submit"]',
    inputs: {
      firstName: '[formControlName="firstName"]',
      lastName: '[formControlName="lastName"]',
      email: '[formControlName="email"]',
      description: '[formControlName="description"]',
      birthDate: '[formControlName="birthDate"]',
      genderSelect: 'mat-select',
      genderOptions: 'mat-option',
    },
    generalError: '.report-form__general-error',
    cancelButton: '.report-form__actions > button:first-child',
  };

  const typeInFormInput = (input: HTMLInputElement | null, value: string) => {
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  };

  beforeEach(async () => {
    reportService = jasmine.createSpyObj('ReportService', [
      'updateReport',
      'createReport',
      'getObservations',
    ]);
    notificationSnackbarService = jasmine.createSpyObj(
      'NotificationSnackbarService',
      ['success']
    );
    backNavService = jasmine.createSpyObj('BackNavigationService', ['back']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [ReportFormComponent, NoopAnimationsModule],
      providers: [
        { provide: ReportService, useValue: reportService },
        {
          provide: NotificationSnackbarService,
          useValue: notificationSnackbarService,
        },
        { provide: BackNavigationService, useValue: backNavService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFormComponent);
    component = fixture.componentInstance;
  });

  it('should render the form to create new report', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const observationsSubject$ = new Subject<Observation[]>();
    const observationSpy = reportService.getObservations.and.returnValue(
      observationsSubject$.asObservable()
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(observationSpy).toHaveBeenCalled();
    expect(compiled.querySelector(selectors.form)).toBeFalsy();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();

    observationsSubject$.next(observationsMock);
    observationsSubject$.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.form)).toBeTruthy();
    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(
      compiled.querySelector(selectors.submitButton)?.textContent
    ).toContain('CREATE');
    expect(component.reportForm.value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      birthDate: null,
      description: '',
      observations: [],
    });
  });

  it('should render the form to update a report', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const reportMock: Report = {
      id: 1,
      observations: [{ id: 1, name: 'Observation 1' }],
      author: {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('1995-12-17'),
        sex: Gender.MALE,
      },
      description: 'description',
    };
    const observationsSubject$ = new Subject<Observation[]>();
    const observationSpy = reportService.getObservations.and.returnValue(
      observationsSubject$.asObservable()
    );

    fixture.componentRef.setInput('report', reportMock);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(observationSpy).toHaveBeenCalled();
    expect(compiled.querySelector(selectors.form)).toBeFalsy();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();

    observationsSubject$.next(observationsMock);
    observationsSubject$.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.form)).toBeTruthy();
    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(
      compiled.querySelector(selectors.submitButton)?.textContent
    ).toContain('UPDATE');
    expect(component.reportForm.value).toEqual({
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@test.com',
      gender: 'Male',
      birthDate: new Date('1995-12-17'),
      description: 'description',
      observations: [1],
    });
  });

  it('should not render the form when error to retrieve observations', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const errorResponse = new HttpErrorResponse({
      status: 500,
    });
    const observationsSubject$ = new Subject<Observation[]>();
    const observationSpy = reportService.getObservations.and.returnValue(
      observationsSubject$.asObservable()
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(observationSpy).toHaveBeenCalled();
    expect(compiled.querySelector(selectors.form)).toBeFalsy();
    expect(compiled.querySelector(selectors.loader)).toBeTruthy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeFalsy();

    observationsSubject$.error(errorResponse);
    observationsSubject$.complete();
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.form)).toBeFalsy();
    expect(compiled.querySelector(selectors.loader)).toBeFalsy();
    expect(compiled.querySelector(selectors.errorBlock)).toBeTruthy();
  });

  it('should create a new report when form is submit', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const submitReportFormSpy = spyOn(
      component,
      'submitReportForm'
    ).and.callThrough();
    const reportSubject = new Subject<void>();
    const createReportSpy = reportService.createReport.and.returnValue(
      reportSubject.asObservable()
    );
    const routerSpy = router.navigateByUrl.and.returnValue(
      Promise.resolve(true)
    );
    const notificationBarSpy =
      notificationSnackbarService.success.and.returnValue();
    reportService.getObservations.and.returnValue(of(observationsMock));

    fixture.detectChanges();

    expect(compiled.querySelector(selectors.form)).toBeTruthy();

    typeInFormInput(
      compiled.querySelector(selectors.inputs.firstName),
      'firstname'
    );
    typeInFormInput(
      compiled.querySelector(selectors.inputs.lastName),
      'lastName'
    );
    typeInFormInput(
      compiled.querySelector(selectors.inputs.description),
      'description'
    );
    typeInFormInput(
      compiled.querySelector(selectors.inputs.email),
      'email@test.com'
    );
    typeInFormInput(
      compiled.querySelector(selectors.inputs.birthDate),
      new Date('01-01-2023').toLocaleDateString('en-GB')
    );
    const genderSelect = fixture.debugElement.query(
      By.css(selectors.inputs.genderSelect)
    ).nativeElement;
    genderSelect.click();
    fixture.detectChanges();
    const genderOption = fixture.debugElement.query(
      By.css(selectors.inputs.genderOptions)
    ).nativeElement;
    genderOption.click();
    const form = fixture.debugElement.query(By.css(selectors.form));
    form.triggerEventHandler('ngSubmit');
    fixture.detectChanges();

    expect(submitReportFormSpy).toHaveBeenCalled();
    expect(component.reportForm.value).toEqual({
      firstName: 'firstname',
      lastName: 'lastName',
      email: 'email@test.com',
      gender: 'Male',
      birthDate: new Date('01-01-2023'),
      description: 'description',
      observations: [],
    });
    expect(component.isSubmitInProgress).toBeTruthy();
    expect(createReportSpy).toHaveBeenCalledWith({
      author: {
        first_name: 'firstname',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      observations: [],
      description: 'description',
    });

    reportSubject.next();
    reportSubject.complete();

    expect(component.isSubmitInProgress).toBeFalsy();
    expect(routerSpy).toHaveBeenCalled();
    expect(notificationBarSpy).toHaveBeenCalledWith(
      'Report created successfully'
    );
  });

  it('should update the report when form is submit', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportMock: Report = {
      id: 1,
      observations: [{ id: 1, name: 'Observation 1' }],
      author: {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      description: 'description',
    };
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const submitReportFormSpy = spyOn(
      component,
      'submitReportForm'
    ).and.callThrough();
    const reportSubject = new Subject<void>();
    const updateReportSpy = reportService.updateReport.and.returnValue(
      reportSubject.asObservable()
    );
    const routerSpy = router.navigateByUrl.and.returnValue(
      Promise.resolve(true)
    );
    const notificationBarSpy =
      notificationSnackbarService.success.and.returnValue();
    reportService.getObservations.and.returnValue(of(observationsMock));

    fixture.componentRef.setInput('report', reportMock);
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.form)).toBeTruthy();

    typeInFormInput(
      compiled.querySelector(selectors.inputs.firstName),
      'newFirstName'
    );
    const form = fixture.debugElement.query(By.css(selectors.form));
    form.triggerEventHandler('ngSubmit');
    fixture.detectChanges();

    expect(submitReportFormSpy).toHaveBeenCalled();
    expect(component.reportForm.value).toEqual({
      firstName: 'newFirstName',
      lastName: 'lastName',
      email: 'email@test.com',
      gender: 'Male',
      birthDate: new Date('01-01-2023'),
      description: 'description',
      observations: [1],
    });
    expect(component.isSubmitInProgress).toBeTruthy();
    expect(updateReportSpy).toHaveBeenCalledWith(reportMock.id, {
      author: {
        first_name: 'newFirstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      observations: [1],
      description: 'description',
    });

    reportSubject.next();
    reportSubject.complete();

    expect(component.isSubmitInProgress).toBeFalsy();
    expect(routerSpy).toHaveBeenCalled();
    expect(notificationBarSpy).toHaveBeenCalledWith(
      'Report updated successfully'
    );
  });

  it('should call submitReportForm() and raise an email error', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportMock: Report = {
      id: 1,
      observations: [{ id: 1, name: 'Observation 1' }],
      author: {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      description: 'description',
    };
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { author: { email: ['This value already exist'] } },
    });
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const submitReportFormSpy = spyOn(
      component,
      'submitReportForm'
    ).and.callThrough();
    const reportSubject = new Subject<void>();
    const updateReportSpy = reportService.updateReport.and.returnValue(
      reportSubject.asObservable()
    );
    const routerSpy = router.navigateByUrl.and.returnValue(
      Promise.resolve(true)
    );
    const notificationBarSpy =
      notificationSnackbarService.success.and.returnValue();
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.componentRef.setInput('report', reportMock);
    fixture.detectChanges();

    typeInFormInput(
      compiled.querySelector(selectors.inputs.firstName),
      'newFirstName'
    );
    const form = fixture.debugElement.query(By.css(selectors.form));
    form.triggerEventHandler('ngSubmit');
    fixture.detectChanges();

    expect(submitReportFormSpy).toHaveBeenCalled();
    expect(component.isSubmitInProgress).toBeTruthy();
    expect(updateReportSpy).toHaveBeenCalledWith(reportMock.id, {
      author: {
        first_name: 'newFirstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      observations: [1],
      description: 'description',
    });

    reportSubject.error(errorResponse);
    reportSubject.complete();

    expect(component.isSubmitInProgress).toBeFalsy();
    expect(routerSpy).not.toHaveBeenCalled();
    expect(notificationBarSpy).not.toHaveBeenCalled();
    expect(
      component.reportForm.controls.email.hasError('emailAlreadyUsed')
    ).toBeTruthy();
  });

  it('should call submitReportForm() and raise a general error', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const reportMock: Report = {
      id: 1,
      observations: [{ id: 1, name: 'Observation 1' }],
      author: {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      description: 'description',
    };
    const errorResponse = new HttpErrorResponse({
      status: 500,
      error: {},
    });
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const submitReportFormSpy = spyOn(
      component,
      'submitReportForm'
    ).and.callThrough();
    const reportSubject = new Subject<void>();
    const updateReportSpy = reportService.updateReport.and.returnValue(
      reportSubject.asObservable()
    );
    const routerSpy = router.navigateByUrl.and.returnValue(
      Promise.resolve(true)
    );
    const notificationBarSpy =
      notificationSnackbarService.success.and.returnValue();
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.componentRef.setInput('report', reportMock);
    fixture.detectChanges();

    typeInFormInput(
      compiled.querySelector(selectors.inputs.firstName),
      'newFirstName'
    );
    const form = fixture.debugElement.query(By.css(selectors.form));
    form.triggerEventHandler('ngSubmit');
    fixture.detectChanges();

    expect(submitReportFormSpy).toHaveBeenCalled();
    expect(component.isSubmitInProgress).toBeTruthy();
    expect(updateReportSpy).toHaveBeenCalledWith(reportMock.id, {
      author: {
        first_name: 'newFirstName',
        last_name: 'lastName',
        email: 'email@test.com',
        birth_date: new Date('01-01-2023'),
        sex: Gender.MALE,
      },
      observations: [1],
      description: 'description',
    });

    reportSubject.error(errorResponse);
    reportSubject.complete();
    fixture.detectChanges();

    expect(component.isSubmitInProgress).toBeFalsy();
    expect(routerSpy).not.toHaveBeenCalled();
    expect(notificationBarSpy).not.toHaveBeenCalled();
    expect(compiled.querySelector(selectors.generalError)).toBeTruthy();
  });

  it('should return false when reportForm.valid is called without the required data', () => {
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const formData = {
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      birthDate: null,
      description: '',
      observations: [],
    };
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.detectChanges();

    component.reportForm.setValue(formData);

    expect(component.reportForm.valid).toBeFalsy();
    expect(
      component.reportForm.controls.firstName.hasError('required')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.lastName.hasError('required')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.description.hasError('required')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.email.hasError('required')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.gender.hasError('required')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.birthDate.hasError('required')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.observations.hasError('required')
    ).toBeFalsy();
  });

  it('should return false when reportForm.valid is called without a correct birth date', () => {
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const formData = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@test.com',
      gender: Gender.MALE,
      birthDate: new Date(),
      description: 'description',
      observations: [1],
    };
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.detectChanges();

    component.reportForm.setValue(formData);

    expect(component.reportForm.valid).toBeFalsy();
    expect(
      component.reportForm.controls.birthDate.hasError('matDatepickerMax')
    ).toBeTruthy();

    const date = new Date(
      new Date().setFullYear(new Date().getFullYear() - 101)
    );
    component.reportForm.controls.birthDate.setValue(date);

    expect(component.reportForm.valid).toBeFalsy();
    expect(
      component.reportForm.controls.birthDate.hasError('matDatepickerMin')
    ).toBeTruthy();
  });

  it('should return false when reportForm.valid is called without a correct email', () => {
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const date = new Date(new Date().setDate(new Date().getDate() - 1));
    const formData = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'incorrect.com',
      gender: Gender.MALE,
      birthDate: date,
      description: 'description',
      observations: [1],
    };
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.detectChanges();

    component.reportForm.setValue(formData);

    expect(component.reportForm.valid).toBeFalsy();
    expect(component.reportForm.controls.email.hasError('email')).toBeTruthy();
  });

  it('should return false when reportForm.valid is called with max length exceeded', () => {
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const date = new Date(new Date().setDate(new Date().getDate() - 1));
    const formData = {
      firstName: 'x'.repeat(51),
      lastName: 'x'.repeat(51),
      email: 'incorrect.com',
      gender: Gender.MALE,
      birthDate: date,
      description: 'x'.repeat(257),
      observations: [1],
    };
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.detectChanges();

    component.reportForm.setValue(formData);

    expect(component.reportForm.valid).toBeFalsy();
    expect(
      component.reportForm.controls.firstName.hasError('maxlength')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.lastName.hasError('maxlength')
    ).toBeTruthy();
    expect(
      component.reportForm.controls.description.hasError('maxlength')
    ).toBeTruthy();
  });

  it('should call backNavigationService when go cancel button clicked', () => {
    const observationsMock: Observation[] = [
      { id: 1, name: 'observation 1 ' },
      { id: 2, name: 'observation 2' },
    ];
    const goBackSpy = spyOn(component, 'goBack').and.callThrough();
    const backNavSpy = backNavService.back.and.returnValue();
    reportService.getObservations.and.returnValue(of(observationsMock));
    fixture.detectChanges();

    const cancelButton = fixture.debugElement.query(
      By.css(selectors.cancelButton)
    );
    cancelButton.triggerEventHandler('click');

    expect(goBackSpy).toHaveBeenCalled();
    expect(backNavSpy).toHaveBeenCalled();
  });
});
