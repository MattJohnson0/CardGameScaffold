import Card from "./card";

let playerSprite;
let opponentSprite;

export default class Dealer {
  constructor(scene) {
    let self = this;
    this.handSize = 5;

    this.startingPlacement = (index) =>
      index === 0 ? 150 : index === 1 ? 550 : 950;

    this.dealMyPlayerACard = (index) => {
      playerSprite = "magentaCardFront";
      let playerCard = new Card(scene, index);
      console.log("index", index);
      const cardPlacement = 175 + index * 100;
      console.log("cardPlacement", cardPlacement);
      playerCard.render(cardPlacement, 650, playerSprite);
    };

    this.updatePlayerCardCount = (
      startingPlacement,
      playerCardCounts,
      opponentName,
      gameSelf
    ) => {
      const opponentNameSnakeCase = `player_${opponentName}`;
      const playerCardCountsArr = Object.entries(playerCardCounts);
      const playerCardCountsFiltered = playerCardCountsArr.filter(
        ([key, name]) => {
          return self.opponents.indexOf(key) > -1;
        }
      );
      const opponentCardCounts = Object.fromEntries(playerCardCountsFiltered);
      const text = `${opponentCardCounts[opponentName]}`;
      if (gameSelf[opponentNameSnakeCase]) {
        gameSelf[opponentNameSnakeCase].text = text;
      } else {
        gameSelf[opponentNameSnakeCase] = gameSelf.add
          .text(startingPlacement + 120, 150, [text])
          .setFontSize(18)
          .setFontFamily("Trebuchet MS")
          .setColor("#00ffff");
      }
    };

    this.dealOpponentCard = (
      startingPlacement,
      playerCardCounts,
      playerName,
      gameSelf
    ) => {
      opponentSprite = "cyanCardBack";
      let opponentCard = new Card(scene, 0);
      scene.opponentCards.push(
        opponentCard
          .render(startingPlacement + 60, 125, opponentSprite)
          .disableInteractive()
      );

      gameSelf.add
        .text(startingPlacement + 120, 125, [`${playerName}`])
        .setFontSize(18)
        .setFontFamily("Trebuchet MS")
        .setColor("#00ffff");

      self.updatePlayerCardCount(
        startingPlacement,
        playerCardCounts,
        playerName,
        gameSelf
      );
    };

    this.dealCards = (players, playerIndex, playerCardCounts, gameSelf) => {
      self.opponents = players.filter((item) => item !== players[playerIndex]);
      for (let i = 0; i < this.handSize; i++) {
        this.dealMyPlayerACard(i);
      }
      for (let j = 0; j < self.opponents.length; j++) {
        this.dealOpponentCard(
          self.startingPlacement(j),
          playerCardCounts,
          self.opponents[j],
          gameSelf
        );
      }
    };
  }
}
