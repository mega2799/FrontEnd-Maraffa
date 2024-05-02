import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as uuid from "uuid";
import { IpServiceService } from "./ip-service.service";

@Component({
  selector: "app-root",
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  constructor(private ip: IpServiceService, private router: Router) {}
  ngOnInit() {
    this.createClientUUID();
    if (localStorage.getItem("authorized") === null) {
      this.router.navigate(["/auth/login"]);
    }
  }
  createClientUUID() {
    if (localStorage.getItem("UUID") === null) {
      localStorage.setItem("UUID", uuid.v4());
    }
  }
  getIP() {
    this.ip.getIPAddress().subscribe((res: any) => {
      localStorage.setItem("UUID", res.ip);
    });
  }
}
