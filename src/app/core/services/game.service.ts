import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GameService {
  exitGame(gameID: string) {
    return this.http.delete<any>(`/api/game/` + gameID);
  }
  sendMessage(author: string, message: string, environment : string, gameID?: string) {
    return this.http.post<any>(`/api/chat`, {
      gameID,
      author,
      environment,
      message,
    });
  }
  getGame(gameID: string) {
    return this.http.get<any>(`/api/game/` + gameID);
  }
  private _currentPlayer!: string;

  public get currentPlayer(): string {
    return this._currentPlayer;
  }
  public set currentPlayer(value: string) {
    this._currentPlayer = value;
  }

  constructor(
    private http: HttpClient,
    @Inject("LOCALSTORAGE") private localStorage: Storage
  ) {}

  playCard(
    gameID: string,
    username: string,
    cardValue: string,
    cardSuit: string,
    isSuitFinished: boolean
  ): Observable<any> {
    return this.http.post<any>(`/api/round/playCard`, {
      gameID,
      username,
      cardValue,
      cardSuit,
      isSuitFinished,
    });
  }
  getUserCards(gameID: string, user: string): Observable<any> {
    return this.http.get<any>(`/api/game/${gameID}/${user}/cards`);
  }

  getGames(): Observable<any> {
    return this.http.get<any>(`/api/game/getGames`);
  }

  chooseSuit(
    gameID: string,
    username: string,
    cardSuit: string
  ): Observable<any> {
    return this.http.post<any>(`/api/round/chooseTrump`, {
      gameID,
      username,
      cardSuit,
    });
  }

  makeCall(gameID: string, username: string, call: string): Observable<any> {
    return this.http.post<any>(`/api/round/makeCall`, {
      gameID,
      username,
      call,
    });
  }

  startGame(gameID: string) {
    return this.http.patch<any>(`/api/game/start`, { gameID });
  }

  setPassword(gameID: string, password: string) {
    return this.http.patch<any>(`/api/game/password`, { gameID, password });
  }

  changeTeam(
    gameID: string,
    team: string,
    username: string,
    position: number
  ): Observable<any> {
    return this.http.patch<any>(`/api/game/changeTeam`, {
      gameID,
      username,
      team,
      position,
    });
  }

  newGame(gameID: string): Observable<any> {
    console.log("new game api");
    return this.http.post<any>(`/api/game/newGame`, { gameID });
  }

  notify(gameID: string, message: string): Observable<any> {
    return this.http.post<any>(`/api/notification`, {
      gameID,
      message,
    });
  }
}
