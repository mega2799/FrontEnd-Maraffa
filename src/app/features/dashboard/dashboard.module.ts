import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";
import { ChatModule } from "../chat/chat.module";
import { DashboardHomeComponent } from "./dashboard-home/dashboard-home.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";

@NgModule({
  declarations: [DashboardHomeComponent],
  imports: [CommonModule, DashboardRoutingModule, SharedModule, ChatModule],
})
export class DashboardModule {}
