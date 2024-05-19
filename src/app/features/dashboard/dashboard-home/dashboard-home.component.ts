import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { NotificationService } from "src/app/core/services/notification.service";

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
  isOptionSelected: boolean = false;
  games!: Game[];
  interval: any;
  playersNum = new FormControl("playersNum");
  score = new FormControl("score");
  formMode = new FormGroup({
    mode: new FormControl("mode"),
    numberOfPlayers: this.playersNum,
    expectedScore: this.score,
  });

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private logger: NGXLogger,
    private dashboardService: DashBoardService
  ) {}

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  sendCreate() {
    const mode =
      this.formMode.value.mode === "classico" ? "CLASSIC" : "ELEVEN2ZERO";
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
        this.notificationService.openSnackBar("Game created successfully");
        this.router.navigate([`/waiting/${res.gameID}`]);
      });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.titleService.setTitle("angular-material-template - Dashboard");
    this.logger.log("Dashboard loaded");

    this.interval = setInterval(() => {
      this.dashboardService.getGames().subscribe((res) => {
        this.games = res;
      });

      //TODO la get activePlayers andra' qui dentro ehehehehe
    }, 1000);

    setTimeout(() => {
      this.notificationService.openSnackBar("Ciao!");
    });
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
