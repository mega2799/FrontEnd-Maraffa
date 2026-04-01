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
    const currentUser = JSON.parse(this.localStorage.getItem("currentUser")!);
    if (currentUser && currentUser.isGuest) {
      this.userData = {};
    } else {
      this.http.get<any>(`/api/user/${nickName}`).subscribe((response) => {
        if (response.error != undefined) {
          // error case
        } else {
          this.userData = response;
        }
      });
    }
  }
}
