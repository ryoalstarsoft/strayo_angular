import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotplanningToolComponent } from './shotplanning-tool.component';

describe('ShotplanningToolComponent', () => {
  let component: ShotplanningToolComponent;
  let fixture: ComponentFixture<ShotplanningToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShotplanningToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShotplanningToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});