import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UltimaPresaRoutingModule } from './ultima-presa-routing.module';
import { UltimaPresaComponent } from './ultima-presa/ultima-presa.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [UltimaPresaComponent],
  imports: [
    CommonModule,
    SharedModule,
    UltimaPresaRoutingModule
  ]
})
export class UltimaPresaModule { }
