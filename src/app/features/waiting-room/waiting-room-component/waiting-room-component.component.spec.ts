import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomComponentComponent } from './waiting-room-component.component';

describe('WaitingRoomComponentComponent', () => {
  let component: WaitingRoomComponentComponent;
  let fixture: ComponentFixture<WaitingRoomComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitingRoomComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitingRoomComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
