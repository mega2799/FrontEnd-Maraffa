import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, retry, throwError } from "rxjs";
import { GameService } from "src/app/core/services/game.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";
import { Card } from "src/app/model/card.model";

interface Chiamata {
  value: string;
  viewValue: string;
}

interface Briscola {
  value: string;
  viewValue: string;
}

type CardSuit = "COINS" | "CUPS" | "SWORDS" | "CLUBS";

// ONE(7), TWO(8), THREE(9), FOUR(0), FIVE(1), SIX(2), SEVEN(3), KNAVE(4), HORSE(5), KING(6), NONE(999);
//TODO riordinare ovunque
const cardNames: string[] = [
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "KNAVE",
  "HORSE",
  "KING",
  "ONE",
  "TWO",
  "THREE",
];

const cardValues: number[] = [4, 5, 6, 7, 8, 9, 10, 1, 2, 3];

// const cardValues: number[] = [3, 4, 5, 6, 7, 8, 9, 0, 1, 2];
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
  isMyTurn: boolean = false;
  playCard($event: string) {
    //L'evento viene emesso dal componente 2 volte o piu', rimuovere la carta in modo robusto
    console.log(`ZIO ${$event}`);
    const card = this.cards.find((card) => card.src === $event);
    if (!card) {
      console.log("Card not found");
      throw new Error("Card not found");
    }
    // console.log(card);

    // console.log({
    //   gameID: this.gameID,
    //   username: this.username,
    //   cardValue: cardNames[card.value],
    //   cardSuit: card.suit,
    //   isSuitFinished: false,
    // });
    // this.cards = this.cards.filter((card) => card.src !== $event);
    this.ws.webSocketSubject.next(JSON.stringify({ msg: "ZIO PERA" })); //TODO wow funziona davvero

    this.gameService
      .playCard(
        this.gameID,
        this.username,
        cardNames[card.value],
        card.suit,
        false
      )
      .subscribe((res) => {
        this.cards = this.cards.filter((card) => card.src !== $event); //TODO sembra venga chiamato a caso piu' volte ma per ora degli errori non ci preoccupiamo
      });
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
    { value: "COINS", viewValue: "Denari" },
    { value: "CUPS", viewValue: "Coppe" },
    { value: "CLUBS", viewValue: "Bastoni" },
    { value: "SWORDS", viewValue: "Spade" },
  ];

  isGameChatSidebarOpen = false;
  gameLocked = false;
  // currentUser: User = new User(); //TODO check
  gameID!: string;
  game: any; //Game;
  numberUnreadMessages: number = 0;
  cardsForExtraPoints: Card[] = [];
  selectingCardsForExtraPoints: boolean = false;
  selectedTrump: Boolean = false;
  cardsDrewPreviousRound: any; //CardAndUser[];
  currentUser!: string;
  public interval: number = 1;
  trump = new FormControl("trump");
  call = new FormControl("call");
  interactionForm!: FormGroup;
  constructor(
    private route: ActivatedRoute,
    // @Inject("SESSIONSTORAGE") private localStorage: Storage,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    public gameService: GameService,
    private ws: WebSocketGameService,
    private router: Router
  ) {}

  // updateInterval(interval: number) {
  //   this.interval = interval;
  //   this.ws.updateInterval(interval);
  // }
  ngOnDestroy(): void {
    this._isAlive = false;
    // this.ws.onExit();
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
    const valueName = // cardValues[cardValue].toString();
      Object.keys(faceCardNames).includes(String(cardValues[cardValue]))
        ? faceCardNames[cardValues[cardValue]]
        : cardValues[cardValue].toString();

    return `${valueName} di ${suitName}`;
  }

  onSubmit() {
    //TODO questo verra chiamato sia quando si fa una chiamata che quando si chiama la briscola
    console.log(this.interactionForm.value);
  }

  ngOnInit() {
    this.interactionForm = new FormGroup({
      trump: this.trump,
      call: this.call,
    });
    // console.log(...this.cards);
    // this.currentUser
    //TODO onStart assegna il currentPlayer al primo che deve giocare !
    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    this.username = this.localStorage.getItem("fullName") as string;
    this.gameService
      .getUserCards(this.gameID, this.username)
      .subscribe((res: any) => {
        this.cards = this.cards.concat(
          ...res.cards.map((card: any) => ({
            suit: card.cardSuit,
            value: card.cardValue > 10 ? card.cardValue % 10 : card.cardValue, //TODO parse as a string
            // src: `https://cataas.com/cat?width=196&height=392&/${card.cardValue}`,
            src: `assets/images/cards/${card.cardSuit}/${
              cardValues[
                card.cardValue > 10 ? card.cardValue % 10 : card.cardValue
              ]
            }.jpg`,
            alt: this.getCardDescription(card.cardValue % 10, card.cardSuit),
            // src: `assets/cards/${card.value}.png`,
            position: { x: 200, y: 0 },
            hidden: false,
          }))
        );
        console.log(this.cards);
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
          case "userTurn":
            this.turnChanegeEvent(response);
            break;
          default:
            break;
        }
      });
    // this.ws.clientID= this.localStorage.getItem("UUID") as string;
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
    //     switch (response.event) {
    //       case "userTurn":
    //         this.turnChanegeEvent(response);
    //         break;
    //       default:
    //         break;
    //     }
    //   });
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
  turnChanegeEvent(response: any) {
    this.currentUser = response.userTurn;
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
    console.log("CallBriscola with: " + action);
    this.selectedTrump = !this.selectedTrump;
    // this.gameService.chooseSuit(this.gameID, this.username, action).subscribe();
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
