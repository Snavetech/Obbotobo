import { TicTacToe } from "./TicTacToe.js";
import { TwinFlameQuiz } from "./TwinFlameQuiz.js";
import { SpeedMath } from "./SpeedMath.js";

export class GamesHub {
  constructor(root, photos, { onNavigate = () => {} } = {}) {
    this.root = root;
    this.photos = photos;
    this.onNavigate = onNavigate;
    this.activeGame = "quiz"; // "quiz", "tictactoe", "math"
    this.currentGameInstance = null;

    this.render();
  }

  render() {
    this.root.innerHTML = `
      <div class="games-hub-container">
        <!-- Games Directory / Prominent List -->
        <header class="games-directory-panel">
          <div class="games-directory-top-bar">
            <div class="games-brand">
              <span class="games-ornament">◆</span>
              <span class="games-nav-title">Anniversary Games</span>
            </div>
            <button class="text-button games-back-btn" type="button" data-action="back-wishes">
              <span>← Back to Wishes</span>
            </button>
          </div>

          <div class="games-list-cards" role="tablist" aria-label="Available Anniversary Games">
            <button
              class="game-list-card ${this.activeGame === "quiz" ? "is-active" : ""}"
              type="button"
              data-game="quiz"
              role="tab"
              aria-selected="${this.activeGame === "quiz"}"
            >
              <div class="card-num-badge">01 · Couple Preferences</div>
              <h3 class="card-game-title">This or That</h3>
              <p class="card-game-desc">50 double-choice questions to compare preferences across 5 chapters.</p>
              <div class="card-status-row">
                <span class="status-indicator-dot"></span>
                <span class="status-indicator-text">${this.activeGame === "quiz" ? "Now Playing" : "Select Game"}</span>
              </div>
            </button>

            <button
              class="game-list-card ${this.activeGame === "tictactoe" ? "is-active" : ""}"
              type="button"
              data-game="tictactoe"
              role="tab"
              aria-selected="${this.activeGame === "tictactoe"}"
            >
              <div class="card-num-badge">02 · Classic Match</div>
              <h3 class="card-game-title">Tic-Tac-Toe</h3>
              <p class="card-game-desc">Abraham (A) vs Sandra (S). Pass and play or play against the AI.</p>
              <div class="card-status-row">
                <span class="status-indicator-dot"></span>
                <span class="status-indicator-text">${this.activeGame === "tictactoe" ? "Now Playing" : "Select Game"}</span>
              </div>
            </button>

            <button
              class="game-list-card ${this.activeGame === "math" ? "is-active" : ""}"
              type="button"
              data-game="math"
              role="tab"
              aria-selected="${this.activeGame === "math"}"
            >
              <div class="card-num-badge">03 · Mental Arithmetic</div>
              <h3 class="card-game-title">Speed Math</h3>
              <p class="card-game-desc">Rapid mental arithmetic. True or false equations in blitz or strike modes.</p>
              <div class="card-status-row">
                <span class="status-indicator-dot"></span>
                <span class="status-indicator-text">${this.activeGame === "math" ? "Now Playing" : "Select Game"}</span>
              </div>
            </button>
          </div>
        </header>

        <!-- Dynamic Game Arena -->
        <main class="game-arena-slot" aria-live="polite"></main>
      </div>
    `;

    this.attachEvents();
    this.mountGame(this.activeGame);
  }

  attachEvents() {
    this.root.querySelectorAll(".game-list-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        const gameKey = btn.dataset.game;
        if (gameKey === this.activeGame) return;
        this.activeGame = gameKey;

        this.root.querySelectorAll(".game-list-card").forEach((b) => {
          const isActive = b.dataset.game === gameKey;
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-selected", String(isActive));
          const textEl = b.querySelector(".status-indicator-text");
          if (textEl) {
            textEl.textContent = isActive ? "Now Playing" : "Select Game";
          }
        });

        this.mountGame(gameKey);
      });
    });

    this.root.querySelector("[data-action='back-wishes']")?.addEventListener("click", () => {
      this.onNavigate("to-wishes");
    });
  }

  mountGame(gameKey) {
    if (this.currentGameInstance?.dispose) {
      this.currentGameInstance.dispose();
      this.currentGameInstance = null;
    }

    const slot = this.root.querySelector(".game-arena-slot");
    if (!slot) return;
    slot.innerHTML = "";

    switch (gameKey) {
      case "quiz":
        this.currentGameInstance = new TwinFlameQuiz(slot);
        break;
      case "tictactoe":
        this.currentGameInstance = new TicTacToe(slot);
        break;
      case "math":
        this.currentGameInstance = new SpeedMath(slot);
        break;
      default:
        this.currentGameInstance = new TwinFlameQuiz(slot);
    }
  }

  dispose() {
    if (this.currentGameInstance?.dispose) {
      this.currentGameInstance.dispose();
      this.currentGameInstance = null;
    }
    this.root.innerHTML = "";
  }
}
