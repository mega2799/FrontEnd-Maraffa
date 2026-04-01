import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonazioneComponent } from './donazione.component';

describe('DonazioneComponent', () => {
  let component: DonazioneComponent;
  let fixture: ComponentFixture<DonazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonazioneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
