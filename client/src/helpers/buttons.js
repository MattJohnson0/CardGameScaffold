const Buttons = {
  dealText: (self) => {
    const button = self.add
      .text(75, 350, ["DEAL CARDS"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    button.on("pointerdown", function () {
      self.socket.emit("startGame");
    });

    button.on("pointerover", function () {
      self.dealText.setColor("#ff69b4");
    });

    button.on("pointerout", function () {
      self.dealText.setColor("#00ffff");
    });

    return button;
  },
  pass: (self, playerIndex) => {
    const button = self.add
      .text(75, 370, ["PASS"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .disableInteractive();

    button.on("pointerdown", function () {
      self.socket.emit("pass", playerIndex);
    });

    button.on("pointerover", function () {
      self.pass.setColor("#ff69b4");
    });

    button.on("pointerout", function () {
      self.pass.setColor("#00ffff");
    });

    return button;
  },
  cancel: (self) => {
    const button = self.add
      .text(75, 390, ["CANCEL"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .disableInteractive();

    button.on("pointerdown", function () {
      console.log("Clicked cancel card button");
    });

    button.on("pointerover", function () {
      self.cancel.setColor("#ff69b4");
    });

    button.on("pointerout", function () {
      self.cancel.setColor("#00ffff");
    });

    return button;
  },
};

export default Buttons;
