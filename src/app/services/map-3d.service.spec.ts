import { TestBed, inject } from '@angular/core/testing';

import { Map3dService } from './map-3d.service';

describe('Map3dService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Map3dService]
    });
  });

  it('should be created', inject([Map3dService], (service: Map3dService) => {
    expect(service).toBeTruthy();
  }));
});
