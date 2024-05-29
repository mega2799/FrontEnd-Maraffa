import { Injectable } from "@angular/core";
import { WebSocketSubject, webSocket } from "rxjs/webSocket";

@Injectable({
  providedIn: "root",
})
export class WebSocketGameService {
  //Non si puo usare l inject per passare il gameID e quindi vedere come risolvere
  private _clientID!: string;

  public get clientID(): string {
    return this._clientID;
  }
  public set clientID(value: string) {
    this._clientID = value;
  }
  constructor() {}
  private URL!: string;
  public webSocketSubject!: WebSocketSubject<string>;
  public webSocket$: any;

  initWebSocket(): void {
    // this.URL = `ws://localhost:3003/${this._gameID}`;
    this.URL = `ws://localhost:3003/${this._clientID}`;
    // this.webSocketSubject = webSocket<string>(this.URL);
    this.webSocketSubject = webSocket<string>({
      url: this.URL,
      deserializer: ({ data }) => {
        return data;
      },
      serializer: (msg) => {
        return msg;
      },
      openObserver: {
        next: () => {
          console.log("connection ok");
          console.log("listening to url: ", this.URL);
        },
      },
      closeObserver: {
        next(closeEvent) {
          console.log("connection closed", closeEvent.code, closeEvent.reason);
        },
      },
    });
    this.webSocket$ = this.webSocketSubject.asObservable();
  }
  //   private readonly URL = 'ws://localhost:3000';

  updateInterval(interval: number): void {
    this.webSocketSubject.next(JSON.stringify(interval));
  }

  //metodo custom fatto da me
  onExit(): void {
    // this.webSocketSubject.complete();
    this.webSocketSubject.unsubscribe();
  }
}
