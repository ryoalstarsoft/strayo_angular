import { TestBed, inject } from '@angular/core/testing';

import { DatasetsService } from './datasets.service';

describe('DatasetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatasetsService]
    });
  });

  it('should be created', inject([DatasetsService], (service: DatasetsService) => {
    expect(service).toBeTruthy();
  }));
});
