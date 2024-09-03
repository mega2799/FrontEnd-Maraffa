import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameChatComponent } from './game-chat.component';

describe('ChatComponent', () => {
  let component: GameChatComponent;
  let fixture: ComponentFixture<GameChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
