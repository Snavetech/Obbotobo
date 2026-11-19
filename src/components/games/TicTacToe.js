export class TicTacToe {
  constructor(container) {
    this.container = container;
    this.board = Array(9).fill(null);
    this.firstPlayer = "A"; // "A" for Abraham, "S" for Sandra
    this.currentPlayer = "A";
    this.mode = "pass"; // "pass" or "ai"
    this.scores = { A: 0, S: 0, ties: 0 };
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper tictactoe-game">
        <div class="game-header-bar">
          <div class="game-badge">Classic Match</div>
          <h3 class="game-headline">Abraham & Sandra Tic-Tac-Toe</h3>
          <p class="game-subtext">Take turns placing your marks. Abraham plays as A, Sandra plays as S.</p>
        </div>

        <div class="game-controls-top">
          <!-- Game Mode Toggle -->
          <div class="control-segmented-group">
            <span class="control-group-label">Mode:</span>
            <div class="mode-selector" role="radiogroup" aria-label="Game Mode">
              <button class="mode-pill ${this.mode === "pass" ? "is-active" : ""}" type="button" data-mode="pass">
                2 Players (Pass & Play)
              </button>
              <button class="mode-pill ${this.mode === "ai" ? "is-active" : ""}" type="button" data-mode="ai">
                Play vs AI
              </button>
            </div>
          </div>

          <!-- Who Goes First Toggle -->
          <div class="control-segmented-group">
            <span class="control-group-label">Who goes first:</span>
            <div class="mode-selector" role="radiogroup" aria-label="First Move">
              <button class="mode-pill ${this.firstPlayer === "A" ? "is-active" : ""}" type="button" data-first-turn="A">
                Abraham (A)
              </button>
              <button class="mode-pill ${this.firstPlayer === "S" ? "is-active" : ""}" type="button" data-first-turn="S">
                Sandra (S)
              </button>
            </div>
          </div>
        </div>

        <div class="score-row">
          <div class="score-card player-a ${this.currentPlayer === "A" && !this.isGameOver ? "is-active" : ""}">
            <span class="score-avatar">A</span>
            <span class="score-name">Abraham</span>
            <span class="score-count">${this.scores.A}</span>
          </div>
          <div class="score-card tie-card">
            <span class="score-avatar">◆</span>
            <span class="score-name">Ties</span>
            <span class="score-count">${this.scores.ties}</span>
          </div>
          <div class="score-card player-s ${this.currentPlayer === "S" && !this.isGameOver ? "is-active" : ""}">
            <span class="score-avatar">S</span>
            <span class="score-name">Sandra</span>
            <span class="score-count">${this.scores.S}</span>
          </div>
        </div>

        <div class="turn-indicator" aria-live="polite">
          ${this.getTurnMessage()}
        </div>

        <div class="ttt-board" role="grid" aria-label="Tic Tac Toe Grid">
          ${this.board
            .map(
              (cell, index) => `
              <button
                class="ttt-cell ${cell ? `filled mark-${cell.toLowerCase()}` : ""} ${this.winningLine?.includes(index) ? "is-winner" : ""}"
                type="button"
                data-cell="${index}"
                aria-label="Cell ${index + 1}, ${cell ? `filled with ${cell}` : "empty"}"
                ${cell || this.isGameOver ? "disabled" : ""}
              >
                <span>${cell || ""}</span>
              </button>
            `
            )
            .join("")}
        </div>

        <div class="game-actions-footer">
          <button class="gold-ghost-button" type="button" data-action="reset-board">
            <span>Play Again</span>
          </button>
          <button class="subtle-link-button" type="button" data-action="reset-scores">
            Reset Scores
          </button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  getTurnMessage() {
    if (this.isGameOver) {
      if (this.winner === "tie") return `<span class="turn-highlight">Round tied.</span>`;
      const winnerName = this.winner === "A" ? "Abraham" : "Sandra";
      return `<span class="turn-highlight winner-glow">${winnerName} wins the round.</span>`;
    }
    const name = this.currentPlayer === "A" ? "Abraham" : "Sandra";
    const mark = this.currentPlayer;
    return `<span>Turn: <strong>${name}</strong> (${mark})</span>`;
  }

  attachEvents() {
    this.container.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.mode = btn.dataset.mode;
        this.resetBoard();
      });
    });

    this.container.querySelectorAll("[data-first-turn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.firstPlayer = btn.dataset.firstTurn;
        this.resetBoard();
      });
    });

    this.container.querySelectorAll(".ttt-cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        const index = Number(cell.dataset.cell);
        this.makeMove(index);
      });
    });

    this.container.querySelector("[data-action='reset-board']")?.addEventListener("click", () => {
      this.resetBoard();
    });

    this.container.querySelector("[data-action='reset-scores']")?.addEventListener("click", () => {
      this.scores = { A: 0, S: 0, ties: 0 };
      this.resetBoard();
    });
  }

  makeMove(index) {
    if (this.board[index] || this.isGameOver) return;

    this.board[index] = this.currentPlayer;
    const result = this.checkWin(this.board);

    if (result) {
      this.isGameOver = true;
      this.winner = result.winner;
      this.winningLine = result.line;
      if (result.winner === "tie") {
        this.scores.ties += 1;
      } else {
        this.scores[result.winner] += 1;
      }
      this.render();
      return;
    }

    this.currentPlayer = this.currentPlayer === "A" ? "S" : "A";
    this.render();

    // AI Turn (AI plays as Sandra 'S' when mode is 'ai')
    if (this.mode === "ai" && this.currentPlayer === "S" && !this.isGameOver) {
      setTimeout(() => {
        this.makeAIMove();
      }, 350);
    }
  }

  makeAIMove() {
    if (this.isGameOver) return;

    // 1. Check if AI can win
    for (let i = 0; i < 9; i++) {
      if (!this.board[i]) {
        this.board[i] = "S";
        if (this.checkWin(this.board)?.winner === "S") {
          this.board[i] = null;
          this.makeMove(i);
          return;
        }
        this.board[i] = null;
      }
    }

    // 2. Block player if they can win
    for (let i = 0; i < 9; i++) {
      if (!this.board[i]) {
        this.board[i] = "A";
        if (this.checkWin(this.board)?.winner === "A") {
          this.board[i] = null;
          this.makeMove(i);
          return;
        }
        this.board[i] = null;
      }
    }

    // 3. Take center
    if (!this.board[4]) {
      this.makeMove(4);
      return;
    }

    // 4. Take corners
    const corners = [0, 2, 6, 8].filter((i) => !this.board[i]);
    if (corners.length > 0) {
      const pick = corners[Math.floor(Math.random() * corners.length)];
      this.makeMove(pick);
      return;
    }

    // 5. Take any open cell
    const open = this.board.map((val, i) => (val === null ? i : null)).filter((v) => v !== null);
    if (open.length > 0) {
      const pick = open[Math.floor(Math.random() * open.length)];
      this.makeMove(pick);
    }
  }

  checkWin(board) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }

    if (board.every((cell) => cell !== null)) {
      return { winner: "tie", line: [] };
    }

    return null;
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = this.firstPlayer;
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    this.render();

    if (this.mode === "ai" && this.currentPlayer === "S") {
      setTimeout(() => {
        this.makeAIMove();
      }, 350);
    }
  }

  dispose() {
    this.container.innerHTML = "";
  }
}
