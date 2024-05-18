import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Card } from "src/app/model/card.model";
import { User } from "src/app/model/user.model";

interface Chiamata {
  value: string;
  viewValue: string;
}

interface Briscola {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild("cardsPlayedPopover") //BHO
  private cardsPlayedPopover: any; //NgbPopover; //TODO cos'e' NgbPopover?
  private gamefinished = false;
  private _isAlive = true;
  cards: any[] = new Array(10);
  calls: Chiamata[] = [
    { value: "busso", viewValue: "Busso" },
    { value: "volo", viewValue: "Volo" },
    { value: "striscio_lungo", viewValue: "Stricio Lungo" },
    { value: "striscio_corto", viewValue: "Stricio Corto" },
  ];
  trumps: Briscola[] = [
    { value: "coins", viewValue: "Denari" },
    { value: "cups", viewValue: "Coppe" },
    { value: "clubs", viewValue: "Bastoni" },
    { value: "swords", viewValue: "Spade" },
  ];

  isGameChatSidebarOpen = false;
  gameLocked = false;
  currentUser: User = new User(); //TODO check
  game: any; //Game;
  numberUnreadMessages: number = 0;
  cardsForExtraPoints: Card[] = [];
  selectingCardsForExtraPoints: boolean = false;

  cardsDrewPreviousRound: any; //CardAndUser[];

  constructor(private _router: Router) {}

  ngOnDestroy(): void {
    this._isAlive = false;
  }

  ngOnInit() {
    return;
    // this._hubService.ActiveGame.pipe(takeWhile(() => this._isAlive)).subscribe(game => {
    //   this.game = game;
    //   if (game == null) return;
    //   //if (this.gamefinished) return;
    //   if (this.game.cardsPlayed.length == game.players.length) {
    //     this.cardsDrewPreviousRound = game.cardsDrew;
    //     this.gameLocked = true;
    //     this.gamefinished = game.gameEnded;
    //     setTimeout(() => {
    //       this.game.cardsDrew = [];
    //       this.game.cardsPlayed = [];
    //       this.gameLocked = false;
    //       if (this.game.gameEnded) {
    //         let message = 'Partita terminata!\n';
    //         this.game.teams.forEach(element => {
    //           message += `Team ${element.name} punti: ${element.calculatedPoints}\n`;
    //         });
    //         alert(message);
    //       }
    //       else if (this.game.roundEnded) {
    //         //  this._hubService.EndRound();
    //         //  let message = 'Mano terminata! ';
    //         //  this.game.teams.forEach(element => {
    //         //      message += ` Team ${element.name} punti: ${element.points / 3} figure: ${element.points % 3}`;
    //         //  });
    //         //alert(message);
    //         if (this.currentUser.name == this.game.players[0].user.name)
    //               this._hubService.StartNewRound();
    //       }
    //     }, 1500);  //ALE tempo tra una mano e l'altra? (era 3500)
    //   }
    // });

    // this._hubService.CurrentUser.pipe(takeWhile(() => this._isAlive)).subscribe(user => {
    //   this.currentUser = user;
    // });

    // this._hubService.GameChatMessages.pipe(takeWhile(() => this._isAlive)).subscribe(messages => {
    //   if (messages.length > 0 && messages[0].username != this.currentUser.name && !this.isGameChatSidebarOpen) this.numberUnreadMessages++;
    // });
  }

  makeMove(card: Card) {
    if (this.gameLocked) return;
    if (this.selectingCardsForExtraPoints) {
      if (this.cardsForExtraPoints.includes(card)) {
        const index = this.cardsForExtraPoints.indexOf(card, 0);
        if (index > -1) {
          this.cardsForExtraPoints.splice(index, 1);
        }
      } else {
        if (this.cardsForExtraPoints.length == 4) return;
        this.cardsForExtraPoints.push(card);
      }
    } else {
      // this._hubService.MakeMove(card);
    }
  }

  exitGame() {
    this._router.navigateByUrl("/");
  }

  toggleGameChatSidebar() {
    this.isGameChatSidebarOpen = !this.isGameChatSidebarOpen;
    this.numberUnreadMessages = 0;
  }

  //ALE
  replayGame(playUntilPoints: number) {
    // this._hubService.ReplayGame(playUntilPoints);
    //this.gamefinished = false;
  }

  CallAction(action: string) {
    // this._hubService.CallAction(action);
  }

  //ALE
  CallBriscola(action: string) {
    // this._hubService.CallBriscola(action);
  }

  showCardsPlayedPreviousRound() {
    if (this.game.cardsPlayedPreviousRound.length == this.game.players.length) {
      this.cardsPlayedPopover.toggle();
    }
  }

  addExtraPoints() {
    if (this.selectingCardsForExtraPoints) {
      // this._hubService.AddExtraPoints(this.cardsForExtraPoints);
      this.cardsForExtraPoints = [];
    }
    this.selectingCardsForExtraPoints = !this.selectingCardsForExtraPoints;
  }

  getClassForCard(card: Card) {
    let classesArray = [];
    if (this.selectingCardsForExtraPoints) {
      if (this.cardsForExtraPoints.includes(card)) {
        classesArray.push("extraPointsCardSelected");
      } else {
        classesArray.push("extraPointsCardUnselected");
      }
    }
    return classesArray;
  }
}
