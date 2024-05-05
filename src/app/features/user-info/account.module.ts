import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { UserInfoPageComponent } from './account-page/account-page.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AccountRoutingModule
  ],
  declarations: [UserInfoPageComponent, AccountDetailsComponent, ProfileDetailsComponent],
  exports: [UserInfoPageComponent]
})
export class UserInfoModule { }
