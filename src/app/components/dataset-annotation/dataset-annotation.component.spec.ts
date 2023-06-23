import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetAnnotationComponent } from './dataset-annotation.component';

describe('DatasetAnnotationComponent', () => {
  let component: DatasetAnnotationComponent;
  let fixture: ComponentFixture<DatasetAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});