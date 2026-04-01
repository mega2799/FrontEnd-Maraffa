import { MediaMatcher } from "@angular/cdk/layout";
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { GameService } from "src/app/core/services/game.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";
import { Card } from "src/app/model/card.model";
import { DialogComponent } from "../../dialog/dialog/dialog.component";
import { UltimaPresaComponent } from "../../ultima-presa/ultima-presa/ultima-presa.component";
import { ExitDialogComponent } from "../dialogs/exit/exit-dialaog.component";

interface Chiamata {
  value: string;
  viewValue: string;
}

interface Briscola {
  value: string;
  viewValue: string;
}

type CardSuit = "COINS" | "CUPS" | "SWORDS" | "CLUBS";

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

const mappingSuit: { [key: string]: string } = {
  COINS: "Denari",
  CUPS: "Coppe",
  CLUBS: "Bastoni",
  SWORDS: "Spade",
};

const cardValues: number[] = [4, 5, 6, 7, 8, 9, 10, 1, 2, 3];

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit, OnDestroy {
  private _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  mappingSuitEmoji: { [key: string]: string } = {
    Denari: '🟡',
    Coppe: '🏆',
    Bastoni: '🪵',
    Spade: '⚔️',
  };
  username!: string;
  chosesTrump: boolean = false;
  isMyTurn: boolean = false;
  playCard($event: string) {
    const card = this.cards.find((card) => card.src === $event);
    let isSuitFinished = false;
    if (this.tableCards.length > 0) {
      isSuitFinished = this.cards.find((card) => card.suit === this.tableCards[0].suit) === undefined;
    }

    const isTaglio =
      this.tableCards[0] != undefined &&
      mappingSuit[card.suit] === this.trumpChoosen &&
      mappingSuit[this.tableCards[0].suit] !== this.trumpChoosen;

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
          if (res.error != undefined) {
            this.notificationService.openSnackBar(res.error);
            card.hidden = false;
            card.position = { x: 0, y: 0 };
            return;
          }
          this.cards = this.cards.filter((c) => c.src !== $event);
          if (isTaglio) {
            this.gameService.notify(this.gameID, "TAGLIO").subscribe();
          }
        },
        (error) => {
          this.notificationService.openSnackBar(
            error?.error?.error || "Errore nel giocare la carta"
          );
          card.hidden = false;
          card.position = { x: 0, y: 0 };
        }
      );
  }

  position = { x: 0, y: 0 };
  private dragging = false;
  private startY = 0;
  hidden = false;
  madeCall = false;
  gameState : number = 0;
  cards: any[] = [];

  callJson: any = {
    BUSSO: "Busso",
    VOLO : "Volo" ,
    STRISCIO_LUNGO : "Striscio Lungo",
    STRISCIO_CORTO : "Striscio Corto" ,
  };

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
  gameID!: string;
  game: any;
  numberUnreadMessages: number = 0;
  cardsForExtraPoints: Card[] = [];
  selectingCardsForExtraPoints: boolean = false;
  selectedTrump: Boolean = false;
  cardsDrewPreviousRound: any;
  currentUser!: string;
  currentTrump!: string;
  currentCall!: string;
  cardsAndUsers: string[] = [];
  trump = new FormControl("trump");
  turn: number = -1;
  gameMode: string = 'CLASSIC';
  trumpChoosen: string = "";
  isNotifyPresent: boolean = false;
  notifyMessage: string = "";
  call = new FormControl("call");
  interactionForm!: FormGroup;
  tableCards: any[] = [];
  private exitTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly turnChangeHandler: Function;
  private readonly trumpHandler: Function;
  private readonly startHandler: Function;
  private readonly callHandler: Function;
  private readonly endRoundHandler: Function;
  private readonly endGameHandler: Function;
  private readonly notificationHandler: Function;
  private readonly newGameHandler: Function;
  private readonly exitGameHandler: Function;

  constructor(
    private route: ActivatedRoute,
    private media: MediaMatcher,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    public gameService: GameService,
    private ws: WebSocketGameService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.mobileQuery = this.media.matchMedia("(max-width: 1000px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);

   this.turnChangeHandler = this.turnChanegeEvent.bind(this);
   this.trumpHandler = this.trumpManagment.bind(this);
   this.startHandler = this.startGameManagment.bind(this);
   this.callHandler = this.makeCall.bind(this);
   this.endRoundHandler = this.endRound.bind(this);
   this.endGameHandler = this.endGame.bind(this);
   this.notificationHandler = this.notify.bind(this);
   this.newGameHandler = this.newGame.bind(this);
   this.exitGameHandler = this.exitGameManagment.bind(this);
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    if (this.exitTimeout) {
      clearTimeout(this.exitTimeout);
    }
    this.ws.unregisterHandler("userTurn", this.turnChangeHandler);
    this.ws.unregisterHandler("trumpEvent", this.trumpHandler);
    this.ws.unregisterHandler("startGame", this.startHandler);
    this.ws.unregisterHandler("call", this.callHandler);
    this.ws.unregisterHandler("endRound", this.endRoundHandler);
    this.ws.unregisterHandler("endGame", this.endGameHandler);
    this.ws.unregisterHandler("notification", this.notificationHandler);
    this.ws.unregisterHandler("newGame", this.newGameHandler);
    this.ws.unregisterHandler("exitGame", this.exitGameHandler);
  }

  getClass(index: number): string {
    if (this.turn === 0) return index === 0 ? "first-selected" : "";
    else if (this.turn === 1) return index === 1 ? "second-selected" : "";
    else if (this.turn === 2) return index === 2 ? "first-selected" : "";
    else if (this.turn === 3) return index === 3 ? "second-selected" : "";
    return "";
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
      Object.keys(faceCardNames).includes(String(cardValues[cardValue]))
        ? faceCardNames[cardValues[cardValue]]
        : cardValues[cardValue].toString();

    return `${valueName} di ${suitName}`;
  }

  onSubmit() {
    const { trump, call } = this.interactionForm.value;
    if (!this.trumpChoosen) {
      this.gameService
        .chooseSuit(this.gameID, this.username, trump)
        .subscribe((res) => {
          if (res.error != null) {
            // error
          } else {
            this.trumpChoosen = mappingSuit[res.value];
            this.currentTrump = res.value;
            this.selectedTrump = false;
          }
        });
    } else {
      this.gameService
        .makeCall(this.gameID, this.username, call)
        .subscribe((res) => {
          if (res.error != null) {
            // error
          } else {
            this.call = res.value;
          }
        });
    }
  }

  async ngOnInit() {
    this.interactionForm = new FormGroup({
      trump: this.trump,
      call: this.call,
    });
    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    this.username = this.localStorage.getItem("fullName") as string;

    this.ws.clientID = localStorage.getItem("UUID") as string;
    this.ws.userName = localStorage.getItem("fullName") as string;
    this.ws.initWebSocket();

    this.ws.registerHandler("userTurn", this.turnChangeHandler);
    this.ws.registerHandler("trumpEvent", this.trumpHandler);
    this.ws.registerHandler("startGame", this.startHandler);
    this.ws.registerHandler("call", this.callHandler);
    this.ws.registerHandler("endRound", this.endRoundHandler);
    this.ws.registerHandler("endGame", this.endGameHandler);
    this.ws.registerHandler("notification", this.notificationHandler);
    this.ws.registerHandler("newGame", this.newGameHandler);
    this.ws.registerHandler("exitGame", this.exitGameHandler);

    this.gameService.getGame(this.gameID).subscribe((res: any) => {
      this.gameMode = res.mode ?? 'CLASSIC';
      this.teamA = res.teamA.players.map((player: any) => player.username);
      this.teamB = res.teamB.players.map((player: any) => player.username);
      if (res.state === 0 || res.state != this.gameState) {
        this.gameState = res.state;
        this.trumpManagment({
          username: res.trumpSelectorUsername,
          trumpSelected: res.trumpSelected,
        });
      }
      this.turnChanegeEvent({
        userTurn: res.playerTurn,
        trick: res?.trick,
        teamAScore: res.teamAScore,
        teamBScore: res.teamBScore,
      });
      this.isMyTurn = this.username === res.playerTurn;
      this.turn = res.turn;
    });

    this.gameService
      .getUserCards(this.gameID, this.username)
      .subscribe((res: any) => {
        this.cards = this.cards.concat(
          ...res.cards.map((card: any) => ({
            suit: card.cardSuit,
            value: card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue,
            src: `assets/images/cards/${card.cardSuit}/${
              cardValues[
                card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue
              ]
            }.jpg`,
            alt: this.getCardDescription(card.cardValue % 10, card.cardSuit),
            position: { x: 0, y: 0 },
            hidden: false,
          }))
        );
        if (this.cards.length === 0) {
          this.gameService
            .getUserCards(this.gameID, this.username)
            .subscribe((res: any) => {
              this.cards = this.cards.concat(
                ...res.cards.map((card: any) => ({
                  suit: card.cardSuit,
                  value:
                    card.cardValue >= 10 ? card.cardValue % 10 : card.cardValue,
                  src: `assets/images/cards/${card.cardSuit}/${
                    cardValues[
                      card.cardValue >= 10
                        ? card.cardValue % 10
                        : card.cardValue
                    ]
                  }.jpg`,
                  alt: this.getCardDescription(
                    card.cardValue % 10,
                    card.cardSuit
                  ),
                  position: { x: 0, y: 0 },
                  hidden: false,
                }))
              );
            });
        }
      });
  }

  private sendAcknowledgment(messageId: string): void {
    const ackMessage = JSON.stringify({
      type: 'ack',
      messageId: messageId,
    });
    this.ws.sendMessage(ackMessage);
  }

  exitGameManagment(response?: any) {
    if (response?.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.dialog.open(ExitDialogComponent, {
      width: "500px",
      data: {
        message:
          "Qualcuno ha abbandonato la partita, la partita e' stata chiusa\n Verrai reindirizzato alla home page a breve",
        onExit: this.handleExitRedirect.bind(this),
      },
    });
    this.exitTimeout = setTimeout(() => {
      this.handleExitRedirect();
    }, 3000);
  }

  handleExitRedirect() {
    this.router.navigate(["/"]).then(() => {
      window.location.reload();
    });
  }

  startGameManagment(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.currentUser = response.firstPlayer;
    this.turn = response.turn;
  }

  trumpManagment(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    if (response.trumpSelected && response.trumpSelected !== "NONE") {
      this.trumpChoosen = mappingSuit[response.trumpSelected];
      this.selectedTrump = false;
      this.notify({ message: `La briscola è ${mappingSuit[response.trumpSelected]}` });
    } else {
      this.trumpChoosen = "";
      this.selectedTrump = response.username === this.username;
    }
  }

  turnChanegeEvent(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.currentUser = response.userTurn;
    this.turn = response.turn;
    this.isMyTurn = this.username === response.userTurn;
    this.teamScoreA = response.teamAScore;
    this.teamScoreB = response.teamBScore;
    if (response.trick != undefined) {
      this.tableCards = response.trick.cards.map((card: number) => ({
        src: `assets/images/cards/${suits[Math.floor(card / 10)]}/${
          card % 10 <= 6 ? (card % 10) + 4 : (card % 10) - 6
        }.jpg`,
        suit: suits[Math.floor(card / 10)],
        user: response.trick.cardsAndUsers[card],
      }));
      this.cardsAndUsers = [];
      if (response.latestTrick.cardsAndUsers != undefined) {
        Object.entries(response.latestTrick.cardsAndUsers).forEach(
          ([key, value]: any) => {
            this.cardsAndUsers.push(
              `assets/images/cards/${suits[Math.floor(key / 10)]}/${
                key % 10 <= 6 ? (key % 10) + 4 : (key % 10) - 6
              }.jpg`
            );
          }
        );
      }
    }
  }

  makeCall(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.currentCall = response.call;
    this.notify({message : `Il giocatore ${response.username} dice ${this.callJson[`${response.call}`]}`});
  }

  notify(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.notifyMessage = response.message;
    this.isNotifyPresent = true;
    setTimeout(() => {
      this.isNotifyPresent = false;
      this.notifyMessage = "";
    }, 3000);
  }

  endRound(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.teamScoreA = response.teamAScore;
    this.teamScoreB = response.teamBScore;
    const message =
      this.gameMode === 'ELEVEN2ZERO'
        ? 'Mossa non valida! La tua squadra ha perso il round.'
        : 'Round terminato per una mossa non valida.';
    this.notify({ message });
    setTimeout(() => window.location.reload(), 3000);
  }

  endGame(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.teamScoreA = response.teamAScore;
    this.teamScoreB = response.teamBScore;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: "400px",
      data: response,
    });
    this.gameService.exitGame(this.gameID).subscribe((res) => {});
    this.router.navigate(["/"]).then(() => {
      window.location.reload();
    });
  }

  newGame(response: any) {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
  }

  startDrag(event: MouseEvent) {
    this.dragging = true;
    this.startY = event.clientY - this.position.y;
    event.preventDefault();
  }

  stopDrag() {
    if (this.dragging && this.position.y < 0) {
      this.hidden = true;
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
    }
  }

  exitGame() {
    this.dialog.open(ExitDialogComponent, {
      width: "450px",
      data: {
        message: "Sei davvero sicuro di voler uscire?",
        onExit: this.handleExit.bind(this),
      },
    });
  }

  handleExit() {
    this.gameService.exitGame(this.gameID).subscribe((res) => {});
  }

  toggleGameChatSidebar() {
    this.isGameChatSidebarOpen = !this.isGameChatSidebarOpen;
    this.numberUnreadMessages = 0;
  }

  showCardsPlayedPreviousRound(): void {
    this.dialog.open(UltimaPresaComponent, {
      width: "400px",
      data: this.cardsAndUsers,
    });
  }

  addExtraPoints() {
    if (this.selectingCardsForExtraPoints) {
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
