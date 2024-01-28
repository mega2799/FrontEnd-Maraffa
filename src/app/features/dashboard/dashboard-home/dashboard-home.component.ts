import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Title } from '@angular/platform-browser';
import { NGXLogger } from 'ngx-logger';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  currentUser: any;

  constructor(private notificationService: NotificationService,
    private authService: AuthenticationService,
    private titleService: Title,
    private logger: NGXLogger) {
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.titleService.setTitle('angular-material-template - Dashboard');
    this.logger.log('Dashboard loaded');

    setTimeout(() => {
      this.notificationService.openSnackBar('Welcome!');
    });
  }

  createGame(playUntilPoints: number, expectedNumberOfPlayers: number) {
    // this._hubService.CreateGame(playUntilPoints, expectedNumberOfPlayers);
  }

  rename() {
    let name = prompt('Input your name');
    if (!name) return;
    localStorage.setItem('name', name);
    window.location.reload();
  }

  getGameCount() {
    // return this._hubService.GameCount;
    //return 15;
  }
}
