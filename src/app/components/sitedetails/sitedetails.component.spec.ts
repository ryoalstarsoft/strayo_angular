import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitedetailsComponent } from './sitedetails.component';

describe('SitedetailsComponent', () => {
  let component: SitedetailsComponent;
  let fixture: ComponentFixture<SitedetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitedetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
