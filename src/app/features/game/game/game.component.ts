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
import { NotificationService } from "src/app/core/services/notification.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";
import { Card } from "src/app/model/card.model";
import { IconsComponent } from "../../icons/icons/icons.component";
import { MatDialog } from '@angular/material/dialog';

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

const suits: string[] = ["COINS", "CUPS", "CLUBS", "SWORDS"];

const mappingSuit: { [key: string]: string } = {"COINS": "Denari", "CUPS": "Coppe", "CLUBS": "Bastoni", "SWORDS": "Spade"};

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
  chosesTrump: boolean = false;
  isMyTurn: boolean = false;
  playCard($event: string) {
    const card = this.cards.find((card) => card.src === $event);
    // this.ws.webSocketSubject.next(JSON.stringify({ msg: "ZIO PERA" })); //TODO wow funziona davvero
    let isSuitFinished = false;
    if (this.tableCards.length > 0) {
      isSuitFinished =
        this.cards.filter((card) => card.suit === this.tableCards[0].suit) !=
        undefined;
    }
    this.gameService
      .playCard(
        this.gameID,
        this.username,
        cardNames[card.value],
        card.suit,
        isSuitFinished
      )
      .subscribe(
        (res) => {
          console.log(res);
          if (res.error != undefined) {
            setTimeout(() => {
              this.notificationService.openSnackBar(res.error);
            });
            window.location.reload();
            return;
          }
          this.cards = this.cards.filter((card) => card.src !== $event); //TODO sembra venga chiamato a caso piu' volte ma per ora degli errori non ci preoccupiamo
        },
        (error) => {
          this.notificationService.openSnackBar(error.error.error); //fa molto ridere si
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        }
      );
  }
  @ViewChild("cardsPlayedPopover") //BHO
  private cardsPlayedPopover: any; //NgbPopover; //TODO cos'e' NgbPopover?
  private gamefinished = false;
  private _isAlive = true;

  position = { x: 0, y: 0 };
  private dragging = false;
  private startY = 0;
  hidden = false;
  madeCall = false;

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
  teamScoreA: number = 69;
  teamScoreB: number = 69;
  teamA: string[] = [];
  teamB: string[] = [];
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
  currentTrump!: string;
  currentCall!: string;
  cardsAndUsers: string[] = [];
  public interval: number = 1;
  trump = new FormControl("trump");
  turn: number = -1;
  trumpChoosen: string = "";
  call = new FormControl("call");
  interactionForm!: FormGroup;
  tableCards: any[] = [];
  constructor(
    private route: ActivatedRoute,
    // @Inject("SESSIONSTORAGE") private localStorage: Storage,
    private notificationService: NotificationService,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    public gameService: GameService,
    private ws: WebSocketGameService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  // updateInterval(interval: number) {
  //   this.interval = interval;
  //   this.ws.updateInterval(interval);
  // }
  ngOnDestroy(): void {
    this._isAlive = false;
    // this.ws.onExit();
  }

  // private CardsMapping(number: number): string {
  //   const suit = ;
  //   const
  //   const value = [number % 10]
  //   return value + suit;

  // }

  getClass(index: number): string {
    if (this.turn === 0) return (index === 0) ? 'first-selected' : '';
    else if (this.turn === 1) return (index === 1) ? 'second-selected' : '';
    else if (this.turn === 2) return (index === 2) ? 'first-selected' : '';
    else if (this.turn === 3) return (index === 3) ? 'second-selected' : '';
    return '';
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
    //TODO call da implementare
    console.log(this.interactionForm.value);

    const { trump, call } = this.interactionForm.value;
    if (trump != "trump") {
      this.gameService
        .chooseSuit(this.gameID, this.username, trump)
        .subscribe((res) => {
          if (res.error != null) {
            //TODO check this

            console.log(res.error);
          } else {
            console.log(res);
            this.trumpChoosen = res.value;
            console.log("The trump is", res.value);
            // this.selectedTrump = true;
            this.selectedTrump = false;
          }
        });
    } else {
      this.gameService
        .makeCall(this.gameID, this.username, call)
        .subscribe((res) => {
          console.log(res);
          if (res.error != null) {
            console.log(res.error);
          } else {
            console.log(res);
            this.call = res.value;
            console.log("The call is", res.value);
            // this.selectedTrump = true;
          }
        });
    }
    // if()
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

    setTimeout(() => {}, 1500);
    this.gameService.getGame(this.gameID).subscribe((res: any) => {
      console.log("NAGATOMO ?");
      console.log("1 getGame res=", res);
      if (res.state === 0) {
        this.trumpManagment({
          username: res.trumpSelectorUsername,
          trumpSelected: res.trumpSelected,
        });
        this.selectedTrump = this.username === res.trumpSelectorUsername;
      }
      this.turnChanegeEvent({
        userTurn: res.playerTurn,
        trick: res?.trick,
        teamAScore: res.teamAScore,
        teamBScore: res.teamBScore,
      });
      this.isMyTurn = this.username === res.playerTurn;
      this.turn = res.turn;
      this.teamA = res.teamA;
      this.teamB = res.teamB;
      
      // this.teamScoreA = res.teamAScore;
      // this.teamScoreB = res.teamBScore;
    });
    
    this.gameService
      .getUserCards(this.gameID, this.username)
      .subscribe((res: any) => {
        this.cards = this.cards.concat(
          ...res.cards.map((card: any) => ({
            suit: card.cardSuit,
            value: card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue, //TODO parse as a string
            // src: `https://cataas.com/cat?width=196&height=392&/${card.cardValue}`,
            src: `assets/images/cards/${card.cardSuit}/${
              cardValues[
                card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue
              ]
            }.jpg`,
            alt: this.getCardDescription(card.cardValue % 10, card.cardSuit),
            // src: `assets/cards/${card.value}.png`,
            position: { x: 200, y: 0 },
            hidden: false,
          }))
        );
        if (this.cards.length === 0) {
          //FA cagare ma per l alpha e' perfetta
          this.gameService
            .getUserCards(this.gameID, this.username)
            .subscribe((res: any) => {
              this.cards = this.cards.concat(
                ...res.cards.map((card: any) => ({
                  suit: card.cardSuit,
                  value:
                    card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue, //TODO parse as a string
                  src: `assets/images/cards/${card.cardSuit}/${
                    cardValues[
                      card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue
                    ]
                  }.jpg`,
                  alt: this.getCardDescription(
                    card.cardValue % 10,
                    card.cardSuit
                  ),
                  // src: `assets/cards/${card.value}.png`,
                  position: { x: 200, y: 0 },
                  hidden: false,
                }))
              );
            });
        }
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
        console.log("WTF is this switch: ", response);
        switch (response.event) {
          case "userTurn":
            this.turnChanegeEvent(response);
            break;
          case "trumpEvent":
            this.trumpManagment(response);
            break;
          case "startGame":
            this.startGameManagment(response);
            break;
          case "call":
            this.makeCall(response);
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


  startGameManagment(response: any) {
    console.log("Calling startGameManagment");
    console.log(response);
    this.currentUser = response.firstPlayer;
    this.turn = response.firstPlayer;
  }

  trumpManagment(response: any) {
    console.log(response);
    console.log(response.username);
    console.log(this.username);
    console.log("trump selected" + response);
    //TODO dovrebbe funzionare tutto ma non nasconde dinamicamente.... perche ?
    this.selectedTrump = response.username === this.username;
    if (response.trumpSelected != "NONE") {
      this.currentTrump = mappingSuit[response.trumpSelected];
    }
    // if(response.settled) this.selectedTrump = true;
  }
  turnChanegeEvent(response: any) {
    console.log("response in turnChanegeEvent", response)
    this.currentUser = response.userTurn;
    this.isMyTurn = this.username === response.userTurn;
    this.teamScoreA = response.teamAScore;
    this.teamScoreB = response.teamBScore;
    if (response.trick != undefined) {
      this.tableCards = Object.entries(response.trick.cardsAndUsers).map(
        ([key, value]: any) => ({
          src: `assets/images/cards/${suits[Math.floor(key / 10)]}/${
            key % 10 <= 6 ? (key % 10) + 4 : (key % 10) - 6
          }.jpg`,
          suit: suits[Math.floor(key / 10)],
          user: value,
          
        })
      );
     this.cardsAndUsers = [];
     if (response != undefined){
       Object.entries(response.latestTrick.cardsAndUsers).forEach(([key, value]: any) => {
       this.cardsAndUsers.push(`assets/images/cards/${suits[Math.floor(key / 10)]}/${key % 10 <= 6 ? (key % 10) + 4 : (key % 10) - 6}.jpg`);
      });
     }
    }
  }

  makeCall(response: any){
    this.madeCall = true;
    this.currentCall = response.call;
    setTimeout(() => {
      this.madeCall = false;
    }, 12000);
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

  showCardsPlayedPreviousRound(): void {
    this.dialog.open(IconsComponent, {
      width: '400px',
      data: this.cardsAndUsers
    });
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
