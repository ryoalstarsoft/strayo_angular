import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetShotplanningComponent } from './dataset-shotplanning.component';

describe('DatasetShotplanningComponent', () => {
  let component: DatasetShotplanningComponent;
  let fixture: ComponentFixture<DatasetShotplanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetShotplanningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetShotplanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});