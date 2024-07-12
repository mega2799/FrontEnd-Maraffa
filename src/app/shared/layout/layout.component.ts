import { MediaMatcher } from "@angular/cdk/layout";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Subscription, timer } from "rxjs";

import { Router } from "@angular/router";
import { AuthGuard } from "src/app/core/guards/auth.guard";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { environment } from "src/environments/environment.prod";
import { SpinnerService } from "../../core/services/spinner.service";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  private _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  showSpinner: boolean = false;
  userName: string = "";
  isAdmin: boolean = false;
  isGuest: boolean = false;
  name = environment.name;

  private autoLogoutSubscription: Subscription = new Subscription();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private router: Router,
    public spinnerService: SpinnerService,
    private authService: AuthenticationService,
    private authGuard: AuthGuard
  ) {
    this.mobileQuery = this.media.matchMedia("(max-width: 1000px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  logOut() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user.isAdmin;
    this.userName = user.fullName;
    this.isGuest = user.isGuest;
    // Auto log-out subscription
    const timer$ = timer(2000, 5000);
    this.autoLogoutSubscription = timer$.subscribe(() => {
      this.authGuard.canActivate();
    });
  }

  ngOnDestroy(): void {
    // tslint:disable-next-line: deprecation
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.autoLogoutSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
}
