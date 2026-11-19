export class SpeedMath {
  constructor(container) {
    this.container = container;
    this.mode = "time"; // "time" (60s blitz) or "lives" (3 hearts)
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.timeLeft = 60;
    this.lives = 3;
    this.totalAnswered = 0;
    this.correctCount = 0;
    this.timerInterval = null;
    this.isPlaying = false;
    this.isGameOver = false;
    this.currentEquation = null;
    this.highScore = Number(localStorage.getItem("anniversary_math_highscore") || 0);

    this.render();
  }

  generateEquation() {
    const ops = ["+", "-", "×", "÷"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, correctAns, displayAns;

    if (op === "+") {
      a = Math.floor(Math.random() * 45) + 5;
      b = Math.floor(Math.random() * 45) + 5;
      correctAns = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * 70) + 20;
      b = Math.floor(Math.random() * (a - 5)) + 5;
      correctAns = a - b;
    } else if (op === "×") {
      a = Math.floor(Math.random() * 11) + 2;
      b = Math.floor(Math.random() * 11) + 2;
      correctAns = a * b;
    } else {
      // Division
      b = Math.floor(Math.random() * 9) + 2;
      correctAns = Math.floor(Math.random() * 10) + 2;
      a = b * correctAns;
    }

    // 50% chance of being true, 50% chance of being false
    const isActuallyTrue = Math.random() < 0.5;

    if (isActuallyTrue) {
      displayAns = correctAns;
    } else {
      // Introduce believable small delta (-3 to +3, excluding 0)
      const deltas = [-3, -2, -1, 1, 2, 3, 10, -10];
      const delta = deltas[Math.floor(Math.random() * deltas.length)];
      displayAns = Math.max(0, correctAns + delta);
      if (displayAns === correctAns) displayAns += 1;
    }

    return {
      text: `${a} ${op} ${b} = ${displayAns}`,
      isTrue: isActuallyTrue,
      correctResult: correctAns,
    };
  }

  startGame(mode = "time") {
    this.mode = mode;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.totalAnswered = 0;
    this.correctCount = 0;
    this.timeLeft = 60;
    this.lives = 3;
    this.isPlaying = true;
    this.isGameOver = false;
    this.currentEquation = this.generateEquation();

    this.stopTimer();
    if (this.mode === "time") {
      this.timerInterval = window.setInterval(() => {
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) {
          this.endGame();
        } else {
          this.updateHUD();
        }
      }, 1000);
    }

    this.render();
  }

  stopTimer() {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  endGame() {
    this.stopTimer();
    this.isPlaying = false;
    this.isGameOver = true;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("anniversary_math_highscore", String(this.highScore));
    }

    this.render();
  }

  handleAnswer(userGuess) {
    if (!this.isPlaying || !this.currentEquation) return;

    this.totalAnswered += 1;
    const isCorrect = userGuess === this.currentEquation.isTrue;

    if (isCorrect) {
      this.correctCount += 1;
      this.streak += 1;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Streak multiplier bonus
      const multiplier = this.streak >= 10 ? 3 : this.streak >= 5 ? 2 : 1;
      this.score += 10 * multiplier;
      this.flashFeedback(true);
    } else {
      this.streak = 0;
      this.flashFeedback(false);
      if (this.mode === "lives") {
        this.lives -= 1;
        if (this.lives <= 0) {
          this.endGame();
          return;
        }
      }
    }

    this.currentEquation = this.generateEquation();
    this.render();
  }

  flashFeedback(isCorrect) {
    const card = this.container.querySelector(".equation-card");
    if (!card) return;
    card.classList.add(isCorrect ? "flash-correct" : "flash-wrong");
    setTimeout(() => {
      card?.classList.remove("flash-correct", "flash-wrong");
    }, 280);
  }

  render() {
    if (!this.isPlaying && !this.isGameOver) {
      this.renderStartScreen();
      return;
    }

    if (this.isGameOver) {
      this.renderGameOverScreen();
      return;
    }

    this.renderActiveGame();
  }

  renderStartScreen() {
    this.container.innerHTML = `
      <div class="game-wrapper math-game">
        <div class="game-header-bar">
          <div class="game-badge">Mental Arithmetic</div>
          <h3 class="game-headline">Speed Math</h3>
          <p class="game-subtext">Determine whether each equation is True or False.</p>
        </div>

        <div class="math-start-card">
          <div class="math-icon-badge">+ − × ÷</div>
          <div class="math-high-score">High Score: <strong>${this.highScore}</strong></div>

          <div class="math-mode-cards">
            <button class="math-mode-btn" type="button" data-start-mode="time">
              <span class="mode-name">60-Second Blitz</span>
              <span class="mode-desc">Answer as many equations as you can within 60 seconds.</span>
            </button>
            <button class="math-mode-btn" type="button" data-start-mode="lives">
              <span class="mode-name">3-Strike Challenge</span>
              <span class="mode-desc">Keep your streak going. The round ends after 3 incorrect answers.</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelectorAll("[data-start-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.startGame(btn.dataset.startMode);
      });
    });
  }

  renderActiveGame() {
    const multiplier = this.streak >= 10 ? 3 : this.streak >= 5 ? 2 : 1;

    this.container.innerHTML = `
      <div class="game-wrapper math-game">
        <div class="math-hud">
          <div class="hud-item">
            <span class="hud-label">Score</span>
            <span class="hud-val score-val">${this.score}</span>
          </div>

          ${
            this.mode === "time"
              ? `
            <div class="hud-item timer-item ${this.timeLeft <= 10 ? "is-urgent" : ""}">
              <span class="hud-label">Time</span>
              <span class="hud-val timer-val">${this.timeLeft}s</span>
            </div>
          `
              : `
            <div class="hud-item lives-item">
              <span class="hud-label">Strikes</span>
              <span class="hud-val lives-val">${Array.from({ length: 3 }, (_, i) => `<span class="life-pip ${i < this.lives ? "is-alive" : "is-lost"}"></span>`).join("")}</span>
            </div>
          `
          }

          <div class="hud-item streak-item ${this.streak >= 5 ? "has-streak" : ""}">
            <span class="hud-label">Streak</span>
            <span class="hud-val streak-val">${this.streak > 0 ? `${this.streak} (×${multiplier})` : "0"}</span>
          </div>
        </div>

        <div class="math-arena">
          <div class="equation-card">
            <div class="equation-text">${this.currentEquation?.text || "..."}</div>
          </div>

          <div class="math-actions-row">
            <button class="math-choice-btn btn-true" type="button" data-guess="true">
              <span class="math-btn-icon">✓</span>
              <span class="math-btn-text">TRUE</span>
              <span class="math-btn-shortcut">[Left Arrow]</span>
            </button>

            <button class="math-choice-btn btn-false" type="button" data-guess="false">
              <span class="math-btn-icon">✕</span>
              <span class="math-btn-text">FALSE</span>
              <span class="math-btn-shortcut">[Right Arrow]</span>
            </button>
          </div>

          <div class="math-bottom-bar">
            <button class="subtle-link-btn" type="button" data-action="exit-math">
              ← Quit Game
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachActiveGameEvents();
  }

  attachActiveGameEvents() {
    this.container.querySelector("[data-guess='true']")?.addEventListener("click", () => {
      this.handleAnswer(true);
    });

    this.container.querySelector("[data-guess='false']")?.addEventListener("click", () => {
      this.handleAnswer(false);
    });

    this.container.querySelector("[data-action='exit-math']")?.addEventListener("click", () => {
      this.stopTimer();
      this.isPlaying = false;
      this.isGameOver = false;
      this.render();
    });

    // Keyboard support
    this.keyHandler = (e) => {
      if (!this.isPlaying) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "t") {
        this.handleAnswer(true);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "f") {
        this.handleAnswer(false);
      }
    };
    window.removeEventListener("keydown", this.keyHandler);
    window.addEventListener("keydown", this.keyHandler);
  }

  updateHUD() {
    const timerVal = this.container.querySelector(".timer-val");
    if (timerVal) timerVal.textContent = `${this.timeLeft}s`;
    const scoreVal = this.container.querySelector(".score-val");
    if (scoreVal) scoreVal.textContent = String(this.score);
  }

  renderGameOverScreen() {
    const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 0;
    const isNewHigh = this.score >= this.highScore && this.score > 0;

    this.container.innerHTML = `
      <div class="game-wrapper math-game">
        <div class="math-gameover-card">
          ${isNewHigh ? `<div class="highscore-badge">Personal Best</div>` : ""}
          <div class="gameover-monogram">A · S</div>
          <h3 class="gameover-title">Round Complete</h3>
          <p class="gameover-sub">Results for this session:</p>

          <div class="gameover-score-hero">
            <span class="hero-score">${this.score}</span>
            <span class="hero-label">Points Scored</span>
          </div>

          <div class="gameover-stats-grid">
            <div class="stat-box">
              <span class="stat-number">${this.correctCount} / ${this.totalAnswered}</span>
              <span class="stat-name">Correct Answers</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">${accuracy}%</span>
              <span class="stat-name">Accuracy</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">${this.maxStreak}</span>
              <span class="stat-name">Max Streak</span>
            </div>
          </div>

          <div class="gameover-actions">
            <button class="gold-pill-btn" type="button" data-action="play-again">
              Play Again
            </button>
            <button class="gold-ghost-btn" type="button" data-action="change-mode">
              Switch Mode
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector("[data-action='play-again']")?.addEventListener("click", () => {
      this.startGame(this.mode);
    });

    this.container.querySelector("[data-action='change-mode']")?.addEventListener("click", () => {
      this.isPlaying = false;
      this.isGameOver = false;
      this.render();
    });
  }

  dispose() {
    this.stopTimer();
    if (this.keyHandler) {
      window.removeEventListener("keydown", this.keyHandler);
    }
    this.container.innerHTML = "";
  }
}
