import { MediaMatcher } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule, Optional, SkipSelf } from "@angular/core";
import { NGXLogger } from "ngx-logger";

import { AdminGuard } from "./guards/admin.guard";
import { AuthGuard } from "./guards/auth.guard";
import { throwIfAlreadyLoaded } from "./guards/module-import.guard";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { SpinnerInterceptor } from "./interceptors/spinner.interceptor";
import { GlobalErrorHandler } from "./services/globar-error.handler";

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [],
  providers: [
    AuthGuard,
    AdminGuard,
    MediaMatcher,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    { provide: NGXLogger, useClass: NGXLogger },
    { provide: "LOCALSTORAGE", useValue: window.localStorage },
    { provide: "SESSIONSTORAGE", useValue: window.sessionStorage },
  ],
  exports: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, "CoreModule");
  }
}
