import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-account-page",
  templateUrl: "./account-page.component.html",
  styleUrls: ["./account-page.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class AccountPageComponent implements OnInit {
  userData: any = {};
  constructor(
    private http: HttpClient,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title
  ) {}

  ngOnInit() {
    const nickName = this.localStorage.getItem("fullName");
    this.titleService.setTitle(`${nickName} - Account`);
    JSON.parse(this.localStorage.getItem("currentUser")!) &&
    JSON.parse(this.localStorage.getItem("currentUser")!).isGuest
      ? (this.userData = {})
      : this.http.get<any>(`/api/user/${nickName}`).subscribe((response) => {
          if (response.error != undefined) {
            console.log(response.error);
            //TODO 404 page ?????
          } else {
            this.userData = response;
          }
        });
  }
}
