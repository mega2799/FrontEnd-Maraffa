import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Component, Inject, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { catchError, retry, throwError } from "rxjs";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { GameService } from "src/app/core/services/game.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";

const gameModeValue: any = {
  ELEVEN2ZERO: "11 a 0",
  CLASSIC: "Classico",
};

const statusValue: any = {
  PLAYING: "In corso",
  WAITING_PLAYERS: "In attesa di giocatori",
  STARTING: "In partenza",
};

//TODO se lo status della partita' e' PLAYING serve un redirect alla pagina di gioco
@Component({
  selector: "app-waiting-room-component",
  templateUrl: "./waiting-room-component.component.html",
  styleUrls: ["./waiting-room-component.component.css"],
})
export class WaitingRoomComponentComponent implements OnInit {
  private _isAlive = true;
  gameID!: string;
  activeGame!: any; //Game; //TODO modificato
  password!: string; //TODO modificato
  currentUser!: string; //User; //TODO modificato
  creator!: string;
  public interval: number = 1;
  mode!: string;
  isReady: boolean = false;
  // constructor(/*private _hubService: HubService, private _router: Router*/) { }
  constructor(
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    private dashboardService: DashBoardService,
    private route: ActivatedRoute,
    private router: Router,
    // @Inject("SESSIONSTORAGE") private localStorage: Storage,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private ws: WebSocketGameService,
    public gameService: GameService,
    private logger: NGXLogger
  ) {}

  score!: number;
  status!: string;
  teamA: string[] = [];

  teamB: string[] = [];

  drop(event: CdkDragDrop<string[]>) {
    console.log("WTF is going on? ");
    console.log(event);
    const oldContainer = event.previousContainer.id;
    const newContainer = event.container.id;
    const newIndex = event.currentIndex;
    const username = this.currentUser;
    console.log({ oldContainer, newContainer, newIndex, username });
    console.log(
      "Who am i dragging? ",
      event.previousContainer.data[event.previousIndex]
    );
    if (
      event.previousContainer.data[event.previousIndex] !== this.currentUser
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
      .subscribe((res: any) => {
        console.log("Change team response: ", res);
      });
  }

  ngOnDestroy(): void {
    this._isAlive = false;
    // this.currentUser = this.authService.getCurrentUser();
    this.titleService.setTitle("angular-material-template - Waiting Room");
    this.logger.log("Joined waiting room");

    setTimeout(() => {
      this.notificationService.openSnackBar("Welcome!");
    });
  }

  ngOnInit() {
    // this._hubService.ActiveGame.pipe(takeWhile(() => this._isAlive)).subscribe(room => {
    //   this.activeGamloge = room;
    // });

    // this._hubService.CurrentUser.pipe(takeWhile(() => this._isAlive)).subscribe(user => {
    //   this.currentUser = user;
    // });
    this.creator = this.route.snapshot.paramMap.get("creator") as string;
    this.currentUser = this.localStorage.getItem("fullName") as string;
    console.log("Current user: ", this.currentUser);
    console.log("Creator: ", this.creator);

    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    this.gameService.getGames().subscribe((res: any[]) => {
      const currentGame = res.find((game: any) => game.gameID == this.gameID);
      this.status = statusValue[currentGame.status];
      this.mode = gameModeValue[currentGame.mode];
      this.score = currentGame.score;
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
          case "userJoin":
            this.joinUser(response);
            break;
          case "changeTeam":
            this.turnChanegeEvent(response);
            break;
          case "startGame":
            this.redirectToGame(response); //TODO
            break;
          default:
            break;
        }
      });

    this.dashboardService.getGames().subscribe((res: any[]) => {
      //TODO non c'e' nel middleware
      const actualGame: any = res.find(
        (game: any) => game.gameID == this.gameID
      );
      if (!actualGame) throw new Error("Game not found");
      this.status = statusValue[actualGame.status];
      this.teamA = actualGame.teamA;
      // this.teamA.push(actualGame.creator); //TODO per ora lo hardocoddo io
      this.teamB = actualGame.teamB;
      this.score = 0; //TODO esporre nella chiamata
    });

    console.log("teamA: ", this.teamA);
    console.log("teamB: ", this.teamB);
  }
  redirectToGame(response: any) {
    this.router.navigate(["/game/" + response.gameID]);
  }
  turnChanegeEvent(response: any) {
    this.teamA = response.teamA;
    // this.teamA.push(actualGame.creator); //TODO per ora lo hardocoddo io
    this.teamB = response.teamB;
  }

  joinUser(response: any) {
    this.status = statusValue[response.status];
    this.teamA = response.teamA;
    this.teamB = response.teamB;
    window.location.reload();
    setTimeout(() => {
      this.notificationService.openSnackBar(
        `${response.user} si è unito alla partita`
      );
    });
  }

  leaveWaitingRoom() {
    // this._hubService.ExitGame();
    // this._router.navigate(['/']);
  }

  joinGame() {
    this.dashboardService
      .joinGame({
        gameID: this.gameID,
        username: this.localStorage.getItem("fullName"),
        GUIID: this.localStorage.getItem("UUID"),
      })
      .subscribe((res: any) => {
        setTimeout(() => {
          this.notificationService.openSnackBar(
            "Ti sei unito correttamente alla partita"
          );
        });
      });
    // this._hubService.JoinGame(this.activeGame.gameSetup.id, '');
  }

  //TODO spettatori
  // userIsSpectator() {
  //   var exists = this.activeGame.spectators.find((spectator: any) => {
  //     return spectator.name == this.currentUser.name;
  //   });
  //   return exists != null;
  // }

  startGame() {
    // console.log("Start game: ", this.isReady);
    this.gameService.startGame(this.gameID).subscribe((res: any) => {
      if (Object.keys(res).includes("error")) {
        setTimeout(() => {
          this.notificationService.openSnackBar(res.error);
        });
      } else {
        this.router.navigate(["/game/" + this.gameID]);
      }
    });
  }

  private showNotification() {
    const message = !this.isReady
      ? "La partita non può iniziare finché non tutti i giocatori non sono pronti"
      : "La partita non può iniziare finché i team non sono pronti";
    this.notificationService.openSnackBar(message);
  }

  setRoomPassword() {
    if (!this.password) return;
    // this._hubService.SetGamePassword(this.activeGame.gameSetup.id, this.password);
  }

  kickPlayerFromGame(player: any) {
    //Player) {
    let cfrm = confirm(
      "Vuoi davvero eliminare questo giocatore? " + player.user.name
    );
    // if (cfrm) this._hubService.KickUSerFromGame(player.user);
  }
}

// import {
//   CdkDrag,
//   CdkDragDrop,
//   CdkDropList,
//   CdkDropListGroup,
//   moveItemInArray,
//   transferArrayItem,
// } from '@angular/cdk/drag-drop';

// /**
//  * @title Drag&Drop disabled sorting
//  */
// @Component({
//   selector: 'cdk-drag-drop-disabled-sorting-example',
//   templateUrl: 'waiting-room-component.component.html',
//   styleUrls: ['waiting-room-component.component.css'],
//   standalone: true,
//   imports: [CdkDropListGroup, CdkDropList, CdkDrag],
// })
// export class CdkDragDropDisabledSortingExample {
//   items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];

//   basket = ['Oranges', 'Bananas', 'Cucumbers'];

//   drop(event: CdkDragDrop<string[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex,
//       );
//     }
//   }
// }
