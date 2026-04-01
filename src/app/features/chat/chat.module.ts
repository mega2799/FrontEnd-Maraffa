import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ChatComponent } from "./chat.component";

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
  ],
  exports: [ChatComponent],
})
export class ChatModule {}
