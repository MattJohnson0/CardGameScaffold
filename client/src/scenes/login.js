import io from "socket.io-client";

export default class Login extends Phaser.Scene {
  constructor() {
    super({
      key: "Login",
    });
  }

  preload() {}

  create() {
    this.add.text(10, 10, "Enter your name:", {
      font: "32px Courier",
      fill: "#ffffff",
    });

    let textEntry = this.add.text(10, 50, "", {
      font: "32px Courier",
      fill: "#ffff00",
    });

    let self = this;

    this.socket = io("http://localhost:3000");

    this.socket.on("connect", function () {
      console.log("Login Scene Connected To Server");
    });

    const tooManyUsers = () => {
      textEntry.text = "";
      self.add.text(10, 50, "Too many users", {
        font: "32px Courier",
        fill: "#ff0000",
      });
    };

    this.input.keyboard.on("keydown", function (event) {
      if (event.keyCode === 8 && textEntry.text.length > 0) {
        textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
      } else if (
        event.keyCode === 32 ||
        (event.keyCode >= 48 && event.keyCode < 90)
      ) {
        textEntry.text += event.key;
      } else if (event.keyCode === 13) {
        self.socket.emit("usernameEntered", textEntry.text);
        self.socket.once("userPoolFull", function (bool, players) {
          bool
            ? tooManyUsers()
            : self.scene.start("Game", {
                userName: textEntry.text,
                players,
                socket: self.socket,
              });
        });
      }
    });
  }
}
