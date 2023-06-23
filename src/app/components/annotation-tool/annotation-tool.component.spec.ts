import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationToolComponent } from './annotation-tool.component';

describe('AnnotationToolComponent', () => {
  let component: AnnotationToolComponent;
  let fixture: ComponentFixture<AnnotationToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});