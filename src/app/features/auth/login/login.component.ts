import { Component, Inject, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import * as moment from "moment";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { environment } from "src/environments/environment.prod";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  loading!: boolean;
  name = environment.name;

  constructor(
    private router: Router,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService
  ) {}

  guestAccess() {
    throw new Error("Method not implemented.");
  }

  ngOnInit() {
    this.titleService.setTitle("MaraffaOnline - Login");
    this.authenticationService.logout();
    this.createForm();
  }

  private createForm() {
    const savedUserEmail = localStorage.getItem("savedUserEmail");

    this.loginForm = new UntypedFormGroup({
      nickname: new UntypedFormControl("", [Validators.required]),
      //   email: new UntypedFormControl(savedUserEmail, [
      //     Validators.required,
      //     Validators.email,
      //   ]),
      password: new UntypedFormControl("", Validators.required),
      rememberMe: new UntypedFormControl(savedUserEmail !== null),
    });
  }

  login() {
    const nickname = this.loginForm.get("nickname")?.value;
    const password = this.loginForm.get("password")?.value;
    const rememberMe = this.loginForm.get("rememberMe")?.value;

    this.loading = true;
    this.authenticationService.login(nickname, password).subscribe(
      (data) => {
        // if (rememberMe) {
        //   localStorage.setItem("savedUserEmail", email);
        // } else {
        //   localStorage.removeItem("savedUserEmail");
        // }
        if (data.error === undefined) {
          this.localStorage.setItem(
            "currentUser",
            JSON.stringify({
              token: data.token,
              isAdmin: true,
              email: null,
              id: nickname,
              // alias: "john.doe@gmail.com".split("@")[0],
              expiration: moment().add(1, "days").toDate(),
              fullName: "John Doe",
            })
          );
          this.localStorage.setItem("authorized", data.token);
          this.router.navigate(["/"]);
        } else {
          console.log(data);

          this.notificationService.openSnackBar(data.error);
          this.loading = false;
        }
      },
      (error) => {
        this.notificationService.openSnackBar(error.error.error); //WTF BRO
        this.loading = false;
      }
    );
  }

  registerUser() {
    this.router.navigate(["/auth/register"]);
  }

  resetPassword() {
    this.router.navigate(["/auth/password-reset-request"]);
  }
}
