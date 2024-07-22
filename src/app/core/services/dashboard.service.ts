import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashBoardService {

  joinGame(body: any) {
    return this.http.patch<any>("/api/game/join", body);
  }
  constructor(
    private http: HttpClient,
    @Inject("LOCALSTORAGE") private localStorage: Storage // @Inject("SESSIONSTORAGE") private localStorage: Storage,
  ) {}

  getGames(): Observable<any> {
    return this.http.get<any>("/api/game/getGames");
  }
  getGame(gameID: string) {
    return this.http.get<any>(`/api/game/` + gameID);
  }
  getPlayers() {
    return this.http.get<any>(`/api/player`);
  }

  createGame(body: any) {
    return this.http.post("/api/game/create", body);
  }

  removeUser(body: any) {
    return this.http.patch<any>("/api/game/remove", body);
  }
}
