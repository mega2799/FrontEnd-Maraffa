import { Component, Input, OnInit } from "@angular/core";
import { CardAndUser } from "src/app/model/user.model";

@Component({
  selector: "app-card-player",
  templateUrl: "./card-player.component.html",
  styleUrls: ["./card-player.component.css"],
})
export class CardPlayerComponent implements OnInit {
  constructor() {}
  // @Input("cardAndUser")
  @Input()
  cardAndUser!: CardAndUser;
  @Input()
  // @Input("isPlayedCard")
  isPlayedCard: boolean = false;
  ngOnInit(): void {
    return;
  }

  getCardClass() {
    if (this.isPlayedCard) {
      //TODO qui potrebbe anche andare bene cosi
      if (window.document.getElementById("tavolo")!.className == "col-6")
        //se è una partita da 2 deve restituire lo stile da 2 giocatori
        return ["played-card-2"];
      else return ["played-card"];
    }
    return ["drew-card"];
  }
}
