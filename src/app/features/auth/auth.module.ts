import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";
import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./login/login.component";
import { PasswordResetRequestComponent } from "./password-reset-request/password-reset-request.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { RegisterComponent } from "./register/register.component";

@NgModule({
  imports: [CommonModule, SharedModule, AuthRoutingModule],
  declarations: [
    LoginComponent,
    PasswordResetRequestComponent,
    RegisterComponent,
    PasswordResetComponent,
  ],
})
export class AuthModule {}
