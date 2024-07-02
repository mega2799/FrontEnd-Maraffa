import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashBoardService {
  private _password!: string;

  checkPassword(pwd: string): boolean {
    console.log("pwd", pwd, "this._password", this._password);
    return this._password === pwd;
  }
  setPassword(value: string) {
    this._password = value;
  }

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

  getPlayers() {
    return this.http.get<any>(`/api/player`);
  }

  createGame(body: any) {
    return this.http.post("/api/game/create", body);
  }
}
