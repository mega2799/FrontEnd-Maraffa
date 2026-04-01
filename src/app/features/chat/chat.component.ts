import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { GameService } from "src/app/core/services/game.service";
import { WebSocketGameService } from "src/app/core/services/websocket.game";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];

  message = new FormControl("message");
  formCazzo = new FormGroup({
    message: this.message,
  });

  private readonly messageHandler: Function;
  constructor(
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private ws: WebSocketGameService,
    private readonly gameService: GameService
  ) {
    this.messageHandler = this.handleIncomingMessage.bind(this);
  }

  ngOnDestroy(): void {
    this.ws.unregisterHandler("message", this.messageHandler);
  }

  ngOnInit(): void {
    this.ws.clientID = localStorage.getItem("UUID") as string;
    this.ws.userName = localStorage.getItem("fullName") as string;
    this.ws.initWebSocket();

    this.ws.registerHandler("message", this.messageHandler);
  }

  private sendAcknowledgment(messageId: string): void {
    const ackMessage = JSON.stringify({
      type: 'ack',
      messageId: messageId,
    });
    this.ws.sendMessage(ackMessage);
  }

  messageReceived(response: any) {
    if(response.environment !== "global") return;
    this.messages.push(JSON.parse(response.message));
  }

  private handleIncomingMessage(response: any): void {
    if (response.messageId) {
      const ackMessage = JSON.stringify({
        type: "ack",
        messageId: response.messageId,
      });
      this.ws.sendMessage(ackMessage);
    }
    this.messageReceived(response);
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
       "global",
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
