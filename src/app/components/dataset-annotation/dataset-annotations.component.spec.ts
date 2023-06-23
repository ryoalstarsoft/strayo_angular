import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetAnnotationsComponent } from './dataset-annotations.component';

describe('DatasetAnnotationsComponent', () => {
  let component: DatasetAnnotationsComponent;
  let fixture: ComponentFixture<DatasetAnnotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetAnnotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetAnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});