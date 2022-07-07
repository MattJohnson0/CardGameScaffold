import Card from "../helpers/card";
import Dealer from "../helpers/dealer";
import Zone from "../helpers/zone";
import Buttons from "../helpers/buttons";

let USER_NAME = "";
let MY_PLAYER_INDEX = 0;
let SOCKET;
let MY_TURN = false;
let PLAYERS = [];
let PLAYER_CARD_COUNTS = {};
let HAND_INDEX = 5;

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
  }

  init(values) {
    const { userName, players, socket } = values;
    USER_NAME = userName;
    if (players.length > 0) {
      MY_PLAYER_INDEX = players.indexOf(USER_NAME);
    }
    if (MY_PLAYER_INDEX === 0) {
      MY_TURN = true;
    }
    SOCKET = socket;
    console.log("Game Scene Connected To Server!");
    this.add.text(10, 720, USER_NAME, {
      font: "32px Courier",
      fill: "#ffffff",
    });
  }

  preload() {
    this.load.image("cyanCardFront", "src/assets/CyanCardFront.png");
    this.load.image("cyanCardBack", "src/assets/CyanCardBack.png");
    this.load.image("magentaCardFront", "src/assets/magentaCardFront.png");
    this.load.image("magentaCardBack", "src/assets/magentaCardBack.png");
  }

  create() {
    const { dealText, pass, cancel } = Buttons;
    this.dealText = dealText(this);
    this.pass = pass(this, MY_PLAYER_INDEX);
    this.cancel = cancel(this);
    this.opponentCards = [];
    this.zone = new Zone(this);
    this.dropZone = this.zone.renderZone();
    this.outline = this.zone.renderOutline(this.dropZone);
    this.dealer = new Dealer(this);
    this.setTurn = (currentPlayer) => {
      currentPlayer === MY_PLAYER_INDEX ? (MY_TURN = true) : (MY_TURN = false);
    };
    this.socket = SOCKET;
    let self = this;
    this.setButtonsInteractiveState = () => {
      if (MY_TURN) {
        self.pass.setInteractive();
        self.cancel.setInteractive();
      } else {
        self.pass.disableInteractive();
        self.cancel.disableInteractive();
      }
    };
    this.setPlayerTurnText = (currentPlayer) => {
      const text = `It's ${PLAYERS[currentPlayer]}'s turn`;
      if (self.turnText) {
        self.turnText.text = text;
      } else {
        self.turnText = self.add
          .text(75, 300, [text])
          .setFontSize(18)
          .setFontFamily("Trebuchet MS")
          .setColor("#ffffff");
      }
    };
    this.updateOpponentCardCount = (previousPlayer) => {
      if (previousPlayer !== MY_PLAYER_INDEX) {
        self.dealer.updatePlayerCardCount(
          self.dealer.startingPlacement(previousPlayer),
          PLAYER_CARD_COUNTS,
          PLAYERS[previousPlayer],
          self
        );
      }
    };

    this.updateGameState = (currentPlayer) => {
      self.setTurn(currentPlayer);
      self.setPlayerTurnText(currentPlayer);
      self.setButtonsInteractiveState();
    };

    this.playOpponentCards = (previousPlayer) => {
      self.updateOpponentCardCount(previousPlayer);
      self.dropZone.data.values.cards++;
      let card = new Card(self);
      card
        .render(
          self.dropZone.x - 350 + self.dropZone.data.values.cards * 50,
          self.dropZone.y,
          "cyanCardFront"
        )
        .disableInteractive();
    };

    this.socket.on("dealCards", function (players, playerCardCounts) {
      PLAYERS = players;
      PLAYER_CARD_COUNTS = playerCardCounts;
      self.dealer.dealCards(PLAYERS, MY_PLAYER_INDEX, PLAYER_CARD_COUNTS, self);
      self.dealText.disableInteractive();
      self.updateGameState(0);
    });

    this.socket.on(
      "cardPlayed",
      function (previousPlayer, currentPlayer, playerCardCounts) {
        if (previousPlayer !== MY_PLAYER_INDEX) {
          PLAYER_CARD_COUNTS = playerCardCounts;
          self.playOpponentCards(previousPlayer);
          self.updateGameState(currentPlayer);
        }
      }
    );

    this.socket.on(
      "passed",
      function (previousPlayer, currentPlayer, playerCardCounts) {
        self.updateGameState(currentPlayer);
        PLAYER_CARD_COUNTS = playerCardCounts;
        self.updateOpponentCardCount(previousPlayer);
        if (MY_PLAYER_INDEX === previousPlayer) {
          self.dealer.dealMyPlayerACard(HAND_INDEX);
          HAND_INDEX += 1;
        }
      }
    );

    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      if (MY_TURN) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    });

    this.input.on("dragstart", function (pointer, gameObject) {
      if (MY_TURN) {
        gameObject.setTint(0xff69b4);
        gameObject.setDepth(0);
        self.children.bringToTop(gameObject);
      }
    });

    this.input.on("dragend", function (pointer, gameObject, dropped) {
      if (MY_TURN) {
        gameObject.setTint();
        if (!dropped) {
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
        }
      }
    });

    this.input.on("drop", function (pointer, gameObject, dropZone) {
      if (MY_TURN) {
        dropZone.data.values.cards++;
        gameObject.x = dropZone.x - 350 + dropZone.data.values.cards * 50;
        gameObject.y = dropZone.y;
        gameObject.disableInteractive();
        self.socket.emit("cardPlayed", MY_PLAYER_INDEX);
      }
      self.socket.once("deckRemaining", function (deckRemaining) {
        if (deckRemaining >= 1) {
          const index = (gameObject.input.dragStartX - 475) / 100;
          self.dealer.dealMyPlayerACard(index);
        }
      });
    });

    this.socket.on("serverError", function (message) {
      // This error only will happen at the very beginning of games if ever
      // It's caused by socket connections staying open that should have closed
      // Which causes cards to be removed from the deck that shouldn't be there in the first place
      // This error can also occur if a user has joined the game after hands have already been played
      alert(
        `Desynchronization of the server has occured, restart game to resolve. {Server Message: ${message}}`
      );
    });
  }

  update() {}
}
