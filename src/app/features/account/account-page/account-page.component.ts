import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-account-page",
  templateUrl: "./account-page.component.html",
  styleUrls: ["./account-page.component.css"],
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
    this.http.get<any>(`/api/user/${nickName}`).subscribe((response) => {
      if (response.error != undefined) {
        console.log(response.error);
        //TODO 404 page ?????
      } else {
        this.userData = response;
      }
    });

    this.titleService.setTitle(`${nickName} - Account`);
  }
}
