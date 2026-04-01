import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";
import { AccountPageComponent } from "./account-page/account-page.component";
import { AccountRoutingModule } from "./account-routing.module";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { ProfileDetailsComponent } from "./profile-details/profile-details.component";

@NgModule({
  imports: [CommonModule, SharedModule, AccountRoutingModule],
  declarations: [
    AccountPageComponent,
    ChangePasswordComponent,
    ProfileDetailsComponent,
  ],
  exports: [AccountPageComponent],
})
export class AccountModule {}
