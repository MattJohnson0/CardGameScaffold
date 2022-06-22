import Card from "./card";

let playerSprite;
let opponentSprite;

export default class Dealer {
  constructor(scene) {
    this.handSize = 5;

    this.dealPlayerCard = (index) => {
      playerSprite = "magentaCardFront";
      let playerCard = new Card(scene, index);
      playerCard.render(475 + index * 100, 650, playerSprite);
    };

    this.dealOpponentCard = (index, startingPlacement) => {
      opponentSprite = "cyanCardBack";
      let opponentCard = new Card(scene, index);
      scene.opponentCards.push(
        opponentCard
          .render(startingPlacement + index * 60, 125, opponentSprite)
          .disableInteractive()
      );
    };

    this.dealCards = (players) => {
      console.log("players", players);
      for (let j = 0; j < players.length; j++) {
        for (let i = 0; i < this.handSize; i++) {
          this.dealPlayerCard(i);
          if (j > 0) {
            const startingPlacement = j === 1 ? 150 : j === 2 ? 550 : 950;
            this.dealOpponentCard(i, startingPlacement);
          }
        }
      }
    };
  }
}
