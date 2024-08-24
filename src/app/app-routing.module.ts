import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'all-games',
    loadChildren: () => import('./features/game/all-games/allgames.module').then(m => m.AllGamesModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'user-list',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'userInfo',
    loadChildren: () => import('./features/user-info/account.module').then(m => m.UserInfoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account.module').then(m => m.AccountModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ultima-presa',
    loadChildren: () => import('./features/ultima-presa/ultima-presa.module').then(m => m.UltimaPresaModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dialog',
    loadChildren: () => import('./features/dialog/dialog.module').then(m => m.DialogModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'about',
    loadChildren: () => import('./features/about/about.module').then(m => m.AboutModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game.module').then(m => m.GameModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'waiting',
    loadChildren: () => import('./features/waiting-room/waiting-room.module').then(m => m.WaitingRoomModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'donazione',
    loadChildren: () => import('./features/dashboard/donazione/donazione.module').then(m => m.DonazioneModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
