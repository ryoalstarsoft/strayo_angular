import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetLayoutComponent } from './dataset-layout.component';

describe('DatasetLayoutComponent', () => {
  let component: DatasetLayoutComponent;
  let fixture: ComponentFixture<DatasetLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
