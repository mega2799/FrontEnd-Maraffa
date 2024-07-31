
import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
// const config: SocketIoConfig = { url: "http://localhost:3003", options: {} };


@Injectable({
  providedIn: "root",
})
export class SocketIoService {
  constructor(private socket: Socket) {
  }

  public sendMessage(){
	this.socket.emit("new-message", { message: "Hello" });
  }
}
