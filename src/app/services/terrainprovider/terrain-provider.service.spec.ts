import { TestBed, inject } from '@angular/core/testing';

import { TerrainProviderService } from './terrain-provider.service';

describe('TerrainProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TerrainProviderService]
    });
  });

  it('should be created', inject([TerrainProviderService], (service: TerrainProviderService) => {
    expect(service).toBeTruthy();
  }));
});
