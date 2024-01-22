import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCard, ReportCardComponent } from './report-card.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockModule } from 'ng-mocks';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

describe('ReportCardComponent', () => {
  let fixture: ComponentFixture<ReportCardComponent>;

  const selectors = {
    card: '.report-card',
    title: 'mat-card-title',
    subtitle: 'mat-card-subtitle',
    description: '.report-card__description',
    observations: 'mat-chip',
    modifyLink: 'mat-card-actions > a:first-child',
    consultLink: 'mat-card-actions > a:last-child',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardComponent, RouterTestingModule],
    })
      .overrideComponent(ReportCardComponent, {
        remove: {
          imports: [
            MatCardModule,
            MatButtonModule,
            MatChipsModule,
            MatDividerModule,
          ],
        },
        add: {
          imports: [
            MockModule(MatCardModule),
            MockModule(MatButtonModule),
            MockModule(MatChipsModule),
            MockModule(MatDividerModule),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReportCardComponent);
    fixture.detectChanges();
  });

  it('should not render card if no input', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector(selectors.card)).toBeFalsy();
  });

  it('should display card with all info', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cardMocked: ReportCard = {
      id: '1',
      firstName: 'firstname',
      lastName: 'lastname',
      email: 'test@email.com',
      description: 'description',
      observations: [
        {
          id: 1,
          name: 'observation',
        },
      ],
      modifyPath: 'modifyPath',
      consultPath: 'consultPath',
    };

    fixture.componentRef.setInput('card', cardMocked);
    fixture.detectChanges();

    expect(compiled.querySelector(selectors.card)).toBeTruthy();
    expect(compiled.querySelector(selectors.title)?.textContent).toContain(
      `${cardMocked.id} : ${cardMocked.firstName} ${cardMocked.lastName}`
    );
    expect(compiled.querySelector(selectors.subtitle)?.textContent).toContain(
      cardMocked.email
    );
    expect(
      compiled.querySelector(selectors.description)?.textContent
    ).toContain(cardMocked.description);
    expect(compiled.querySelectorAll(selectors.observations).length).toEqual(1);
    expect(
      compiled.querySelectorAll(selectors.observations)[0]?.textContent
    ).toContain(cardMocked.observations[0].name);
    expect(
      compiled.querySelector(selectors.consultLink)?.getAttribute('href')
    ).toEqual(`/${cardMocked.consultPath}`);
    expect(
      compiled.querySelector(selectors.modifyLink)?.getAttribute('href')
    ).toEqual(`/${cardMocked.modifyPath}`);
  });
});
