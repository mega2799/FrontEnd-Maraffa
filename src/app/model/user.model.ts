import { Card } from "./card.model";

export class User {
  connectionId!: string;
  name!: string;
  team!: number;
}

export interface CardAndUser {
  card: Card;
  user: User;
}
