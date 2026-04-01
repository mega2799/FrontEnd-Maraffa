import { Component, Inject, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { GameService } from "src/app/core/services/game.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";

@Component({
  selector: "app-gamechat",
  templateUrl: "./game-chat.component.html",
  styleUrls: ["./game-chat.component.css"],
})
export class GameChatComponent implements OnInit, OnDestroy {
  @Input() gameID!: string;
  messages: any[] = [];
  form: FormGroup;
  private readonly messageHandler: Function;

  constructor(
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private ws: WebSocketGameService,
    private readonly gameService: GameService
  ) {
    this.form = new FormGroup({
      message: new FormControl(""),
    });
    this.messageHandler = this.handleIncomingMessage.bind(this);
  }

  ngOnInit(): void {
    this.loadMessages();
    this.ws.clientID = localStorage.getItem("UUID") as string;
    this.ws.userName = localStorage.getItem("fullName") as string;
    this.ws.initWebSocket();

    this.ws.registerHandler("message", this.messageHandler);
  }

  ngOnDestroy(): void {
    this.clearMessages();
    this.ws.unregisterHandler("message", this.messageHandler);
  }

  private handleIncomingMessage(response: any): void {
    if (response.messageId) {
      this.sendAcknowledgment(response.messageId);
    }
    this.processReceivedMessage(response);
  }

  private sendAcknowledgment(messageId: any): void {
    const ackMessage = JSON.stringify({
      type: "ack",
      messageId: messageId,
    });
    this.ws.sendMessage(ackMessage);
  }

  private processReceivedMessage(response: any): void {
    if (response.environment !== "game") return;
    this.messages.push(JSON.parse(response.message));
    this.saveMessages();
  }

  private clearMessages(): void {
    sessionStorage.removeItem("chatMessages");
  }

  private saveMessages(): void {
    sessionStorage.setItem("chatMessages", JSON.stringify(this.messages));
  }

  private loadMessages(): void {
    const storedMessages = sessionStorage.getItem("chatMessages");
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);
    }
  }

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
            url: event.message,
            type: this.isGif(event.message) ? "image/gif" : "image/jpeg",
            icon: "file-text-outline",
          },
        ],
        user: {
          name: this.localStorage.getItem("fullName"),
          avatar: "https://i.gifer.com/no.gif",
        },
      };
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
