import { io } from "socket.io-client";
import P5 from "p5";
import "p5/lib/addons/p5.dom";
import "./styles.scss";
import { IPongView, Pong } from "./types";

let game: IPongView;
let pong = new Pong(600, 400, { id: "1" }, { id: "2" });

const messages = document.querySelector("#messages");
const input = document.querySelector("#new-chat-message");
const btn = document.querySelector("#submit");
const inputPlayerName: HTMLInputElement = document.querySelector(
  "#player-name"
);
const btnJoin = document.querySelector("#join-btn");
const playerList = document.querySelector("#player-list");

fetch("https://mj734m-3000.preview.csb.app/")
  .then((res) => res.json())
  .then(console.log);

const socket = io("https://mj734m-3000.preview.csb.app/");

socket.on("connect", () => {
  console.log("Socket connected", socket.id);
});

socket.on("chat-message", (data) => {
  //console.log("new message", data);
  messages.innerHTML += `<p>${data}</p>`;
  //document.getElementById("messages").innerHTML += data;
});
socket.on("pong.members", (members) => {
  console.log(members);
  playerList.innerHTML = members
    .map((member: { id: string; name: string }) => `<p>${member.name}</p>`)
    .join("");
});

input.addEventListener("keydown", (e) => {
  e.stopPropagation();
});

btn.addEventListener("click", (e) => {
  if (input.value) {
    socket.emit("chat-message", input.value);
    messages.innerHTML += `<p style="text-align: right;">${input.value}</p>`;
  }
});

btnJoin.addEventListener("click", (e) => {
  if (inputPlayerName.value) {
    socket.emit("pong.join", inputPlayerName.value);
    inputPlayerName.setAttribute("readonly", "true");
    btnJoin.setAttribute("disabled", "true");
  }
});

// Creating the sketch itself
const sketch = (p5: P5) => {
  p5.setup = () => {
    // Creating and positioning the canvas
    const canvas = p5.createCanvas(600, 400);
    canvas.parent("app");
    p5.background("black");

    setInterval(() => {
      pong.update();
      game = pong.show();
    }, 15);
  };

  p5.draw = () => {
    p5.background(0);
    if (game) {
      // left paddle
      p5.fill(...([128, 0, 0] as const));
      p5.rectMode(game.left.rectMode);
      p5.rect(...game.left.rect);
      // right paddle
      p5.fill(...game.right.fill);
      // }
      p5.rectMode(game.right.rectMode);
      p5.rect(...game.right.rect);
      // puck
      p5.fill(...game.puck.fill);
      p5.ellipse(...game.puck.ellipse);
      // score
      p5.fill(255);
      p5.textSize(32);
      p5.text(...game.leftScore.text);
      p5.text(...game.rightScore.text);
    }
  };

  p5.keyReleased = () => {
    if (!pong) {
      return;
    }
    const paddleLeft = pong.player("1");
    const paddleRight = pong.player("2");

    switch (p5.key) {
      case "ArrowUp":
      case "ArrowDown":
        paddleRight.move(0);
        break;
      case "w":
      case "s":
        paddleLeft.move(0);
        break;
    }
  };
  p5.keyPressed = () => {
    if (!pong) {
      return;
    }
    const paddleLeft = pong.player("1");
    const paddleRight = pong.player("2");

    switch (p5.key) {
      case "ArrowUp":
        paddleRight.move(-10);
        break;
      case "ArrowDown":
        paddleRight.move(10);
        break;
      case "w":
        paddleLeft.move(-10);
        break;
      case "s":
        paddleLeft.move(10);
        break;
    }
  };
};

new P5(sketch);
