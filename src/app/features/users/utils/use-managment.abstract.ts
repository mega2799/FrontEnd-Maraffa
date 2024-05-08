import { HttpClient } from "@angular/common/http";
import { Inject } from "@angular/core";
import { Title } from "@angular/platform-browser";

export default class UserManagment {
  public userData: any = {};
  constructor(
    public http: HttpClient,
    @Inject("LOCALSTORAGE") public localStorage: Storage,
    public titleService: Title
  ) {}

  initFucntionTOGetUserData(): Promise<void> {
    return new Promise((resolve, reject) => {
      //   var options  = { weekday: "long", month: "2-digit", day: "2-digit" };
      var date = new Date().toLocaleString("it-IT");
      const nickName = this.localStorage.getItem("fullName");
      this.titleService.setTitle(`${nickName} - Account`);
      JSON.parse(this.localStorage.getItem("currentUser")!) &&
      JSON.parse(this.localStorage.getItem("currentUser")!).isGuest
        ? ((this.userData = {
            gamesPlayed: 100,
            gamesWon: 40,
            email: "fakeMailME@gmail.com",
            registrationDate: date,
            latestLogin: date,
          }),
          resolve())
        : this.http.get<any>(`/api/user/${nickName}`).subscribe((response) => {
            if (response.error != undefined) {
              console.log(response.error);
              reject();
              //TODO 404 page ?????
            } else {
              //   resolve();
              this.userData = response;
              resolve();
            }
          });
    });
  }
}
