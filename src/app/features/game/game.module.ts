import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game/game.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GameRoutingModule } from './game-routing.module';



@NgModule({
  declarations: [
    GameComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GameRoutingModule
  ]
})
export class GameModule { }
