const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http);
const handSize = 5;
const deckSize = 11;
let players = [];
let deckRemaining = deckSize;
let currentPlayer = 0;

const setCurrentPlayer = () => {
  currentPlayer === players.length - 1
    ? (currentPlayer = 0)
    : (currentPlayer += 1);
};

io.on("connection", function (socket) {
  //***************** LOGIN SCENE EVENTS *****************//

  console.log("A user connected: " + socket.id);

  socket.on("usernameEntered", function (userName) {
    if (players.length < 4) {
      players.push(userName);
      deckRemaining -= handSize;
      io.emit("userPoolFull", false, players);
    } else {
      io.emit("userPoolFull", true);
    }
    if (deckSize - players.length * handSize !== deckRemaining) {
      io.emit(
        "serverError",
        `The deck count is too low for the total number of users playing the game. CardsRemaining: {${deckRemaining}}`
      );
    }
  });

  //***************** GAME SCENE EVENTS *****************//

  socket.on("startGame", function () {
    io.emit("dealCards", players);
  });

  socket.on("cardPlayed", function (playerIndex) {
    setCurrentPlayer();
    io.emit("cardPlayed", playerIndex, currentPlayer);
    // Set >1 because the deck is checked when a card is dropped
    // to decide whether to add a new card to the hand or not
    if (deckRemaining === 1) {
      io.emit("deckEmpty");
      deckRemaining--;
    } else if (deckRemaining > 1) {
      deckRemaining--;
    } else if (deckRemaining < 0) {
      io.emit(
        "serverError",
        `The deck count is below zero. CardsRemaining: {${deckRemaining}}`
      );
    }
  });

  socket.on("pass", function (playerIndex) {
    setCurrentPlayer();
    io.emit("passed", playerIndex, currentPlayer);
  });

  socket.on("disconnect", function () {
    console.log("A user disconnected: " + socket.id);
    players = players.filter((player) => player !== socket.id);
  });
});

http.listen(3000, function () {
  console.log("Server started!");
});
