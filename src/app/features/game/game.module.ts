import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { CardPlayerComponent } from "./card-player/card-player.component";
import { DraggableImageComponent } from "./draggable-image-component/draggable-image-component.";
import { GameRoutingModule } from "./game-routing.module";
import { GameComponent } from "./game/game.component";

@NgModule({
  declarations: [GameComponent, CardPlayerComponent, DraggableImageComponent],
  imports: [CommonModule, SharedModule, GameRoutingModule],
})
export class GameModule {}
