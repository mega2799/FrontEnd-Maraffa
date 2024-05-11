import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashBoardService {
  constructor(
    private http: HttpClient,
    @Inject("LOCALSTORAGE") private localStorage: Storage
  ) {}

  getGames(): Observable<any> {
    return this.http.get<any>("/api/game/getGames");
  }
}
