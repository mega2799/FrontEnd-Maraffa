import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { NGXLogger } from 'ngx-logger';
import { DashBoardService } from 'src/app/core/services/dashboard.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Game } from 'src/app/model/game.model';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit {
  gameList : any[] = []
  constructor(
    private logger: NGXLogger,
    private notificationService: NotificationService,
    private titleService: Title,
    private dashboardService: DashBoardService
  ) { }

  ngOnInit() {
    this.titleService.setTitle('angular-material-template - Users');
    this.logger.log('Users loaded');
     this.dashboardService.getGames().subscribe((data) => {
      console.log(data);
      this.gameList = data.map((game : Game) => ({
        ...game,
        teamA : game.teamA.players.map((el : any) => el.username),
        teamB : game.teamB.players.map((el : any) => el.username)
      }));
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'WAITING_PLAYERS':
        return 'status-waiting';
      case 'PLAYING':
        return 'status-playing';
      case 'FINISHED': //TODO 
        return 'status-finished';
      default:
        return '';
    }
  }
}
