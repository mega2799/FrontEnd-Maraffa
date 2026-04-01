import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "src/app/shared/shared.module";
import { ExitDialogComponent } from "./exit-dialaog.component";

@NgModule({
  declarations: [ExitDialogComponent],
  imports: [
    MatButtonModule,
    // MatDialogClose,
    // MatDialogTitle,
    // MatDialogContent,
    CommonModule,
    SharedModule,
    MatInputModule,
  ],
})
export class ExitDialogModule {}
