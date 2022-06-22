import Phaser from "phaser";
import Game from "./scenes/game";
import Login from "./scenes/login";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1280,
  height: 780,
  scene: [Login, Game]
};

const game = new Phaser.Game(config);
