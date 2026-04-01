import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.module";
import { AccountDetailsComponent } from "./account-details/account-details.component";
import { UserInfoPageComponent } from "./account-page/account-page.component";
import { AccountRoutingModule } from "./account-routing.module";
import { ProfileDetailsComponent } from "./profile-details/profile-details.component";

import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,
    SharedModule,
    AccountRoutingModule,
  ],
  declarations: [
    UserInfoPageComponent,
    AccountDetailsComponent,
    ProfileDetailsComponent,
  ],
  exports: [UserInfoPageComponent],
})
export class UserInfoModule {}
