import { Component, Inject  } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.css']
})
export class TypographyComponent {
  teamA: string[] = [];
  teamB: string[] = [];
  scoreA: number = 0;
  scoreB: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.teamA= data.teamA;
    this.teamB = data.teamB;
    this.scoreA = data.teamAScore;
    this.scoreB = data.teamBScore;

  }
}
