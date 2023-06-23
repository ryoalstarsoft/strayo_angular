import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';

import { GraphQLModule } from './graphql/graphql.module';

import { reducers } from './reducers/index';

import { SitesEffects } from './sites/effects/sites.effects';
import { SitesService } from './sites/sites.service';
import { DatasetsService } from './datasets/datasets.service';
import { TerrainProviderService } from './services/terrainprovider/terrain-provider.service';
import { Map3dService } from './services/map-3d.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        GraphQLModule,
        StoreModule.forRoot(reducers),
      ],
      providers: [SitesService, DatasetsService, TerrainProviderService, Map3dService],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
  }));
});