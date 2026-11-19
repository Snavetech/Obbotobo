import { quizSections } from "../../data/quizQuestions.js";

export class TwinFlameQuiz {
  constructor(container) {
    this.container = container;
    this.sections = quizSections;
    this.activeSectionId = 1;
    this.currentStep = "select-section"; // "select-section", "p1-turn", "handover", "p2-turn", "results"
    this.currentQuestionIdx = 0;
    this.p1Answers = {}; // { questionId: "A" or "B" }
    this.p2Answers = {}; // { questionId: "A" or "B" }
    this.firstPlayerName = "Abraham";
    this.p1Name = "Abraham";
    this.p2Name = "Sandra";

    this.render();
  }

  getActiveSection() {
    return this.sections.find((s) => s.id === this.activeSectionId) || this.sections[0];
  }

  setFirstPlayer(name) {
    this.firstPlayerName = name;
    if (name === "Sandra") {
      this.p1Name = "Sandra";
      this.p2Name = "Abraham";
    } else {
      this.p1Name = "Abraham";
      this.p2Name = "Sandra";
    }
    this.render();
  }

  render() {
    if (this.currentStep === "select-section") {
      this.renderSectionSelect();
    } else if (this.currentStep === "p1-turn") {
      this.renderQuestionCard(1);
    } else if (this.currentStep === "handover") {
      this.renderHandoverScreen();
    } else if (this.currentStep === "p2-turn") {
      this.renderQuestionCard(2);
    } else if (this.currentStep === "results") {
      this.renderResults();
    }
  }

