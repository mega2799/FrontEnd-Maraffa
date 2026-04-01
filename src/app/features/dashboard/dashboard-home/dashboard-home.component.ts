import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";
import { Game } from "src/app/model/game.model";

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

  private readonly gameListHandler: Function;
  private readonly gameRemovedHandler: Function;
  private readonly playersOnlineHandler: Function;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private logger: NGXLogger,
    private ws: WebSocketGameService,
    private dashboardService: DashBoardService
  ) {
    this.gameListHandler = this.updateGames.bind(this);
    this.gameRemovedHandler = this.handleGameRemoved.bind(this);
    this.playersOnlineHandler = this.updatePlayers.bind(this);
  }

  ngOnDestroy(): void {
    this.ws.unregisterHandler("gameList", this.gameListHandler);
    this.ws.unregisterHandler("gameRemoved", this.gameRemovedHandler);
    this.ws.unregisterHandler("playersOnline", this.playersOnlineHandler);
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

    this.ws.clientID = localStorage.getItem("UUID") as string;
    this.ws.userName = localStorage.getItem("fullName") as string;
    this.ws.initWebSocket();

    this.ws.registerHandler("gameList", this.gameListHandler);
    this.ws.registerHandler("gameRemoved", this.gameRemovedHandler);
    this.ws.registerHandler("playersOnline", this.playersOnlineHandler);

    this.dashboardService.getTotalGamesCount().subscribe((res : { total : number}) => {
      this.gamesCount = res.total;
    });

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
  }

  private updateGames(response: any): void {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.games = response.games;
  }

  private handleGameRemoved(response: any): void {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    window.location.reload();
  }

  private updatePlayers(response: any): void {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.players = response.users ?? [];
  }

  private sendAcknowledgment(messageId: string): void {
    const ackMessage = JSON.stringify({
      type: "ack",
      messageId: messageId,
    });
    this.ws.sendMessage(ackMessage);
  }

  getGameCount() {
    return this.gamesCount;
  }
}
