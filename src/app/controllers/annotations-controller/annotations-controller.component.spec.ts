import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsControllerComponent } from './annotations-controller.component';

describe('AnnotationsControllerComponent', () => {
  let component: AnnotationsControllerComponent;
  let fixture: ComponentFixture<AnnotationsControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationsControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationsControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});