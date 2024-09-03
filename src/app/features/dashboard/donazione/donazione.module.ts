import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DonazioneRoutingModule } from './donazione-routing.module';
import { DonazioneComponent } from './donazione/donazione.component';



@NgModule({
  declarations: [
    DonazioneComponent
  ],
  imports: [
    CommonModule,
    DonazioneRoutingModule
  ]
})
export class DonazioneModule { }
