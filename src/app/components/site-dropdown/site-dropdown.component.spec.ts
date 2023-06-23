import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDropdownComponent } from './site-dropdown.component';

describe('SiteDropdownComponent', () => {
  let component: SiteDropdownComponent;
  let fixture: ComponentFixture<SiteDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});