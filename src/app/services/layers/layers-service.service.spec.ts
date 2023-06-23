import { TestBed, inject } from '@angular/core/testing';

import { LayersServiceService } from './layers-service.service';

describe('LayersServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayersServiceService]
    });
  });

  it('should be created', inject([LayersServiceService], (service: LayersServiceService) => {
    expect(service).toBeTruthy();
  }));
});