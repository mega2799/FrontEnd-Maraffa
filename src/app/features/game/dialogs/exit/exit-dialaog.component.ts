import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

// /**
//  * @title Dialog Animations
//  */
// @Component({
//   selector: 'app-exit-dialog',
//   styleUrls: ['exit-dialog.css'],
//   templateUrl: 'exit-dialog.html',
//   standalone: true,
//   imports: [MatButtonModule],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class {
//   readonly dialog = inject(MatDialog);

//   openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
//     this.dialog.open(DialogAnimationsExampleDialog, {
//       width: '250px',
//       enterAnimationDuration,
//       exitAnimationDuration,
//     });
//   }
// }

@Component({
  selector: "app-exit-dialog",
  styleUrls: ["exit-dialog.css"],
  templateUrl: "exit-dialog.html",
  // standalone: true,
  //   imports: [
  //     MatButtonModule,
  //     MatDialogActions,
  //     MatDialogClose,
  //     MatDialogTitle,
  //     MatDialogContent,
  //   ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExitDialogComponent {
  // constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {}
  //   readonly dialogRef = inject(MatDialogRef<DialogAnimationsExampleDialog>);
  // readonly dialogRef = inject(MatDialogRef<ExitDialogComponent>);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string; onExit: () => any }
  ) {}

  exitConfirmed() {
    this.data.onExit(); // Chiama la funzione onExit passata come dato
  }
}
