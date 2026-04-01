import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { AllGamesRoutingModule } from './allgames-routing.module';
import { GameListComponent } from './game-list/game-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
   AllGamesRoutingModule 
  ],
  declarations: [GameListComponent]
})
export class AllGamesModule { }
