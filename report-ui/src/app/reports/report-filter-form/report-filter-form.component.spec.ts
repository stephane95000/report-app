import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ReportFilterFormComponent } from './report-filter-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ReportFilterFormComponent', () => {
  let component: ReportFilterFormComponent;
  let fixture: ComponentFixture<ReportFilterFormComponent>;

  const selectors = {
    id: '[formControlName="id"]',
    firstName: '[formControlName="firstName"]',
    lastName: '[formControlName="lastName"]',
    email: '[formControlName="email"]',
  };

  const typeInFormInput = (input: HTMLInputElement | null, value: string) => {
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportFilterFormComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFilterFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should emit formChangeEvent when typing in the form', fakeAsync(() => {
    const compiled = fixture.nativeElement as HTMLElement;
    const formChangeEventSpy = spyOn(
      component.formChangeEvent,
      'emit'
    ).and.callThrough();

    fixture.detectChanges();

    typeInFormInput(compiled.querySelector(selectors.firstName), 'firstName');
    typeInFormInput(compiled.querySelector(selectors.lastName), 'lastName');
    typeInFormInput(compiled.querySelector(selectors.id), '1');
    typeInFormInput(compiled.querySelector(selectors.email), 'email');
    fixture.detectChanges();
    tick(500);

    fixture.whenStable().then(() => {
      expect(component.filterForm.controls.firstName.value).toEqual(
        'firstName'
      );
      expect(component.filterForm.controls.lastName.value).toEqual('lastName');
      expect(component.filterForm.controls.email.value).toEqual('email');
      expect(component.filterForm.controls.id.value).toEqual('1');
      expect(formChangeEventSpy).toHaveBeenCalledWith({
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        id: '1',
      });
    });
  }));
});
