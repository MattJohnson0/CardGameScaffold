const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http);
const handSize = 5;
const deckSize = 12;
let players = [];
let deckRemaining = deckSize;
let currentPlayer = 0;
let playerCardCounts = {};

const setPlayerCardCount = (userName, count) => {
  playerCardCounts[userName] = count;
};

const setCurrentPlayer = () => {
  currentPlayer === players.length - 1
    ? (currentPlayer = 0)
    : (currentPlayer += 1);
};

const manageDeckRemaining = (playerIndex) => {
  if (deckRemaining >= 1) {
    io.emit("deckRemaining", deckRemaining);
    deckRemaining--;
  } else if (deckRemaining === 0) {
    playerCardCounts[players[playerIndex]] -= 1;
  } else if (deckRemaining < 0) {
    io.emit(
      "serverError",
      `The deck count is below zero. CardsRemaining: {${deckRemaining}}`
    );
  }
};

io.on("connection", function (socket) {
  //***************** LOGIN SCENE EVENTS *****************//

  console.log("A user connected: " + socket.id);

  socket.on("usernameEntered", function (userName) {
    if (players.length < 4) {
      players.push(userName);
      setPlayerCardCount(userName, 0);
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
    for (let i = 0; i < players.length; i++) {
      setPlayerCardCount(players[i], 5);
    }
    io.emit("dealCards", players, playerCardCounts);
  });

  socket.on("cardPlayed", function (playerIndex) {
    setCurrentPlayer();
    manageDeckRemaining(playerIndex);
    io.emit("cardPlayed", playerIndex, currentPlayer, playerCardCounts);
  });

  socket.on("pass", function (playerIndex) {
    setCurrentPlayer();
    const playerName = players[playerIndex];
    if (deckRemaining > 1) {
      setPlayerCardCount(playerName, playerCardCounts[playerName] + 1);
    } else {
      manageDeckRemaining(playerIndex);
    }
    io.emit("passed", playerIndex, currentPlayer, playerCardCounts);
  });

  socket.on("disconnect", function () {
    console.log("A user disconnected: " + socket.id);
    players = players.filter((player) => player !== socket.id);
  });
});

http.listen(3000, function () {
  console.log("Server started!");
});
