import { Component, Inject  } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ultima-presa',
  templateUrl: './ultima-presa.component.html',
  styleUrls: ['./ultima-presa.component.css']
})
export class UltimaPresaComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {}
}
