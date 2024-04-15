import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game/game.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GameRoutingModule } from './game-routing.module';
import { CardPlayerComponent } from './card-player/card-player.component';



@NgModule({
  declarations: [
    GameComponent,
    CardPlayerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GameRoutingModule
  ]
})
export class GameModule { }