  renderSectionSelect() {
    this.container.innerHTML = `
      <div class="game-wrapper quiz-game">
        <div class="game-header-bar">
          <div class="game-badge">Compatibility Quiz</div>
          <h3 class="game-headline">This or That: Couple Preferences</h3>
          <p class="game-subtext">50 double-choice questions across 5 chapters. The first partner chooses, passes the device to the second partner, and compares your preferences.</p>
        </div>

        <!-- First Player Selector -->
        <div class="starter-selection-card">
          <div class="starter-label-col">
            <span class="starter-tag">Turn Order</span>
            <span class="starter-heading">Who answers first?</span>
          </div>
          <div class="starter-toggle-pills" role="radiogroup" aria-label="Who answers first">
            <button
              class="starter-pill ${this.firstPlayerName === "Abraham" ? "is-active" : ""}"
              type="button"
              data-starter="Abraham"
              aria-checked="${this.firstPlayerName === "Abraham"}"
            >
              <span class="starter-name">Abraham</span>
              <span class="starter-sub">Goes First</span>
            </button>
            <button
              class="starter-pill ${this.firstPlayerName === "Sandra" ? "is-active" : ""}"
              type="button"
              data-starter="Sandra"
              aria-checked="${this.firstPlayerName === "Sandra"}"
            >
              <span class="starter-name">Sandra</span>
              <span class="starter-sub">Goes First</span>
            </button>
          </div>
        </div>

        <div class="quiz-section-grid">
          ${this.sections
            .map(
              (section) => `
            <div class="section-card ${this.activeSectionId === section.id ? "is-selected" : ""}" data-section-id="${section.id}">
              <div class="section-badge">Chapter 0${section.id} · 10 Questions</div>
              <h4 class="section-title">${section.title}</h4>
              <p class="section-desc">${section.description}</p>
              <div class="section-samples">
                <span>${section.questions[0].optionA} vs ${section.questions[0].optionB}</span>
                <span>${section.questions[1].optionA} vs ${section.questions[1].optionB}</span>
              </div>
              <button class="gold-pill-btn start-section-btn" type="button" data-start-section="${section.id}">
                Start Chapter 0${section.id}
              </button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Handle starter selection
    this.container.querySelectorAll("[data-starter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setFirstPlayer(btn.dataset.starter);
      });
    });

    this.container.querySelectorAll("[data-start-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeSectionId = Number(btn.dataset.startSection);
        this.startSection();
      });
    });
  }

  startSection() {
    this.p1Answers = {};
    this.p2Answers = {};
    this.currentQuestionIdx = 0;
    this.p1Name = this.firstPlayerName;
    this.p2Name = this.firstPlayerName === "Abraham" ? "Sandra" : "Abraham";
    this.currentStep = "p1-turn";
    this.render();
  }

  renderQuestionCard(playerNum) {
    const section = this.getActiveSection();
    const question = section.questions[this.currentQuestionIdx];
    const total = section.questions.length;
    const playerName = playerNum === 1 ? this.p1Name : this.p2Name;
    const otherName = playerNum === 1 ? this.p2Name : this.p1Name;
    const progressPercent = ((this.currentQuestionIdx + 1) / total) * 100;

    this.container.innerHTML = `
      <div class="game-wrapper quiz-game">
        <div class="quiz-card-container">
          <div class="quiz-step-header">
            <span class="quiz-player-tag player-${playerNum}">${playerName}'s Turn (${playerNum}/2)</span>
            <span class="quiz-progress-text">Question ${this.currentQuestionIdx + 1} of ${total}</span>
          </div>

          <div class="quiz-progress-track">
            <div class="quiz-progress-bar" style="width: ${progressPercent}%;"></div>
          </div>

          <p class="quiz-instruction">
            ${
              playerNum === 1
                ? `Select your personal preference.`
                : `Select what you believe ${otherName} chose.`
            }
          </p>

          <div class="double-choice-box">
            <button class="choice-card choice-a" type="button" data-choice="A">
              <span class="choice-letter-badge">A</span>
              <span class="choice-label">${question.optionA}</span>
              <span class="choice-key">Option A</span>
            </button>

            <div class="choice-vs-badge" aria-hidden="true">
              <span>VS</span>
            </div>

            <button class="choice-card choice-b" type="button" data-choice="B">
              <span class="choice-letter-badge">B</span>
              <span class="choice-label">${question.optionB}</span>
              <span class="choice-key">Option B</span>
            </button>
          </div>

          <div class="quiz-bottom-nav">
            <button class="subtle-link-btn" type="button" data-action="cancel-quiz">
              ← Back to Chapters
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelectorAll("[data-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.choice;
        this.handleAnswer(playerNum, question.id, choice);
      });
    });

    this.container.querySelector("[data-action='cancel-quiz']")?.addEventListener("click", () => {
      this.currentStep = "select-section";
      this.render();
    });
  }

  handleAnswer(playerNum, questionId, choice) {
    const section = this.getActiveSection();
    if (playerNum === 1) {
      this.p1Answers[questionId] = choice;
      if (this.currentQuestionIdx < section.questions.length - 1) {
        this.currentQuestionIdx += 1;
        this.render();
      } else {
        // Player 1 finished, show handover
        this.currentStep = "handover";
        this.currentQuestionIdx = 0;
        this.render();
      }
    } else {
      this.p2Answers[questionId] = choice;
      if (this.currentQuestionIdx < section.questions.length - 1) {
        this.currentQuestionIdx += 1;
        this.render();
      } else {
        // Player 2 finished, show results!
        this.currentStep = "results";
        this.render();
      }
    }
  }

  renderHandoverScreen() {
    this.container.innerHTML = `
      <div class="game-wrapper quiz-game">
        <div class="quiz-card-container handover-card">
          <div class="handover-monogram">A · S</div>
          <h3 class="handover-title">Turn Complete: ${this.p1Name}</h3>
          <p class="handover-subtitle">Pass the device to <strong>${this.p2Name}</strong> to record their responses.</p>
          <div class="handover-divider"></div>
          <p class="handover-prompt">Ready, ${this.p2Name}?</p>
          <button class="gold-pill-btn handover-ready-btn" type="button" data-action="p2-ready">
            Continue as ${this.p2Name}
          </button>
        </div>
      </div>
    `;

    this.container.querySelector("[data-action='p2-ready']")?.addEventListener("click", () => {
      this.currentStep = "p2-turn";
      this.currentQuestionIdx = 0;
      this.render();
    });
  }

  renderResults() {
    const section = this.getActiveSection();
    let matches = 0;
    const total = section.questions.length;

    const breakdown = section.questions.map((q) => {
      const a1 = this.p1Answers[q.id];
      const a2 = this.p2Answers[q.id];
      const isMatch = a1 === a2;
      if (isMatch) matches += 1;
      return {
        question: q,
        p1Choice: a1,
        p2Choice: a2,
        p1ChoiceText: a1 === "A" ? q.optionA : q.optionB,
        p2ChoiceText: a2 === "A" ? q.optionA : q.optionB,
        isMatch,
      };
    });

    const scorePercent = Math.round((matches / total) * 100);

    let verdictTitle = "Exceptional Alignment";
    let verdictSubtitle = "Intuitive understanding and synchronized tastes across life.";
    if (scorePercent < 50) {
      verdictTitle = "Complementary Contrasts";
      verdictSubtitle = "Distinct preferences that bring variety and balance to partnership.";
    } else if (scorePercent < 75) {
      verdictTitle = "Balanced Perspectives";
      verdictSubtitle = "A harmonious mix of shared values and individual tastes.";
    } else if (scorePercent < 90) {
      verdictTitle = "Strong Mutual Alignment";
      verdictSubtitle = "Deep understanding and shared instincts developed over a decade.";
    }

    this.container.innerHTML = `
      <div class="game-wrapper quiz-game">
        <div class="quiz-results-card">
          <div class="results-score-circle">
            <span class="score-percent">${scorePercent}%</span>
            <span class="score-label">Alignment</span>
          </div>

          <h3 class="results-verdict-title">${verdictTitle}</h3>
          <p class="results-verdict-sub">${verdictSubtitle}</p>
          <div class="results-stat-bar">
            <span>Matched: <strong>${matches} of ${total}</strong></span>
            <span>Category: <strong>0${section.id} · ${section.title}</strong></span>
          </div>

          <div class="results-breakdown-list">
            <h4 class="breakdown-headline">Response Comparison</h4>
            ${breakdown
              .map(
                (item, idx) => `
              <div class="breakdown-row ${item.isMatch ? "is-match" : "is-mismatch"}">
                <div class="breakdown-qnum">0${idx + 1}</div>
                <div class="breakdown-body">
                  <div class="breakdown-question">${item.question.optionA} vs ${item.question.optionB}</div>
                  <div class="breakdown-picks">
                    <span class="pick-item"><strong>${this.p1Name}:</strong> ${item.p1ChoiceText}</span>
                    <span class="pick-item"><strong>${this.p2Name}:</strong> ${item.p2ChoiceText}</span>
                  </div>
                </div>
                <div class="breakdown-badge">
                  ${item.isMatch ? `<span class="badge-match">Match</span>` : `<span class="badge-diff">Different</span>`}
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="results-actions">
            ${
              this.activeSectionId < this.sections.length
                ? `
              <button class="gold-pill-btn next-chapter-btn" type="button" data-action="next-chapter">
                Continue to Chapter 0${this.activeSectionId + 1}
              </button>
            `
                : ""
            }
            <button class="gold-ghost-btn retry-chapter-btn" type="button" data-action="retry-chapter">
              Replay Chapter 0${this.activeSectionId}
            </button>
            <button class="subtle-link-btn" type="button" data-action="all-chapters">
              Choose Another Chapter
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector("[data-action='next-chapter']")?.addEventListener("click", () => {
      this.activeSectionId += 1;
      this.startSection();
    });

    this.container.querySelector("[data-action='retry-chapter']")?.addEventListener("click", () => {
      this.startSection();
    });

    this.container.querySelector("[data-action='all-chapters']")?.addEventListener("click", () => {
      this.currentStep = "select-section";
      this.render();
    });
  }

  dispose() {
    this.container.innerHTML = "";
  }
}
