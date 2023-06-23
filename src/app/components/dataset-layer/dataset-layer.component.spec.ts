import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetLayerComponent } from './dataset-layer.component';

describe('DatasetLayerComponent', () => {
  let component: DatasetLayerComponent;
  let fixture: ComponentFixture<DatasetLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});