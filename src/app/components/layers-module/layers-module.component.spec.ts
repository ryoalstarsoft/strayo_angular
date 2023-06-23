import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersModuleComponent } from './layers-module.component';

describe('LayersModuleComponent', () => {
  let component: LayersModuleComponent;
  let fixture: ComponentFixture<LayersModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayersModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayersModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});