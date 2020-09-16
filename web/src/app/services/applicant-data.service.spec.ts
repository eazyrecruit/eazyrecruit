import { TestBed } from '@angular/core/testing';

import { ApplicantDataService } from './applicant-data.service';

describe('ApplicantDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApplicantDataService = TestBed.get(ApplicantDataService);
    expect(service).toBeTruthy();
  });
});
