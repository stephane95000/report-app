import { TestBed } from '@angular/core/testing';

import { NotificationSnackbarService } from './notification-snackbar.service';

describe('NotificationSnackbarService', () => {
  let service: NotificationSnackbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationSnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
