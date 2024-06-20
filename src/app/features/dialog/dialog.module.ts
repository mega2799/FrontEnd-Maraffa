import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogRoutingModule } from './dialog-routing.module';
import { DialogComponent } from './dialog/dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [DialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    DialogRoutingModule
  ]
})
export class DialogModule { }
