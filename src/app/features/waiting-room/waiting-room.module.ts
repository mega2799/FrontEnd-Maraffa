import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaitingRoomComponentComponent } from './waiting-room-component/waiting-room-component.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { WaitingRoomRoutingModule } from './waiting-room-routing.module';



@NgModule({
  declarations: [
    WaitingRoomComponentComponent
  ],
  imports: [
    CommonModule,
        SharedModule,
        WaitingRoomRoutingModule
  ]
})
export class WaitingRoomModule { }
