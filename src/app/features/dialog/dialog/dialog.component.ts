import { Component, Inject  } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
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
