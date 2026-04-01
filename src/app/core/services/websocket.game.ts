import { Injectable, OnDestroy } from "@angular/core";
import { io, Socket } from "socket.io-client";

@Injectable({
  providedIn: "root",
})
export class WebSocketGameService implements OnDestroy {
  private socket!: Socket;
  private isConnected: boolean = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  private _clientID!: string;
  private _userName!: string;

  public get clientID(): string {
    return this._clientID;
  }
  public set clientID(value: string) {
    this._clientID = value;
  }

  public get userName(): string {
    return this._userName;
  }
  public set userName(value: string) {
    this._userName = value;
  }

  constructor() {}

  public initWebSocket(): void {
    const token = localStorage.getItem("authorized");
    if (!token) {
      console.error("Cannot init WebSocket: no JWT token in localStorage.");
      return;
    }

    const username = localStorage.getItem("fullName") ?? "";

    // Se il socket esiste, verifica che lo username non sia cambiato (es. re-login guest).
    // Se è cambiato, disconnetti e ricrea il socket con il nuovo username.
    if (this.socket) {
      const currentQuery = this.socket.io.opts.query as Record<string, string> | undefined;
      const connectedAs = currentQuery?.["username"] ?? "";
      if (connectedAs === username) {
        console.log("WebSocket already initialized as", username, "connected:", this.socket.connected, "id:", this.socket.id);
        return;
      }
      console.log("WebSocket username changed:", connectedAs, "→", username, "— reconnecting");
      this.socket.disconnect();
      (this.socket as any) = null;
    }

    this.socket = io("/ws", {
      query: { token, username },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Socket.io connected, id:", this.socket.id, "username:", username);
    });

    this.socket.on("game-event", (message: any) => {
      console.log("Socket.io game-event received:", message?.event, message);
      this.routeEvent(message);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket.io connection error:", err.message);
      this.isConnected = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.io disconnected:", reason);
      this.isConnected = false;
    });
  }

  public sendMessage(message: any): void {
    if (!this.isConnected || !this.socket) {
      console.error("Cannot send message: Socket.io is not connected.");
      return;
    }
    // Invia ACK al server tramite evento 'ack'
    this.socket.emit("ack", message);
    console.log("Message sent:", message);
  }

  private routeEvent(message: any): void {
    const { event } = message;
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    } else {
      console.warn(`No handlers registered for event: ${event}`);
    }
  }

  public registerHandler(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public unregisterHandler(event: string, handler: Function): void {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  public closeWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      (this.socket as any) = null;
      console.log("Socket.io connection closed manually.");
    }
    this.isConnected = false;
  }

  ngOnDestroy(): void {
    this.closeWebSocket();
  }
}
