import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { delay } from "rxjs/operators";

import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    // @Inject("SESSIONSTORAGE") private localStorage: Storage,
    @Inject("LOCALSTORAGE") private localStorage: Storage
  ) {}

  register(email: string, nickname: string, password: string): Observable<any> {
    // return of(true).subscribe()
    return this.http.post<any>("/api/register", { email, nickname, password });
  }

  login(nickname: string, password: string) {
    return this.http.post<any>("/api/login", { nickname, password });
    //      return of(true).pipe(
    //   delay(1000),
    //   map((/*response*/) => {
    //     // set token property
    //     // const decodedToken = jwt_decode(response['token']);

    //     // store email and jwt token in local storage to keep user logged in between page refreshes
    //     this.localStorage.setItem(
    //       "currentUser",
    //       JSON.stringify({
    //         token: "aisdnaksjdn,axmnczm",
    //         isAdmin: true,
    //         email: "john.doe@gmail.com",
    //         id: "12312323232",
    //         alias: "john.doe@gmail.com".split("@")[0],
    //         expiration: moment().add(1, "days").toDate(),
    //         fullName: "John Doe",
    //       })
    //     );

    //     return true;
    //   })
    // );
  }

  logout(): void {
    // clear token remove user from local storage to log user out
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
    // TODO: Enable after implementation
    return JSON.parse(this.localStorage.getItem("currentUser") as string);
    // return {
    //   token: "aisdnaksjdn,axmnczm",
    //   isAdmin: true,
    //   email: "john.doe@gmail.com",
    //   id: "12312323232",
    //   alias: "john.doe@gmail.com".split("@")[0],
    //   expiration: moment().add(1, "days").toDate(),
    //   fullName: this.localStorage.getItem("fullName")
    //     ? this.localStorage.getItem("fullName")
    //     : "John Doe",
    // };
  }

  passwordResetRequest(email: string) {
    return of(true).pipe(delay(1000));
  }

  changePassword(newPwd: string) {
    return this.http.post<any>("/api/reset-password", {
      nickname: this.localStorage.getItem("fullName"),
      password: newPwd,
    });
    // return of(true).pipe(delay(1000));
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
