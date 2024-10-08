import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { GameComponent } from "./game/game.component";

const routes: Routes = [
  {
    path: ":gameID",
    component: LayoutComponent,
    children: [{ path: "", component: GameComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
