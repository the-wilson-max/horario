// Minigames Modal Logic + Basic Games (Tamaños aumentados)

const modal = document.getElementById("modal-game");
const closeModalBtn = document.getElementById("close-modal");
const gameContainer = document.getElementById("game-container");
const gameTitle = document.getElementById("game-title");

const games = {
  tictactoe: {
    name: "TicTacToe",
    render: function (container) {
      container.innerHTML = `
        <style>
          .tictactoe-board { display: grid; grid-template-columns: repeat(3, 128px); gap: 12px; margin: 0 auto;}
          .tictactoe-cell {
            width: 128px; height: 128px; font-size: 3.7rem; background: #1a1e29; border-radius: 14px;
            display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4f8cff;
            transition: background 0.13s;
            border: 4px solid #4f8cff44;
            font-weight: bold;
          }
          .tictactoe-cell:hover { background: #222c3b; }
          .tictactoe-status { color: #74d800; margin-top: 1.5rem; text-align: center; font-weight: 700; font-size: 1.5rem;}
        </style>
        <div class="tictactoe-board"></div>
        <div class="tictactoe-status"></div>
      `;
      let board = Array(9).fill("");
      let xTurn = true;
      let finished = false;
      const winCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      const updateStatus = (msg) =>
        (container.querySelector(".tictactoe-status").textContent = msg);
      function checkWin() {
        for (let combo of winCombos) {
          const [a, b, c] = combo;
          if (board[a] && board[a] === board[b] && board[a] === board[c])
            return board[a];
        }
        return board.every((cell) => cell) ? "Empate" : null;
      }
      function render() {
        const boardDiv = container.querySelector(".tictactoe-board");
        boardDiv.innerHTML = "";
        board.forEach((cell, idx) => {
          const d = document.createElement("div");
          d.className = "tictactoe-cell";
          d.textContent = cell;
          d.onclick = () => {
            if (!cell && !finished) {
              board[idx] = xTurn ? "X" : "O";
              xTurn = !xTurn;
              const result = checkWin();
              if (result) {
                finished = true;
                updateStatus(
                  result === "Empate" ? "¡Empate!" : `Ganó ${result}`
                );
              } else {
                updateStatus(`Turno de ${xTurn ? "X" : "O"}`);
              }
              render();
            }
          };
          boardDiv.appendChild(d);
        });
      }
      updateStatus("Turno de X");
      render();
    },
  },
  memory: {
    name: "Memory (parejas)",
    render: function (container) {
      container.innerHTML = `
        <style>
          .memory-board { display: grid; grid-template-columns: repeat(4, 90px); gap: 16px; margin: 0 auto;}
          .memory-card {
            width: 90px; height: 90px; font-size: 2.3rem; background: #1a1e29;
            border-radius: 14px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #4f8cff; border: 3px solid #4f8cff44;
            transition: background 0.13s, color 0.13s;
            user-select: none;
            font-weight: bold;
          }
          .memory-card.flipped, .memory-card.matched { background: #74d800; color: #fff; cursor: default;}
          .memory-status { color: #58a6ff; margin-top: 1.2rem; text-align: center; font-size: 1.3rem;}
        </style>
        <div class="memory-board"></div>
        <div class="memory-status"></div>
      `;
      const emojis = ["🍎", "🍌", "🍒", "🍇", "🍉", "🥝", "🍑", "🍐"];
      let deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
      let flipped = [],
        matched = [];
      let waiting = false;
      const updateStatus = (msg) =>
        (container.querySelector(".memory-status").textContent = msg);
      function render() {
        const boardDiv = container.querySelector(".memory-board");
        boardDiv.innerHTML = "";
        deck.forEach((emoji, idx) => {
          const d = document.createElement("div");
          d.className = "memory-card";
          if (matched.includes(idx)) d.classList.add("matched");
          if (flipped.includes(idx) || matched.includes(idx)) {
            d.classList.add("flipped");
            d.textContent = emoji;
          } else {
            d.textContent = "";
          }
          d.onclick = () => {
            if (waiting || flipped.includes(idx) || matched.includes(idx))
              return;
            flipped.push(idx);
            render();
            if (flipped.length === 2) {
              waiting = true;
              setTimeout(() => {
                const [a, b] = flipped;
                if (deck[a] === deck[b]) {
                  matched.push(a, b);
                  updateStatus("¡Pareja encontrada!");
                } else {
                  updateStatus("¡Intenta de nuevo!");
                }
                flipped = [];
                waiting = false;
                render();
                if (matched.length === deck.length) {
                  updateStatus("🎉 ¡Ganaste!");
                }
              }, 800);
            }
          };
          boardDiv.appendChild(d);
        });
      }
      updateStatus("Encuentra todas las parejas");
      render();
    },
  },
  snake: {
    name: "Snake",
    render: function (container) {
      container.innerHTML = `
        <style>
          .snake-board { background: #1a1e29; display: grid; grid-template-columns: repeat(16, 32px); grid-template-rows: repeat(16, 32px); gap: 4px; margin: 0 auto;}
          .snake-cell { width: 32px; height: 32px; border-radius: 6px; background: #4f8cff11;}
          .snake-head { background: #4f8cff;}
          .snake-body { background: #71e06e;}
          .snake-food { background: #e46c6c;}
          .snake-status { color: #74d800; margin-top: 1.2rem; text-align: center; font-size: 1.2rem;}
        </style>
        <div class="snake-board"></div>
        <div class="snake-status"></div>
        <div style="color:#8b949e;font-size:1.12em;margin-top:1.1rem;text-align:center;">Usa las flechas para mover</div>
      `;
      let boardSize = 16,
        snake = [180, 164],
        dir = 1,
        food = 55,
        alive = true,
        grow = false,
        interval;
      const statusDiv = container.querySelector(".snake-status");
      function randomFood() {
        let f;
        do {
          f = Math.floor(Math.random() * (boardSize * boardSize));
        } while (snake.includes(f));
        return f;
      }
      function render() {
        const boardDiv = container.querySelector(".snake-board");
        boardDiv.innerHTML = "";
        for (let i = 0; i < boardSize * boardSize; i++) {
          const d = document.createElement("div");
          d.className = "snake-cell";
          if (i === snake[0]) d.classList.add("snake-head");
          else if (snake.includes(i)) d.classList.add("snake-body");
          else if (i === food) d.classList.add("snake-food");
          boardDiv.appendChild(d);
        }
      }
      function end(msg) {
        clearInterval(interval);
        alive = false;
        statusDiv.textContent = msg + " (Presiona R para reiniciar)";
      }
      function move() {
        if (!alive) return;
        const head = snake[0];
        let nx =
          dir === -1
            ? head - 1
            : dir === 1
            ? head + 1
            : dir === -boardSize
            ? head - boardSize
            : head + boardSize;
        if (
          nx < 0 ||
          nx >= boardSize * boardSize ||
          (dir === -1 && nx % boardSize === boardSize - 1) ||
          (dir === 1 && nx % boardSize === 0) ||
          snake.includes(nx)
        ) {
          end("¡Perdiste!");
          return;
        }
        snake.unshift(nx);
        if (nx === food) {
          food = randomFood();
          statusDiv.textContent = "¡Comiste!";
        } else {
          snake.pop();
        }
        render();
      }
      function keydown(e) {
        if (!alive && e.key.toLowerCase() === "r") return restart();
        if (e.key === "ArrowLeft" && dir !== 1) dir = -1;
        else if (e.key === "ArrowRight" && dir !== -1) dir = 1;
        else if (e.key === "ArrowUp" && dir !== boardSize) dir = -boardSize;
        else if (e.key === "ArrowDown" && dir !== -boardSize) dir = boardSize;
      }
      function restart() {
        snake = [180, 164];
        dir = 1;
        food = 55;
        alive = true;
        statusDiv.textContent = "¡Vamos!";
        render();
        clearInterval(interval);
        interval = setInterval(move, 100);
      }
      document.addEventListener("keydown", keydown);
      statusDiv.textContent = "¡Vamos!";
      render();
      interval = setInterval(move, 100);
      // Cleanup cuando se cierra el modal
      modal.addEventListener(
        "close-game",
        () => {
          clearInterval(interval);
          document.removeEventListener("keydown", keydown);
        },
        { once: true }
      );
    },
  },
  pong: {
    name: "Pong",
    render: function (container) {
      container.innerHTML = `
        <style>
          .pong-canvas { background: #161b22; border-radius: 14px; display: block; margin: 0 auto; box-shadow: 0 2px 24px #4f8cff33;}
          .pong-status { color: #58a6ff; margin-top: 1.2rem; text-align: center; font-weight: 700; font-size: 1.2rem;}
        </style>
        <canvas class="pong-canvas" width="600" height="320"></canvas>
        <div class="pong-status"></div>
        <div style="color:#8b949e;font-size:1.08em;margin-top:1.1rem;text-align:center;">W/S o &uarr;/&darr; para mover</div>
      `;
      const canvas = container.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      let p1y = 130,
        p2y = 130,
        py = 160,
        px = 300,
        vx = 5,
        vy = 4,
        p1score = 0,
        p2score = 0,
        playing = true;
      function draw() {
        ctx.clearRect(0, 0, 600, 320);
        ctx.fillStyle = "#4f8cff"; // Paddles
        ctx.fillRect(16, p1y, 14, 70);
        ctx.fillRect(570, p2y, 14, 70);
        ctx.fillStyle = "#71e06e"; // Ball
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 28px Inter";
        ctx.fillText(p1score, 240, 40);
        ctx.fillText(p2score, 360, 40);
      }
      function move() {
        if (!playing) return;
        px += vx;
        py += vy;
        if (py < 14 || py > 306) vy *= -1;
        // P1
        if (px < 40 && py > p1y && py < p1y + 70) vx *= -1;
        // P2
        if (px > 546 && py > p2y && py < p2y + 70) vx *= -1;
        // AI mueve p2
        if (p2y + 35 < py) p2y += 4.6;
        else if (p2y + 35 > py) p2y -= 4.6;
        // Puntos
        if (px < 0) {
          p2score++;
          reset();
        }
        if (px > 600) {
          p1score++;
          reset();
        }
      }
      function reset() {
        px = 300;
        py = 160;
        vx = -vx;
        vy = 4 * (Math.random() > 0.5 ? 1 : -1);
      }
      function loop() {
        move();
        draw();
        if (playing) requestAnimationFrame(loop);
      }
      function keydown(e) {
        if (e.key === "ArrowDown" || e.key === "s")
          p1y = Math.min(250, p1y + 28);
        if (e.key === "ArrowUp" || e.key === "w") p1y = Math.max(0, p1y - 28);
      }
      document.addEventListener("keydown", keydown);
      draw();
      loop();
      // Limpieza cuando se cierra
      modal.addEventListener(
        "close-game",
        () => {
          playing = false;
          document.removeEventListener("keydown", keydown);
        },
        { once: true }
      );
    },
  },
};

// Abrir modal juego
document.querySelectorAll(".game-card").forEach((card) => {
  card.addEventListener("click", () => {
    const game = card.getAttribute("data-game");
    if (!games[game]) return;
    modal.classList.add("active");
    gameTitle.textContent = games[game].name;
    gameContainer.innerHTML = "";
    games[game].render(gameContainer);
  });
});

// Cerrar modal
closeModalBtn.onclick = () => {
  modal.classList.remove("active");
  gameContainer.innerHTML = "";
  // Evento para que los juegos limpien recursos
  modal.dispatchEvent(new Event("close-game"));
};
window.onclick = function (event) {
  if (event.target == modal) {
    modal.classList.remove("active");
    gameContainer.innerHTML = "";
    modal.dispatchEvent(new Event("close-game"));
  }
};
