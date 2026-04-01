import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "src/app/shared/shared.module";
import { GameChatModule } from "../game-chat/game-chat.module";
import { CardPlayerComponent } from "./card-player/card-player.component";
import { DraggableImageComponent } from "./draggable-image-component/draggable-image-component.";
import { GameRoutingModule } from "./game-routing.module";
import { GameComponent } from "./game/game.component";
import { MatDialogActions } from "@angular/material/dialog";

@NgModule({
  declarations: [GameComponent, CardPlayerComponent, DraggableImageComponent],
  imports: [
    CommonModule,
    SharedModule,
    GameRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    GameChatModule,
  ],
})
export class GameModule {}
