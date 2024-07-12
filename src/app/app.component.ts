import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as uuid from "uuid";
import { GameService } from "./core/services/game.service";
import { WebSocketGameService } from "./core/services/websocket.game";
import { IpServiceService } from "./ip-service.service";

@Component({
  selector: "app-root",
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  public interval: number = 1;
  constructor(
    private ip: IpServiceService,
    private router: Router,
    private ws: WebSocketGameService,
    private gameService: GameService
  ) {}
  ngOnInit() {
    this.createClientUUID();
    if (localStorage.getItem("authorized") === null) {
      this.router.navigate(["/auth/login"]);
    }

    // this.ws.clientID = localStorage.getItem("UUID") as string;
    // this.ws.initWebSocket();
    // this.ws.webSocket$
    //   .pipe(
    //     catchError((error) => {
    //       this.interval = 1;
    //       return throwError(() => new Error(error));
    //     }),
    //     retry({ delay: 5_000 })
    //     // takeUntilDestroyed()
    //   )
    //   .subscribe((value: any) => {
    //     // response event
    //     console.log("WTF is this: ", value);
    //     const response = JSON.parse(value);
    //     console.log("WTF is this: ", response);
    //     // {"gameID":"5758e54e-f73d-4344-910c-1662bba32108","event":"userTurn","turn":2,"userTurn":"fede"}
    //     switch (response.event) {
    //       case "userTurn":
    //         this.turnChanegeEvent(response);
    //         break;
    //       default:
    //         break;
    //     }
    //   });
  }

  turnChanegeEvent(response: any) {
    // this.gameService.currentPlayer = response.userTurn;
  }

  createClientUUID() {
    if (localStorage.getItem("UUID") === null) {
      localStorage.setItem("UUID", uuid.v4());
    }
  }
  getIP() {
    this.ip.getIPAddress().subscribe((res: any) => {
      localStorage.setItem("UUID", res.ip);
    });
  }
  updateInterval(interval: number) {
    this.interval = interval;
    this.ws.updateInterval(interval);
  }
}
