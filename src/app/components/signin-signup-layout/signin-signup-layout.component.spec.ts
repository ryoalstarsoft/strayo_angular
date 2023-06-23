import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninSignupLayoutComponent } from './signin-signup-layout.component';

describe('SigninSignupLayoutComponent', () => {
  let component: SigninSignupLayoutComponent;
  let fixture: ComponentFixture<SigninSignupLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigninSignupLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninSignupLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});