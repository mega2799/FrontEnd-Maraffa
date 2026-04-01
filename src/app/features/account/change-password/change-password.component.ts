import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  form!: UntypedFormGroup;
  hideCurrentPassword: boolean;
  hideNewPassword: boolean;
  currentPassword!: string;
  newPassword!: string;
  newPasswordConfirm!: string;
  disableSubmit!: boolean;
  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthenticationService,
    private logger: NGXLogger,
    private spinnerService: SpinnerService,
    private notificationService: NotificationService) {

    this.hideCurrentPassword = true;
    this.hideNewPassword = true;
  }

  ngOnInit() {
    this.form = new UntypedFormGroup({
      newPassword: new UntypedFormControl('', Validators.required),
      newPasswordConfirm: new UntypedFormControl('', Validators.required),
    });

    this.subscriptions.push(
      this.form.get('newPassword')!.valueChanges
        .subscribe(val => { this.newPassword = val; })
    );

    this.subscriptions.push(
      this.form.get('newPasswordConfirm')!.valueChanges
        .subscribe(val => { this.newPasswordConfirm = val; })
    );

    this.subscriptions.push(
      this.spinnerService.visibility.subscribe((value) => {
        this.disableSubmit = value;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changePassword() {

    if (this.newPassword !== this.newPasswordConfirm) {
      this.notificationService.openSnackBar('Le nuove password sono diverse.');
      return;
    }

    const email = this.authService.getCurrentUser().email;

    this.authService.changePassword(this.newPassword)
      .subscribe(
        data => {
          this.logger.info(`User ${email} changed password.`);
          this.form.reset();
          this.notificationService.openSnackBar('La tua password è stata cambiata.');
        },
        error => {
          this.notificationService.openSnackBar(error.error);
        }
      );
  }
}
