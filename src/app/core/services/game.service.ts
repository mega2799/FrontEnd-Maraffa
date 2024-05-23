import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GameService {
  constructor(
    private http: HttpClient,
    @Inject("LOCALSTORAGE") private localStorage: Storage
  ) {}

  getUserCards(gameID: string, user: string): Observable<any> {
    return this.http.get<any>(`/api/game/${gameID}/${user}/cards`);
  }
}
