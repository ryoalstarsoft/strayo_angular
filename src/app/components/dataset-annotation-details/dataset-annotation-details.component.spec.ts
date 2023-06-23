import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetAnnotationDetailsComponent } from './dataset-annotation-details.component';

describe('DatasetAnnotationDetailsComponent', () => {
  let component: DatasetAnnotationDetailsComponent;
  let fixture: ComponentFixture<DatasetAnnotationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetAnnotationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetAnnotationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});