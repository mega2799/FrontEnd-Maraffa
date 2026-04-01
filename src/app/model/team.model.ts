export interface UserTeam {
  username: string;
  clientID: string;
  guest: boolean;
}

export interface Team {
  players: UserTeam[];
  nameOfTeam: string;
  score: number;
}
