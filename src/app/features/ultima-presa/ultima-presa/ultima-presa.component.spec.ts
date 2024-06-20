import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimaPresaComponent } from './ultima-presa.component';

describe('UltimaPresaComponent', () => {
  let component: UltimaPresaComponent;
  let fixture: ComponentFixture<UltimaPresaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UltimaPresaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UltimaPresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
