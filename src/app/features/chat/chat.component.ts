import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  // styleUrls: ["./chat.component.css"],
  // styleUrls: ["./default.css"],
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
export class ChatComponent implements OnInit {
  messages: any[] = [];

  ngOnInit(): void {
    return;
  }

  sendMessage(event: { message: string; files: File[] }) {
    console.log(event.files);
    if (this.isGif(event.message) || this.isImage(event.message)) {
      this.messages.push({
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
          name: "Jonh Doe",
          avatar: "https://i.gifer.com/no.gif",
        },
      });
    } else {
      // const files = !event.files
      //   ? []
      //   : event.files.map((file) => {
      //       return {
      //         url: file.webkitRelativePath, //file.src,
      //         type: file.type,
      //         icon: "file-text-outline",
      //       };
      //     });

      this.messages.push({
        text: event.message,
        date: new Date(),
        reply: true,
        type: "text",
        files: [],
        user: {
          name: "Jonh Doe",
          avatar: "https://i.gifer.com/no.gif",
        },
      });
    }
    // const botReply = this.chatShowcaseService.reply(event.message);
    // if (botReply) {
    // setTimeout(() => { this.messages.push(botReply) }, 500);
    // }
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
