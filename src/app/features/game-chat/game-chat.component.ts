import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { catchError, retry, throwError } from "rxjs";
import { GameService } from "src/app/core/services/game.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";

@Component({
  selector: "app-gamechat",
  templateUrl: "./game-chat.component.html",
  styleUrls: ["./game-chat.component.css"],
  // styleUrls: [
  //   "../../../../node_modules/@nebular/theme/styles/prebuilt/default.css",
  // ],
  // styles: [
  //   `
  //     ::ng-deep nb-layout-column {
  //       justify-content: center;
  //       display: flex;
  //     }
  //     nb-chat {
  //       width: 500px;
  //     }
  //   `,
  // ],
})
export class GameChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  public interval: number = 1;
  gameID!: string;

  message = new FormControl("message");
  formCazzo = new FormGroup({
    message: this.message,
  });
  constructor(
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    // public gameService: GameService,
    private route: ActivatedRoute,
    private ws: WebSocketGameService,
    private readonly gameService: GameService
  ) {}
  ngOnDestroy(): void {
    this.clearMessages();
  }

  ngOnInit(): void {
    this.gameID = this.route.snapshot.paramMap.get("gameID") as string;
    // this.ws.clientID = this.localStorage.getItem("UUID") as string;
    // this.ws.userName = this.localStorage.getItem("fullName") as string;
    // this.ws.initWebSocket();
    this.loadMessages();
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
          case "message":
            this.messageReceived(response);
            break;
          default:
            break;
        }
      });
  }

  clearMessages() {
    localStorage.removeItem("chatMessages");
  }
  saveMessages() {
    sessionStorage.setItem("chatMessages", JSON.stringify(this.messages));
  }

  loadMessages() {
    const storedMessages = sessionStorage.getItem("chatMessages");
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);
    }
  }
  messageReceived(response: any) {
    if(response.environment !== "game") return;
    this.messages.push(JSON.parse(response.message));
    this.saveMessages();
  }

  // sendMessage(event: { message: string; files: File[] }) {
  sendMessage(formSubmit: any) {
    formSubmit.preventDefault();
    let event: any = {};
    event.message = formSubmit.target[0].value;
    formSubmit.target[0].value = "";
    let message = {};
    if (this.isGif(event.message) || this.isImage(event.message)) {
      message = {
        text: event.message,
        date: new Date(),
        reply: true,
        type: "file",
        files: [
          {
            url: event.message, //file.src,
            type: this.isGif(event.message) ? "image/gif" : "image/jpeg",
            icon: "file-text-outline",
          },
        ],
        user: {
          name: this.localStorage.getItem("fullName"),
          avatar: "https://i.gifer.com/no.gif",
        },
      };
      // this.messages.push({
      //   text: event.message,
      //   date: new Date(),
      //   reply: true,
      //   type: "file",
      //   files: [
      //     {
      //       url: event.message, //file.src,
      //       type: this.isGif(event.message) ? "image/gif" : "image/jpeg",
      //       icon: "file-text-outline",
      //     },
      //   ],
      //   user: {
      //     name: "Jonh Doe",
      //     avatar: "https://i.gifer.com/no.gif",
      //   },
      // });
    } else {
      message = {
        text: event.message,
        date: new Date(),
        reply: true,
        environment: "game",
        type: "text",
        files: [],
        user: {
          name: this.localStorage.getItem("fullName"),
          avatar: "https://i.gifer.com/no.gif",
        },
      };

      // this.messages.push({
      //   text: event.message,
      //   date: new Date(),
      //   reply: true,
      //   type: "text",
      //   files: [],
      //   user: {
      //     name: "Jonh Doe",
      //     avatar: "https://i.gifer.com/no.gif",
      //   },
      // });
    }
    this.gameService
      .sendMessage(
        this.localStorage.getItem("fullName") as string,
        JSON.stringify(message),
        "game",
        this.gameID
      )
      .subscribe((res) => {});
  }

  private isGif(url: string): boolean {
    const gifPattern = /\.gif$/i;
    return gifPattern.test(url);
  }

  private isImage(url: string): boolean {
    const imagePattern = /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i;
    return imagePattern.test(url);
  }
}
