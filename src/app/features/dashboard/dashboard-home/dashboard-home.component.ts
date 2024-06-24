import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { catchError, retry, throwError } from "rxjs";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";

// export enum GameStatus {
//   // playing = "PLAYING ",
//   // waiting_players = "WAITING_PLAYERS",
//   playing = "WAITING_PLAYERS",
//   waiting_players = "PLAYING ",
//   starting = "STARTING",
// }

export interface Game {
  gameID: String;
  status: String;
  gameMode: String;
  creator: String;
  numberOfPlayers: Number;
  team1: any;
  team2: any;
}

@Component({
  selector: "app-dashboard-home",
  templateUrl: "./dashboard-home.component.html",
  styleUrls: ["./dashboard-home.component.css"],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  currentUser: any;
  players!: string[];
  isOptionSelected: string = "classico";
  games!: Game[];
  playersNum = new FormControl("playersNum");
  score = new FormControl("score");
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
      this.formMode.value.mode === "eleven2zero" ? "ELEVEN2ZERO" : "CLASSIC";
    const numberOfPlayers = parseInt(
      this.formMode.value.numberOfPlayers as string
    );
    const expectedScore = parseInt(this.formMode.value.expectedScore as string);
    const username = this.localStorage.getItem("fullName");
    const GUIID = this.localStorage.getItem("UUID");
    console.log({ mode, numberOfPlayers, expectedScore, username, GUIID });

    this.dashboardService
      .createGame({ mode, numberOfPlayers, expectedScore, username, GUIID })
      .subscribe((res: any) => {
        this.notificationService.openSnackBar("Partita creatad con successo");
        this.router.navigate([`/waiting/${username}/${res.gameID}`]);
      });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.titleService.setTitle("angular-material-template - Dashboard");
    this.logger.log("Dashboard loaded");

    this.dashboardService.getGames().subscribe((res) => {
      this.games = res;
    });

    this.dashboardService.getPlayers().subscribe((res) => {
      this.players = res[0];
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
    // return this._hubService.GameCount;
    //return 15;
  }
}
