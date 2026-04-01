import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as uuid from "uuid";
import { WebSocketGameService } from "./core/services/websocket.game";

@Component({
  selector: "app-root",
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private ws: WebSocketGameService
  ) {}
  ngOnInit() {
    this.createClientUUID();
    if (localStorage.getItem("authorized") === null) {
      this.router.navigate(["/auth/login"]);
    }
  }

  createClientUUID() {
    if (localStorage.getItem("UUID") === null) {
      localStorage.setItem("UUID", uuid.v4());
    }
  }
}
