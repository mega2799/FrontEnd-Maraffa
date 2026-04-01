import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Component, Inject, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { GameService } from "src/app/core/services/game.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";
import { Game } from "src/app/model/game.model";
import { Team, UserTeam } from "src/app/model/team.model";

const gameModeValue: any = {
  ELEVEN2ZERO: "11 a 0",
  CLASSIC: "Classico",
};

const statusValue: any = {
  PLAYING: "In corso",
  WAITING_PLAYERS: "In attesa di giocatori",
  STARTING: "In partenza",
};

@Component({
  selector: "app-waiting-room-component",
  templateUrl: "./waiting-room-component.component.html",
  styleUrls: ["./waiting-room-component.component.css"],
})
export class WaitingRoomComponentComponent implements OnInit, OnDestroy {
  gameID!: string;
  activeGame!: Game;
  password!: string;
  currentUser!: string;
  creator!: string;
  pwdSaved: boolean = false;
  passwordPresent: boolean = false;
  mode!: string;
  isReady: boolean = false;

  private readonly userJoinHandler: Function;
  private readonly gameStartedHandler: Function;
  private readonly gameRemovedHandler: Function;
  private readonly changeTeamHandler: Function;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    private dashboardService: DashBoardService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private ws: WebSocketGameService,
    public gameService: GameService,
    private logger: NGXLogger,
    private ngZone: NgZone
  ) {
    this.userJoinHandler = this.handleUserJoin.bind(this);
    this.gameStartedHandler = this.handleGameStarted.bind(this);
    this.gameRemovedHandler = this.handleUserRemoved.bind(this);
    this.changeTeamHandler = this.turnChanegeEvent.bind(this);
  }

  score!: number;
  status!: string;
  teamA!: Team;
  teamB!: Team;

  setRoomPassword(password: string) {
    this.password = password;
    this.gameService.setPassword(this.gameID, password).subscribe();
    this.pwdSaved = true;
    setTimeout(() => {
      this.pwdSaved = false;
    }, 3000);
  }

  drop(event: CdkDragDrop<UserTeam[]>) {
    const oldContainer = event.previousContainer.id;
    const newContainer = event.container.id;
    const newIndex = event.currentIndex;
    const username = this.currentUser;
    if (
      event.previousContainer.data[event.previousIndex].username !== this.currentUser
    ) {
      setTimeout(() => {
        this.notificationService.openSnackBar(
          "Non puoi spostare un altro giocatore"
        );
      });
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.gameService
      .changeTeam(this.gameID, newContainer, username, newIndex)
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ws.unregisterHandler("userJoin", this.userJoinHandler);
    this.ws.unregisterHandler("startGame", this.gameStartedHandler);
    this.ws.unregisterHandler("userRemoved", this.gameRemovedHandler);
    this.ws.unregisterHandler("changeTeam", this.changeTeamHandler);
  }

  ngOnInit() {
    this.creator = this.route.snapshot.paramMap.get("creator") as string;
    this.currentUser = this.localStorage.getItem("fullName") as string;

    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    this.ws.clientID = localStorage.getItem("UUID") as string;
    this.ws.userName = localStorage.getItem("fullName") as string;
    this.ws.initWebSocket();

    this.ws.registerHandler("userJoin", this.userJoinHandler);
    this.ws.registerHandler("startGame", this.gameStartedHandler);
    this.ws.registerHandler("userRemoved", this.gameRemovedHandler);
    this.ws.registerHandler("changeTeam", this.changeTeamHandler);

    this.gameService.getGame(this.gameID).subscribe((res: Game) => {
      const currentGame: Game = res;
      this.activeGame = currentGame;
      this.teamA = currentGame.teamA;
      this.teamB = currentGame.teamB;
      this.status = statusValue[currentGame.status];
      this.mode = gameModeValue[currentGame.mode];
      this.score = currentGame.score;
      this.passwordPresent = currentGame.password;
    });
  }

  private handleUserJoin(response: any): void {
    console.log('[WaitingRoom] handleUserJoin received:', JSON.stringify(response));
    if (response.gameID && response.gameID !== this.gameID) {
      return;
    }
    this.ngZone.run(() => {
      if (response.messageId) {
        this.sendAcknowledgment(response.messageId);
      }
      if (response.teamA) {
        this.teamA = response.teamA;
      }
      if (response.teamB) {
        this.teamB = response.teamB;
      }
      this.notificationService.openSnackBar(
        `${response.username} si è unito alla partita`
      );
    });
  }

  private handleGameStarted(response: any): void {
    this.ngZone.run(() => {
      if (response.messageId) {
        this.sendAcknowledgment(response.messageId);
      }
      this.router.navigate([`/game/${response.gameID}`]);
    });
  }

  private handleUserRemoved(response: any): void {
    this.ngZone.run(() => {
      if (response.messageId) {
        this.sendAcknowledgment(response.messageId);
      }
      window.location.reload();
    });
  }

  private sendAcknowledgment(messageId: string): void {
    const ackMessage = JSON.stringify({
      type: "ack",
      messageId: messageId,
    });
    this.ws.sendMessage(ackMessage);
  }

  redirectToGame(response: any) {
    this.router.navigate(["/game/" + response.gameID]);
  }

  turnChanegeEvent(response: any) {
    this.ngZone.run(() => {
      if (response.messageId) {
        this.sendAcknowledgment(response.messageId);
      }
      this.teamA = response.teamA;
      this.teamB = response.teamB;
    });
  }

  leaveWaitingRoom() {
    if (this.creator === this.currentUser){
      this.gameService.exitGame(this.gameID).subscribe();
    } else {
      this.dashboardService
        .removeUser({
          gameID: this.gameID,
          username: this.currentUser
      }).subscribe();
    }
  }

  joinGame() {
    let pwd;
    if (this.passwordPresent){
      pwd = prompt("Inserire la password:");
    } else {
      pwd = "";
    }

    const actualUser = JSON.parse(
      this.localStorage.getItem("currentUser") as string
    );
    this.dashboardService
      .joinGame({
        gameID: this.gameID,
        username: this.localStorage.getItem("fullName"),
        GUIID: this.localStorage.getItem("UUID"),
        guest: actualUser.isGuest,
        password: pwd as string,
      })
      .subscribe(
        (res: any) => {
          if (res.error) {
            this.notificationService.openSnackBar(res.error);
            return;
          }
          this.notificationService.openSnackBar("Ti sei unito correttamente alla partita");
          this.gameService.getGame(this.gameID).subscribe((game: Game) => {
            this.teamA = game.teamA;
            this.teamB = game.teamB;
          });
        },
        (error: any) => {
          this.notificationService.openSnackBar(
            error?.error?.error || error?.error?.message || "Errore durante l'accesso alla partita"
          );
        }
      );
  }

  startGame() {
    if (this.activeGame.status != "PLAYING") {
      this.gameService.startGame(this.gameID).subscribe((res: any) => {
        if (Object.keys(res).includes("error")) {
          setTimeout(() => {
            this.notificationService.openSnackBar(res.error);
          });
        }
        // Non navigare qui: le carte vengono distribuite in modo asincrono dal backend.
        // La navigazione avviene per tutti (incluso il creator) tramite l'evento WebSocket
        // "startGame", che viene emesso solo DOPO che handOutCards() è completato.
      });
    } else {
      if (
        this.activeGame.teamA.players.map((el : any) => el.username).includes(this.currentUser) ||
        this.activeGame.teamB.players.map((el : any) => el.username).includes(this.currentUser)
      ) {
        this.router.navigate(["/game/" + this.gameID]);
      }
    }
  }

  private showNotification() {
    const message = !this.isReady
      ? "La partita non può iniziare finché non tutti i giocatori non sono pronti"
      : "La partita non può iniziare finché i team non sono pronti";
    this.notificationService.openSnackBar(message);
  }
}
