import { Component, Inject, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { environment } from "src/environments/environment.prod";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  loading!: boolean;
  name = environment.name;

  constructor(
    // @Inject("SESSIONSTORAGE") private localStorage: Storage,
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
    document.body.classList.add('register');
    document.body.classList.remove('login');
    this.titleService.setTitle("MaraffaOnline - Registrazione");
    this.authenticationService.logout();
    this.createForm();
  }

  ngOnDestroy() {
    document.body.classList.remove('register');
  }

  private createForm() {
    const savedUserEmail = localStorage.getItem("savedUserEmail");

    this.registerForm = new UntypedFormGroup({
      email: new UntypedFormControl(savedUserEmail, [
        Validators.required,
        Validators.email,
      ]),
      nickname: new UntypedFormControl("", [Validators.required]),
      password: new UntypedFormControl("", Validators.required),
      rememberMe: new UntypedFormControl(savedUserEmail !== null),
    });

    this.registerForm.statusChanges.subscribe(status => {
      const loginButton = document.getElementById('login-button') as HTMLButtonElement;
      if (loginButton) {
        loginButton.disabled = status !== 'VALID' || this.loading;
      }
    });
  }

  register() {
    const email = this.registerForm.get("email")?.value;
    const nickname = this.registerForm.get("nickname")?.value;
    const password = this.registerForm.get("password")?.value;
    const rememberMe = this.registerForm.get("rememberMe")?.value;

    this.loading = true;
    this.authenticationService
      .register(email.toLowerCase(), nickname, password)
      .subscribe(
        (data) => {
          if (data.error === undefined) {
            // this.localStorage.setItem("authorized", "true");
            this.router.navigate(["/auth/login"]);
          } else {
            this.notificationService.openSnackBar(data.error);
            this.loading = false;
          }
        },
        (error) => {
          this.notificationService.openSnackBar(error.error);
          this.loading = false;
        }
      );
  }

  loginUser() {
    this.router.navigate(["/auth/login"]);
  }
}
