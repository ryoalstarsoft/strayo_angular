import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnnotationFormComponent } from './new-annotation-form.component';

describe('NewAnnotationFormComponent', () => {
  let component: NewAnnotationFormComponent;
  let fixture: ComponentFixture<NewAnnotationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAnnotationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAnnotationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});