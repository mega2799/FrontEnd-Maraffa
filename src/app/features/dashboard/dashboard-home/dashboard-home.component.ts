import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { catchError, retry, throwError } from "rxjs";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { SocketIoService } from "src/app/core/services/socket.io";
import { WebSocketGameService } from "src/app/core/services/websocket.game";
import { Game } from "src/app/model/game.model";

// export enum GameStatus {
//   // playing = "PLAYING ",
//   // waiting_players = "WAITING_PLAYERS",
//   playing = "WAITING_PLAYERS",
//   waiting_players = "PLAYING ",
//   starting = "STARTING",
// }


@Component({
  selector: "app-dashboard-home",
  templateUrl: "./dashboard-home.component.html",
  styleUrls: ["./dashboard-home.component.css"],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  currentUser: any;
  activePlayers!: string[];
  players!: string[];
  isOptionSelected: string = "classico";
  games!: Game[];
  playersNum = new FormControl("playersNum");
  score = new FormControl("score");
  gamesCount = 0;
  formMode = new FormGroup({
    mode: new FormControl("mode"),
    numberOfPlayers: this.playersNum,
    expectedScore: this.score,
  });
  public interval: number = 1;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    private socket : SocketIoService,
    // @Inject("SESSIONSTORAGE") private localStorage: Storage,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private logger: NGXLogger,
    private ws: WebSocketGameService,
    private dashboardService: DashBoardService
  ) {}

  ngOnDestroy(): void {
    return;
  }

  sendCreate() {
    const mode =
      this.formMode.value.mode === "eleven2Zero" ? "ELEVEN2ZERO" : "CLASSIC";
    const numberOfPlayers = parseInt(
      this.formMode.value.numberOfPlayers as string
    );
    const expectedScore = parseInt(this.formMode.value.expectedScore as string);
    const username = this.localStorage.getItem("fullName");
    const GUIID = this.localStorage.getItem("UUID");
    const currentUser = JSON.parse(
      this.localStorage.getItem("currentUser") as string
    );
    console.log({
      mode,
      numberOfPlayers,
      expectedScore,
      username,
      GUIID,
      currentUser,
    });

    this.dashboardService
      .createGame({
        mode,
        numberOfPlayers,
        expectedScore,
        username,
        GUIID,
        guest: currentUser.isGuest,
      })
      .subscribe((res: any) => {
        this.notificationService.openSnackBar("Partita creata con successo");
        this.router.navigate([`/waiting/${username}/${res.gameID}`]);
      });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.titleService.setTitle("angular-material-template - Dashboard");
    this.logger.log("Dashboard loaded");
    
    // this.websocketService.clientID = localStorage.getItem("UUID") as string;
    // this.websocketService.userName = this.localStorage.getItem("fullName") as string;
    // this.websocketService.init();
    // this.ws.clientID = localStorage.getItem("UUID") as string;
    // this.ws.userName = this.localStorage.getItem("fullName") as string;
    // this.ws.initWebSocket();
    //   this.dashboardService.getTotalGamesCount().subscribe((res : { total : number}) => {
    //     this.gamesCount = res.total;
    //   })
    this.socket.sendMessage();
    this.dashboardService.getGames().subscribe((res) => {
      this.games = res;
    });

    this.dashboardService.getPlayers().subscribe((res) => {
      this.players = res.connected;
      this.activePlayers = res.inGamePlayers;
    });

    setTimeout(() => {
      this.notificationService.openSnackBar("Ciao!");
    });

    this.ws.webSocket$
      .pipe(
        catchError((error) => {
          this.interval = 1;
          return throwError(() => new Error(error));
        }),
        retry({ delay: 5_000 })
        // takeUntilDestroyed()
      )
      .subscribe((value: any) => {
        // response event
        // console.log("WTF is this: ", value);
        const response = JSON.parse(value);
        console.log("WTF is this: ", response);
        switch (response.event) {
          case "gameList":
            this.updateGames(response);
            break;
          case "gameRemoved":
            window.location.reload();
            break;
          default:
            break;
        }
      });
  }
  updateGames(res: any) {
    this.games = res.games;
  }

  createGame(playUntilPoints: number, expectedNumberOfPlayers: number) {
    // this._hubService.CreateGame(playUntilPoints, expectedNumberOfPlayers);
  }

  rename() {
    let name = prompt("Input your name");
    if (!name) return;
    localStorage.setItem("name", name);
    window.location.reload();
  }

  getGameCount() {
    return this.gamesCount;
    // return this._hubService.GameCount;
    //return 15;
  }


}
