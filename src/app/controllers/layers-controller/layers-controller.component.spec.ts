import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersControllerComponent } from './layers-controller.component';

describe('LayersControllerComponent', () => {
  let component: LayersControllerComponent;
  let fixture: ComponentFixture<LayersControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayersControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayersControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});