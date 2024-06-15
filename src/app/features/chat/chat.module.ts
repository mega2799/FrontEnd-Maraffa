import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NbChatModule, NbLayoutModule, NbThemeModule } from "@nebular/theme";
import { ChatComponent } from "./chat.component";

@NgModule({
  declarations: [ChatComponent],
  imports: [
    NbChatModule,
    CommonModule,
    NbLayoutModule,
    NbThemeModule.forRoot({ name: "default" }),
  ],
  exports: [ChatComponent],
})
export class ChatModule {}
