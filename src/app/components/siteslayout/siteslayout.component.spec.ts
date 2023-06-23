import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteslayoutComponent } from './siteslayout.component';

describe('SiteslayoutComponent', () => {
  let component: SiteslayoutComponent;
  let fixture: ComponentFixture<SiteslayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteslayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteslayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
