import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NGXLogger } from 'ngx-logger';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-waiting-room-component',
  templateUrl: './waiting-room-component.component.html',
  styleUrls: ['./waiting-room-component.component.css']
})
export class WaitingRoomComponentComponent implements OnInit {

  private _isAlive = true;

  activeGame!: any;//Game; //TODO modificato
  password!: string; //TODO modificato
  currentUser!: any//User; //TODO modificato

  // constructor(/*private _hubService: HubService, private _router: Router*/) { }
 constructor(private notificationService: NotificationService,
    private authService: AuthenticationService,
    private titleService: Title,
    private logger: NGXLogger) {
  }
  
  teamA = ['Sofi', 'Klevis'];
  
  teamB = ['Matte', 'Fede'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
    
  ngOnDestroy(): void {
    this._isAlive = false;
    this.currentUser = this.authService.getCurrentUser();
    this.titleService.setTitle('angular-material-template - Waiting Room');
    this.logger.log('Joined waiting room');

    setTimeout(() => {
      this.notificationService.openSnackBar('Welcome!');
    });

  }

  ngOnInit() {
    // this._hubService.ActiveGame.pipe(takeWhile(() => this._isAlive)).subscribe(room => {
    //   this.activeGamloge = room;
    // });

    // this._hubService.CurrentUser.pipe(takeWhile(() => this._isAlive)).subscribe(user => {
    //   this.currentUser = user;
    // });
    console.log('Hi barbie');
    
  }

  leaveWaitingRoom() {
    // this._hubService.ExitGame();
    // this._router.navigate(['/']);
  }

  joinGame() {
    // this._hubService.JoinGame(this.activeGame.gameSetup.id, '');
  }

  userIsSpectator() {
    var exists = this.activeGame.spectators.find((spectator : any)=> {
      return spectator.name == this.currentUser.name;
    });
    return exists != null;
  }

  startGame() {
    // this._hubService.StartGame();
  }

  setRoomPassword() {
    if (!this.password) return;
    // this._hubService.SetGamePassword(this.activeGame.gameSetup.id, this.password);
  }

  kickPlayerFromGame(player: any){ //Player) {
    let cfrm = confirm('Vuoi davvero eliminare questo giocatore? ' + player.user.name);
    // if (cfrm) this._hubService.KickUSerFromGame(player.user);
  }
}



// import {
//   CdkDrag,
//   CdkDragDrop,
//   CdkDropList,
//   CdkDropListGroup,
//   moveItemInArray,
//   transferArrayItem,
// } from '@angular/cdk/drag-drop';

// /**
//  * @title Drag&Drop disabled sorting
//  */
// @Component({
//   selector: 'cdk-drag-drop-disabled-sorting-example',
//   templateUrl: 'waiting-room-component.component.html',
//   styleUrls: ['waiting-room-component.component.css'],
//   standalone: true,
//   imports: [CdkDropListGroup, CdkDropList, CdkDrag],
// })
// export class CdkDragDropDisabledSortingExample {
//   items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];

//   basket = ['Oranges', 'Bananas', 'Cucumbers'];

//   drop(event: CdkDragDrop<string[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex,
//       );
//     }
//   }
// }
