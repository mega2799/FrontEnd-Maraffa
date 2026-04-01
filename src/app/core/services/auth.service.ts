import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { delay, tap } from "rxjs/operators";

import { Observable, of } from "rxjs";
import { TracingService } from "../../../app/tracking.service";
import { WebSocketGameService } from "./websocket.game";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    private tracingService: TracingService,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private ws: WebSocketGameService
  ) {}

  register(email: string, nickname: string, password: string): Observable<any> {
    return this.http.post<any>("/api/register", { email, nickname, password });
  }

  login(nickname: string, password: string): Observable<any> {
    const traceHeaders = this.tracingService.getTraceHeaders();

    return this.http.post<any>("/api/login",
      { nickname, password },
      { headers: traceHeaders }
    ).pipe(
      tap({
        next: () => {
          this.tracingService.createSpan('user.login', (span) => {
            span.setAttributes({
              'user.name': nickname,
              'action.type': 'user_login',
              'login.success': true,
              'http.status': 200
            });
          });
        },
        error: (error) => {
          this.tracingService.createSpan('user.login', (span) => {
            span.setAttributes({
              'user.name': nickname,
              'action.type': 'user_login',
              'login.success': false,
              'http.status': error.status
            });
            span.recordException(error);
          });
        }
      })
    );
  }

  guestLogin(nickname: string): Observable<any> {
    return this.http.post<any>("/api/guest", { nickname });
  }

  logout(): void {
    this.ws.closeWebSocket();
    this.http
      .post("/api/logout", {
        nickname: this.localStorage.getItem("fullName"),
      })
      .subscribe();
    this.localStorage.removeItem("fullName");
    this.localStorage.removeItem("currentUser");
    this.localStorage.removeItem("authorized");
  }

  getCurrentUser(): any {
    return JSON.parse(this.localStorage.getItem("currentUser") as string);
  }

  passwordResetRequest(email: string) {
    return of(true).pipe(delay(1000));
  }

  changePassword(newPwd: string) {
    return this.http.post<any>("/api/reset-password", {
      nickname: this.localStorage.getItem("fullName"),
      password: newPwd,
    });
  }

  passwordReset(
    email: string,
    token: string,
    password: string,
    confirmPassword: string
  ): any {
    return of(true).pipe(delay(1000));
  }
}
