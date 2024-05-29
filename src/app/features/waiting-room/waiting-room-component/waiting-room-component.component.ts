import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Component, Inject, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NGXLogger } from "ngx-logger";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { DashBoardService } from "src/app/core/services/dashboard.service";
import { NotificationService } from "src/app/core/services/notification.service";

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
  currentUser!: any; //User; //TODO modificato

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
    private logger: NGXLogger
  ) {}

  score!: number;
  status!: string;
  teamA: string[] = [""];

  teamB: string[] = [""];

  drop(event: CdkDragDrop<string[]>) {
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
  }

  ngOnDestroy(): void {
    this._isAlive = false;
    this.currentUser = this.authService.getCurrentUser();
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
    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    this.dashboardService.getGames().subscribe((res: any[]) => {
      //TODO non c'e' nel middleware
      const actualGame: any = res.find(
        (game: any) => game.gameID == this.gameID
      );
      if (!actualGame) throw new Error("Game not found");
      this.status = actualGame.status;
      this.teamA = actualGame.team1;
      this.teamA.push(actualGame.creator); //TODO per ora lo hardocoddo io
      this.teamB = actualGame.team2;
      this.score = 0; //TODO esporre nella chiamata
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
        this.notificationService.openSnackBar(
          "Ti sei unito correttamente alla partita"
        );
      });
    // this._hubService.JoinGame(this.activeGame.gameSetup.id, '');
  }

  userIsSpectator() {
    var exists = this.activeGame.spectators.find((spectator: any) => {
      return spectator.name == this.currentUser.name;
    });
    return exists != null;
  }

  startGame() {
    this.router.navigate(["/game/" + this.gameID]);
    // this._hubService.StartGame();
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
