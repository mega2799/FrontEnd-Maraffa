import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GameService } from "src/app/core/services/game.service";
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

type CardSuit = "COINS" | "CUPS" | "SWORDS" | "CLUBS";
// type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
// type CardValue : Number = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
  // animations: [
  //   trigger("toggle", [
  //     state("open", style({ height: "200px" })),
  //     state("closed", style({ height: "*" })),
  //     transition("open <=> closed", animate("200ms ease-in-out")),
  //   ]),
  // ],
})
export class GameComponent implements OnInit, OnDestroy {
  username!: string;
  playCard($event: string) {
    //L'evento viene emesso dal componente 2 volte o piu', rimuovere la carta in modo robusto
    console.log(`ZIO ${$event}`);
    this.cards = this.cards.filter((card) => card.src !== $event);
  }
  @ViewChild("cardsPlayedPopover") //BHO
  private cardsPlayedPopover: any; //NgbPopover; //TODO cos'e' NgbPopover?
  private gamefinished = false;
  private _isAlive = true;

  position = { x: 0, y: 0 };
  private dragging = false;
  private startY = 0;
  hidden = false;

  cards: any[] = [];
  //  Array.from(Array(10).keys()).map((i) => ({
  //   suit: null,
  //   value: null,
  //   src: `https://cataas.com/cat?width=196&height=392&/${i}`,
  //   position: { x: 200, y: 0 },
  //   hidden: false,
  // }));

  // cards!: any[];
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
  gameID!: string;
  game: any; //Game;
  numberUnreadMessages: number = 0;
  cardsForExtraPoints: Card[] = [];
  selectingCardsForExtraPoints: boolean = false;

  cardsDrewPreviousRound: any; //CardAndUser[];

  constructor(
    private route: ActivatedRoute,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this._isAlive = false;
  }

  private getCardDescription(cardValue: number, cardSuit: CardSuit): string {
    const suitNames: { [key in CardSuit]: string } = {
      COINS: "denari",
      CUPS: "coppe",
      SWORDS: "spade",
      CLUBS: "bastoni",
    };

    const faceCardNames: { [key: number]: string } = {
      1: "asso",
      8: "fante",
      9: "cavallo",
      10: "re",
    };

    const suitName = suitNames[cardSuit];
    const valueName =
      cardValue + 1 >= 8 || cardValue + 1 === 1
        ? faceCardNames[cardValue + 1]
        : (cardValue + 1).toString();

    return `${valueName} di ${suitName}`;
  }
  ngOnInit() {
    // console.log(...this.cards);
    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    this.username = this.localStorage.getItem("fullName") as string;
    this.gameService
      .getUserCards(this.gameID, this.username)
      .subscribe((res: any) => {
        this.cards = this.cards.concat(
          ...res.cards.map((card: any) => ({
            suit: card.cardSuit,
            value: card.cardValue / 10, //TODO parse as a string
            src: `https://cataas.com/cat?width=196&height=392&/${card.cardValue}`,
            alt: this.getCardDescription(card.cardValue % 10, card.cardSuit),
            // src: `assets/cards/${card.value}.png`,
            position: { x: 200, y: 0 },
            hidden: false,
          }))
        );
      });
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

  startDrag(event: MouseEvent) {
    this.dragging = true;
    this.startY = event.clientY - this.position.y;
    event.preventDefault(); // Prevenire selezioni indesiderate
  }

  stopDrag() {
    if (this.dragging && this.position.y < 0) {
      this.hidden = true; // Nascondi l'immagine se trascinata verso l'alto
    }
    this.dragging = false;
  }

  onDrag(event: MouseEvent) {
    if (this.dragging) {
      this.position.y = event.clientY - this.startY;
    }
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(event: MouseEvent) {
    this.stopDrag();
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
    this.router.navigateByUrl("/");
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
