import { Component, Inject, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import * as moment from "moment";
import { bufferCount, first, fromEvent, map } from "rxjs";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { environment } from "src/environments/environment.prod";

const konami = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
].join();

const bestNames = [
  "Luca Catone",
  "Thomas Turbato",
  "Kekko Lione",
  "Homer Doso",
  "Erminio Ottone",
  "Luca Pucchione",
  "Andrei Koimaschi",
  "Nadia Rea",
  "Devis Ucarlo",
  "Cionpi Sellone",
  "Lollo Causto",
  "Micheal Pitolano",
  "Horace Coreggio",
  "Luca Pezzolo",
];

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  loading!: boolean;
  funny: boolean = false;
  name = environment.name;

  readonly keys = fromEvent(document, "keydown")
    .pipe(
      map((v: any) => v.key),
      bufferCount(10, 1),
      map((v) => v.join()),
      first((v) => v === konami),
      map((v) => {}),
      map((v) => typeof v)
    )
    .subscribe(() => {
      this.funny = true;
    });
  constructor(
    private router: Router,
    @Inject("LOCALSTORAGE") private localStorage: Storage,
    private titleService: Title,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService
  ) {}

  guestAccess() {}

  guestAccessFunny() {
    const name = bestNames[Math.floor(Math.random() * bestNames.length)];

    this.localStorage.setItem("fullName", name);
    this.localStorage.setItem(
      "currentUser",
      JSON.stringify({
        token: "MegaToken",
        isAdmin: true,
        email: null,
        id: name,
        // alias: "john.doe@gmail.com".split("@")[0],
        expiration: moment().add(1, "days").toDate(),
        fullName: name,
      })
    );

    this.localStorage.setItem("authorized", "MegaToken");
    this.router.navigate(["/"]);
  }

  ngOnInit() {
    document.body.classList.add("login");
    document.body.classList.remove("register");
    this.titleService.setTitle("MaraffaOnline - Login");
    this.authenticationService.logout();
    this.createForm();
  }

  ngOnDestroy() {
    document.body.classList.remove("login");
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

  this.loginForm.statusChanges.subscribe(status => {
    const loginButton = document.getElementById('login-button') as HTMLButtonElement;
    if (loginButton) {
      loginButton.disabled = status !== 'VALID' || this.loading;
    }
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
          this.localStorage.setItem("fullName", nickname);
          this.localStorage.setItem(
            "currentUser",
            JSON.stringify({
              token: data.token,
              isAdmin: true,
              email: null,
              id: nickname,
              // alias: "john.doe@gmail.com".split("@")[0],
              expiration: moment().add(1, "days").toDate(),
              fullName: nickname,
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
