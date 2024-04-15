import { Card } from "./card.model";
import { CardAndUser, User } from "./user.model";

export interface Player {
  user: User;
  leftGame: boolean;
}

export interface GameSetup {
  id: string;
  isPasswordProtected: boolean;
  users: User[];
  playUntilPoints: number;
  expectedNumberOfPlayers: number;
}
export interface Team {
  name: string;
  users: User[];
  calculatedPoints: number;
  points: number; //ALE
}

export interface Game {
  //TODO temporaneamente teniamo le cose vecchie ma queste andranno revisionate
  gameSetup: GameSetup;
  players: Player[];
  spectators: User[];
  userTurnToPlay: User;
  firstUserTurnToPlay: User;
  gameEnded: boolean;
  gameStarted: boolean;
  roundEnded: boolean;
  isFirstRound: boolean;
  deckSize: number;
  myCards: Card[];
  teams: Team[];
  cardsPlayed: CardAndUser[];
  cardsPlayedPreviousRound: CardAndUser[];
  cardsDrew: CardAndUser[];
}
