import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  MailOpen,
  Puzzle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  createIcons,
} from "lucide";
import { gsap } from "gsap";
import { anniversaryContent as content } from "./data/content.js";
import { SceneManager } from "./three/SceneManager.js";
import { getViewportMode } from "./three/world.js";
import { Navigation } from "./components/Navigation.js";
import { MusicPlayer } from "./components/MusicPlayer.js";
import { PhotoViewer } from "./components/PhotoViewer.js";
import { GamesHub } from "./components/games/GamesHub.js";
import {
  activateSceneLayer,
  fadeLoader,
  hideLetterPanel,
  revealLetterPanel,
} from "./animations/transitions.js";
import { revealClosing } from "./animations/cinematic.js";
import "./styles/main.css";
import "./styles/gallery.css";
import "./styles/games.css";
import "./styles/responsive.css";

const app = document.querySelector("#app");
const canvas = document.querySelector("#memory-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const viewportMode = getViewportMode();
const lowPower =
  viewportMode !== "desktop" ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4);

const coupleNames = `${content.coupleNames.firstPerson} & ${content.coupleNames.secondPerson}`;
const letterParagraphs = content.letter.message
  .map((paragraph) => `<p>${paragraph}</p>`)
  .join("");
app.innerHTML = `
  <div class="screen-texture" aria-hidden="true"></div>

  <div class="loader" role="status" aria-live="polite">
    <div class="loader-mark" aria-hidden="true"><span>${content.monogram}</span></div>
    <p class="loader-eyebrow">${content.opening.eyebrow}</p>
    <div class="loader-track"><span class="loader-progress"></span></div>
    <p class="loader-status">Celebrating Ten Years of Love</p>
  </div>

  <header class="experience-header" aria-label="Experience controls" inert>
    <div class="brand-lockup">
      <span class="brand-monogram">A & S</span>
      <span class="brand-divider" aria-hidden="true">◆</span>
      <span class="brand-title">10 Years of Love</span>
    </div>
    <nav class="header-nav" aria-label="Experience sections">
      <button class="nav-tab is-active" type="button" data-action="nav-gallery">GALLERY</button>
      <button class="nav-tab" type="button" data-action="nav-story">STORY</button>
      <button class="nav-tab" type="button" data-action="nav-wishes">WISHES</button>
      <button class="nav-tab" type="button" data-action="nav-games">GAMES</button>
    </nav>
    <div class="header-actions">
      <button class="back-button" type="button" data-action="back" hidden>
        <i data-lucide="arrow-left" aria-hidden="true"></i>
        <span>Envelope</span>
      </button>
      <button
        class="icon-button music-button"
        type="button"
        aria-label="Play background music"
        aria-pressed="false"
      >
        <i class="music-icon icon-sound" data-lucide="volume-2" aria-hidden="true"></i>
        <i class="music-icon icon-muted" data-lucide="volume-x" aria-hidden="true"></i>
        <span class="music-pulse" aria-hidden="true"></span>
      </button>
    </div>
  </header>

  <div class="scene-stack">
    <section class="scene-layer scene-entrance is-active" aria-labelledby="entrance-title">
      <div
        class="screen-envelope"
        role="button"
        tabindex="0"
        data-action="enter"
        aria-label="Anniversary envelope: Tap to open and reveal Abraham and Sandra's 10th anniversary"
      >
        <div class="envelope-ambient" aria-hidden="true"></div>

        <!-- The Letter Card inside (matching Image 1), revealed as the flap opens -->
        <div class="envelope-card" aria-hidden="true">
          <div class="envelope-card-border"></div>
          <div class="envelope-card-content">
            <div class="card-monogram-circle">
              <span>A · S</span>
            </div>
            <p class="card-eyebrow">${content.opening.eyebrow}</p>
            <h1 class="card-names-script">Abraham & Sandra</h1>
            <div class="gold-diamond-divider" aria-hidden="true"><span>◆</span></div>
            <p class="card-date-line">${content.anniversary.date}</p>
            <p class="card-gift-subtitle">${content.opening.subtitle}</p>
            <button class="card-gift-button" type="button" data-action="enter-gallery">
              <span>${content.opening.button}</span>
            </button>
            <p class="card-gift-footnote">${content.opening.tagline}</p>
          </div>
        </div>

        <div class="envelope-pocket-bg" aria-hidden="true"></div>

        <div class="envelope-flaps" aria-hidden="true">
          <div class="envelope-side-flap envelope-side-left">
            <div class="flap-grain"></div>
          </div>
          <div class="envelope-side-flap envelope-side-right">
            <div class="flap-grain"></div>
          </div>

          <div class="envelope-bottom-flap">
            <div class="flap-grain"></div>
            <div class="envelope-face-address">
              <div class="envelope-stamp">
                <div class="stamp-inner">
                  <span class="stamp-number">A · S</span>
                  <span class="stamp-label">10 YEARS</span>
                </div>
              </div>
              <div class="envelope-address-card">
                <p class="envelope-address-prefix">For</p>
                <h1 id="entrance-title" class="envelope-address-names">Abraham & Sandra</h1>
                <p class="envelope-address-sub">Celebrating Ten Years of Love</p>
              </div>
            </div>
          </div>

          <div class="envelope-top-flap">
            <div class="top-flap-outer">
              <div class="flap-grain"></div>
            </div>
            <div class="top-flap-inner"></div>
          </div>
        </div>

        <div class="envelope-screen-frame" aria-hidden="true">
          <span class="frame-corner frame-tl"></span>
          <span class="frame-corner frame-tr"></span>
          <span class="frame-corner frame-bl"></span>
          <span class="frame-corner frame-br"></span>
        </div>

        <!-- Center Wax Seal & Interactive Tap Prompt -->
        <div class="envelope-seal-container">
          <div class="envelope-seal" role="button" tabindex="0" data-action="enter" aria-label="Open anniversary envelope">
            <div class="seal-halo"></div>
            <div class="seal-body">
              <div class="seal-ridges"></div>
              <div class="seal-core">
                <span class="seal-monogram">A·S</span>
                <span class="seal-numeral">X</span>
              </div>
            </div>
          </div>
          <div class="seal-callout">
            <span class="seal-tap-prompt">TAP TO OPEN</span>
          </div>
        </div>

        <div class="envelope-sparks" aria-hidden="true"></div>
      </div>
    </section>

    <section class="scene-layer scene-gallery" aria-label="Photo Memories Gallery" aria-hidden="true">
      <div
        class="gallery-start-instruction glass-panel"
        role="button"
        tabindex="0"
        data-action="open-photo"
        data-photo-index="0"
        aria-label="Click the first image to begin: 01 The Beginning"
      >
        <span class="instruction-pulse-dot" aria-hidden="true"></span>
        <i data-lucide="arrow-up-left" class="instruction-arrow" aria-hidden="true"></i>
        <span class="instruction-text">
          <span class="instruction-action-click">Click</span>
          <span class="instruction-action-tap">Tap</span>
          the first image to begin
        </span>
        <span class="instruction-divider" aria-hidden="true">◆</span>
        <span class="instruction-tag">01 · The Beginning</span>
      </div>

      <nav class="memory-shortcuts glass-panel" aria-label="Open a memory by number">
        <span class="visually-hidden">Choose a photograph</span>
        ${content.photos
          .map(
            (photo, index) => `
              <button
                type="button"
                data-action="open-photo"
                data-photo-index="${index}"
                class="${index === 0 ? "memory-btn-first" : ""}"
                aria-label="Memory ${index + 1}: ${photo.title}"
              >${String(index + 1).padStart(2, "0")}</button>
            `,
          )
          .join("")}
      </nav>
      <button class="text-button scene-continue gallery-next" type="button" data-action="to-letter">
        <span>Story & Letter</span>
        <i data-lucide="arrow-right" aria-hidden="true"></i>
      </button>
    </section>

    <section class="scene-layer scene-letter" aria-labelledby="story-card-heading" aria-hidden="true">
      <div class="story-scroll-container">
        <!-- The Keepsake Letter Card (Addressed to Abraham & Sandra from me) -->
        <article class="letter-card" role="article" aria-label="Anniversary Letter">
          <div class="letter-card-border" aria-hidden="true"></div>
          <div class="letter-ornament" aria-hidden="true">A · S</div>
          <p class="letter-salutation">Celebrating Abraham & Sandra · 10th Anniversary</p>
          <h2 id="story-card-heading" class="letter-card-heading">${content.letter.heading}</h2>
          <div class="letter-body">${letterParagraphs}</div>
          <p class="letter-closing-sign">${content.closing.signature}</p>

          <div class="letter-card-actions">
            <button class="primary-button to-wishes-btn" type="button" data-action="to-wishes">
              <span>Continue</span>
              <i data-lucide="arrow-right" aria-hidden="true"></i>
            </button>
            <button class="text-button back-to-gallery-btn" type="button" data-action="to-gallery">
              <i data-lucide="arrow-left" aria-hidden="true"></i>
              <span>Back to Gallery</span>
            </button>
          </div>
        </article>

        <!-- Milestone Banner & Stats (Below the Letter) -->
        <div class="milestone-banner">
          <div class="milestone-divider" aria-hidden="true">
            <span class="divider-line"></span>
            <span class="divider-diamond">◆</span>
            <span class="divider-line"></span>
          </div>
          <p id="story-scripture" class="scripture-quote">
            “${content.quote.text}”
          </p>
          <div class="milestone-stats">
            ${content.stats
              .map(
                (stat) => `
                  <div class="stat-item">
                    <span class="stat-number">${stat.value}</span>
                    <span class="stat-label">${stat.label}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
          <p class="stats-caption">${content.statsCaption}</p>

          <div class="story-footer-actions">
            <button class="primary-button to-wishes-btn" type="button" data-action="to-wishes">
              <span>Continue</span>
              <i data-lucide="arrow-right" aria-hidden="true"></i>
            </button>
            <button class="text-button back-to-gallery-btn" type="button" data-action="to-gallery">
              <i data-lucide="arrow-left" aria-hidden="true"></i>
              <span>Back to Gallery</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="scene-layer scene-closing" aria-labelledby="closing-title" aria-hidden="true">
      <div class="closing-copy">
        <p class="eyebrow" data-closing-reveal>A Decade of Love</p>
        <h2 id="closing-title" data-closing-reveal>${content.closing.heading}</h2>
        <p class="closing-message" data-closing-reveal>${content.closing.message}</p>
        <div class="closing-rule" data-closing-reveal aria-hidden="true"></div>
        <p class="closing-celebration" data-closing-reveal>${content.closing.celebration}</p>
        <p class="couple-names" data-closing-reveal>Abraham & Sandra</p>
        <p class="anniversary-date" data-closing-reveal>${content.anniversary.date}</p>
        <p class="closing-signature" data-closing-reveal>${content.closing.signature}</p>
        <div class="closing-actions" data-closing-reveal>
          <button class="primary-button play-games-btn" type="button" data-action="to-games">
            <i data-lucide="gamepad-2" aria-hidden="true"></i>
            <span>Play Anniversary Games</span>
          </button>
          <button class="text-button replay-button" type="button" data-action="replay">
            <i data-lucide="rotate-ccw" aria-hidden="true"></i>
            <span>Return to the gallery</span>
          </button>
        </div>
      </div>
    </section>

    <section class="scene-layer scene-games" aria-label="Anniversary Games" aria-hidden="true">
      <div class="games-mount-slot"></div>
    </section>
  </div>

  <div class="photo-viewer" role="dialog" aria-modal="true" aria-label="Selected photograph" aria-hidden="true" tabindex="-1" inert>
    <div class="viewer-shade" aria-hidden="true"></div>
    <button class="icon-button viewer-close" type="button" data-viewer-close aria-label="Close photograph">
      <i data-lucide="x" aria-hidden="true"></i>
    </button>
    <div class="viewer-info glass-panel">
      <h2 class="viewer-title"></h2>
    </div>
    <div class="viewer-controls" aria-label="Photograph navigation">
      <button class="icon-button" type="button" data-viewer-previous aria-label="Previous photograph">
        <i data-lucide="chevron-left" aria-hidden="true"></i>
      </button>
      <p class="viewer-count" aria-live="polite">
        <span class="viewer-current">01</span><span class="viewer-divider"></span><span>${String(content.photos.length).padStart(2, "0")}</span>
      </p>
      <button class="icon-button" type="button" data-viewer-next aria-label="Next photograph">
        <i data-lucide="chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <div class="status-toast" role="status" aria-live="polite"></div>

  <section class="webgl-fallback" hidden>
    <p class="eyebrow">The gallery could not open</p>
    <h1>${content.title}</h1>
    <p>This device could not start the 3D renderer. Try a current browser with hardware acceleration enabled.</p>
  </section>
`;

createIcons({
  icons: {
    ArrowLeft,
    ArrowRight,
    ArrowUpLeft,
    ChevronLeft,
    ChevronRight,
    Gamepad2,
    MailOpen,
    Puzzle,
    RotateCcw,
    Sparkles,
    Volume2,
    VolumeX,
    X,
  },
  attrs: { "stroke-width": 1.5 },
});

const loader = app.querySelector(".loader");
const loaderProgress = app.querySelector(".loader-progress");
const loaderStatus = app.querySelector(".loader-status");
const enterButton = app.querySelector("[data-action='enter']");
const header = app.querySelector(".experience-header");
const backButton = app.querySelector(".back-button");
const sceneLayers = [...app.querySelectorAll(".scene-layer")];
const letterLayer = app.querySelector(".scene-letter");
const letterPanel = app.querySelector(".letter-panel");
const openLetterButton = app.querySelector("[data-action='open-letter']");
const statusToast = app.querySelector(".status-toast");

const screenEnvelope = app.querySelector(".screen-envelope");
const topFlap = app.querySelector(".envelope-top-flap");
const envelopeCard = app.querySelector(".envelope-card");
const sealContainer = app.querySelector(".envelope-seal-container");
const sealBody = app.querySelector(".seal-body");
const sealCallout = app.querySelector(".seal-callout");
const envelopeSparks = app.querySelector(".envelope-sparks");
const skipLink = document.querySelector(".skip-link");
const galleryStartInstruction = app.querySelector(".gallery-start-instruction");

let sceneManager;
let gamesHub = null;
let viewer;
let navigation;
let musicPlayer;
let transitioning = false;
let currentScene = 0;
let toastTimer;
let isEnvelopeOpen = false;
let isEnvelopeOpening = false;
let isEnvelopeFlapOpened = false;
let assetsLoadedPromise = null;

function playEnvelopeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.26);
    gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  } catch {
    // silently continue if audio context is blocked
  }
}

function createSparkleBurst() {
  if (!envelopeSparks || !sealContainer) return;
  const rect = sealContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const count = reducedMotion ? 8 : 28;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.className = "spark-dot";
    envelopeSparks.appendChild(spark);
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
    const distance = 40 + Math.random() * (reducedMotion ? 35 : 130);
    const destX = centerX + Math.cos(angle) * distance;
    const destY = centerY + Math.sin(angle) * distance;
    gsap.set(spark, { x: centerX, y: centerY, scale: 0.5 + Math.random() * 0.8, opacity: 1 });
    gsap.to(spark, {
      x: destX,
      y: destY,
      opacity: 0,
      scale: 0,
      duration: 0.6 + Math.random() * 0.45,
      ease: "power2.out",
      onComplete: () => spark.remove(),
    });
  }
}

function resetEnvelope() {
  isEnvelopeOpen = false;
  isEnvelopeOpening = false;
  isEnvelopeFlapOpened = false;
  gsap.killTweensOf([screenEnvelope, topFlap, sealBody, sealCallout, envelopeCard]);
  const bottomAddress = app.querySelector(".envelope-face-address");
  const bottomFlap = app.querySelector(".envelope-bottom-flap");
  if (topFlap) {
    topFlap.style.zIndex = "6";
    gsap.set(topFlap, { rotateX: 0 });
  }
  if (envelopeCard) {
    envelopeCard.style.zIndex = "2";
    envelopeCard.style.pointerEvents = "none";
    envelopeCard.setAttribute("aria-hidden", "true");
    gsap.set(envelopeCard, { xPercent: -50, yPercent: -50, y: 35, scale: 0.96, autoAlpha: 0 });
  }
  if (bottomAddress) gsap.set(bottomAddress, { autoAlpha: 1, y: 0 });
  if (bottomFlap) gsap.set(bottomFlap, { y: 0, opacity: 1 });
  if (sealBody) gsap.set(sealBody, { scale: 1, rotation: 0, autoAlpha: 1 });
  if (sealCallout) gsap.set(sealCallout, { autoAlpha: 1, y: 0 });
  if (screenEnvelope) gsap.set(screenEnvelope, { scale: 1, autoAlpha: 1 });
  if (galleryStartInstruction) {
    galleryStartInstruction.classList.remove("is-dismissed");
  }
}

async function handleOpenEnvelope() {
  if (transitioning) return;

  // If flap is already opened, tapping proceeds into the gallery
  if (isEnvelopeFlapOpened) {
    await enterGalleryFromCard();
    return;
  }

  if (isEnvelopeOpening) return;
  isEnvelopeOpening = true;

  playEnvelopeSound();
  musicPlayer?.startFromGesture();

  const bottomAddress = app.querySelector(".envelope-face-address");

  if (reducedMotion) {
    createSparkleBurst();
    isEnvelopeFlapOpened = true;
    isEnvelopeOpening = false;
    if (topFlap) gsap.set(topFlap, { rotateX: 180, zIndex: 1 });
    if (sealBody) gsap.set(sealBody, { autoAlpha: 0 });
    if (sealCallout) gsap.set(sealCallout, { autoAlpha: 0 });
    if (bottomAddress) gsap.set(bottomAddress, { autoAlpha: 0 });
    if (envelopeCard) {
      envelopeCard.setAttribute("aria-hidden", "false");
      envelopeCard.style.zIndex = "20";
      envelopeCard.style.pointerEvents = "auto";
      gsap.set(envelopeCard, { xPercent: -50, yPercent: -50, y: 0, scale: 1, autoAlpha: 1 });
    }
    return;
  }

  createSparkleBurst();

  const tl = gsap.timeline({
    onComplete: () => {
      isEnvelopeFlapOpened = true;
      isEnvelopeOpening = false;
      if (envelopeCard) {
        envelopeCard.setAttribute("aria-hidden", "false");
        envelopeCard.style.zIndex = "20";
        envelopeCard.style.pointerEvents = "auto";
      }
    },
  });

  tl.to(sealCallout, { autoAlpha: 0, y: 15, duration: 0.22, ease: "power2.in" }, 0);
  tl.to(
    sealBody,
    {
      scale: 1.25,
      rotation: 6,
      duration: 0.18,
      ease: "back.out(2)",
    },
    0
  );
  tl.to(
    sealBody,
    {
      scale: 0.2,
      autoAlpha: 0,
      duration: 0.32,
      ease: "power2.in",
    },
    0.18
  );

  tl.to(
    topFlap,
    {
      rotateX: 180,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: function () {
        if (this.progress() > 0.48) {
          topFlap.style.zIndex = "1";
        }
      },
    },
    0.22
  );

  if (bottomAddress) {
    tl.to(bottomAddress, { autoAlpha: 0, y: 20, duration: 0.5, ease: "power2.in" }, 0.25);
  }

  gsap.set(envelopeCard, { visibility: "visible", zIndex: 20, xPercent: -50, yPercent: -50 });
  tl.fromTo(
    envelopeCard,
    { xPercent: -50, yPercent: -50, y: 35, scale: 0.95, autoAlpha: 0 },
    {
      xPercent: -50,
      yPercent: -50,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.85,
      ease: "power3.out",
    },
    0.45
  );
}

async function enterGalleryFromCard() {
  if (transitioning || currentScene !== 0) return;
  transitioning = true;
  musicPlayer?.startFromGesture();

  const exitDuration = reducedMotion ? 0.1 : 0.55;
  await new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    tl.to(envelopeCard, { xPercent: -50, yPercent: -50, scale: 1.04, autoAlpha: 0, duration: exitDuration * 0.8, ease: "power2.inOut" }, 0);
    tl.to(screenEnvelope, { scale: 1.08, autoAlpha: 0, duration: exitDuration, ease: "power2.inOut" }, 0.05);
  });

  header.classList.add("is-visible");
  header.inert = false;
  isEnvelopeOpen = true;

  hideScenes();
  try {
    setScene(1); // User flow: GALLERY FIRST!
    await Promise.race([
      sceneManager.enterGallery(),
      new Promise((resolve) => window.setTimeout(resolve, 4000)),
    ]);
  } finally {
    transitioning = false;
  }
}

function handleGlobalKeydown(event) {
  if (letterPanel.hidden) return;
  const closeButton = letterPanel.querySelector("[data-action='close-letter']");
  if (event.key === "Escape") {
    event.preventDefault();
    closeButton.click();
  }
  if (event.key === "Tab") {
    event.preventDefault();
    closeButton.focus();
  }
}

function handlePhotoSelect(event) {
  galleryStartInstruction?.classList.add("is-dismissed");
  viewer?.open(event.detail.index);
}

function showStatus(message) {
  window.clearTimeout(toastTimer);
  statusToast.textContent = message;
  statusToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => statusToast.classList.remove("is-visible"), 5200);
}

function setScene(index) {
  activateSceneLayer(sceneLayers, index, { reducedMotion });
  if (index !== 0) {
    gsap.killTweensOf(sceneLayers[0]);
    gsap.set(sceneLayers[0], { autoAlpha: 0 });
  }
  currentScene = index;
  backButton.hidden = index === 0;
  backButton.querySelector("span").textContent = "Envelope";
  document.body.dataset.scene = String(index + 1);

  // Update navbar active state
  app.querySelectorAll(".nav-tab").forEach((tab) => {
    const action = tab.dataset.action;
    const isActive =
      (index === 1 && (action === "to-gallery" || action === "nav-gallery")) ||
      (index === 2 && (action === "to-letter" || action === "nav-story")) ||
      (index === 3 && (action === "to-wishes" || action === "nav-wishes")) ||
      (index === 4 && (action === "to-games" || action === "nav-games"));
    tab.classList.toggle("is-active", isActive);
  });

  if (index === 4) {
    const gamesSlot = app.querySelector(".games-mount-slot");
    if (!gamesHub && gamesSlot) {
      gamesHub = new GamesHub(gamesSlot, content.photos, {
        onNavigate: (action) => {
          if (action === "to-wishes") {
            runTransition(() => sceneManager.transitionTo(3), 3);
          } else if (action === "to-gallery") {
            runTransition(() => sceneManager.transitionTo(1), 1);
          }
        },
      });
    }
  }

  if (index === 0) {
    header.classList.remove("is-visible");
    header.inert = true;
    resetEnvelope();
  } else {
    header.classList.add("is-visible");
    header.inert = false;
  }
}

function hideScenes() {
  activateSceneLayer(sceneLayers, -1, { reducedMotion });
}

async function runTransition(task, destination) {
  if (transitioning) return;
  transitioning = true;
  hideScenes();
  try {
    const transitionTask = Promise.resolve().then(task);
    await new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 50 : 350));
    setScene(destination);
    await Promise.race([
      transitionTask,
      new Promise((resolve) => window.setTimeout(resolve, 5000)),
    ]);
  } finally {
    transitioning = false;
  }
}

async function initialise() {
  try {
    sceneManager = new SceneManager(canvas, content, { reducedMotion, viewportMode, lowPower });
  } catch (error) {
    console.error("Unable to create the Three.js experience:", error);
    loader.hidden = true;
    canvas.hidden = true;
    app.querySelector(".webgl-fallback").hidden = false;
    return;
  }

  musicPlayer = new MusicPlayer(app.querySelector(".music-button"), content.audio, {
    onStatus: showStatus,
  });
  viewer = new PhotoViewer(app.querySelector(".photo-viewer"), content.photos, {
    onSelect: (index) => sceneManager.selectPhoto(index),
    onClose: () => sceneManager.closePhoto(),
    onStateChange: (isOpen) => {
      header.inert = isOpen;
      if (isOpen) {
        galleryStartInstruction?.classList.add("is-dismissed");
      }
    },
    onFinish: () => {
      runTransition(() => sceneManager.transitionTo(2), 2);
    },
  });

  window.addEventListener("memory:photo-select", handlePhotoSelect);

  navigation = new Navigation(app, {
    enter: handleOpenEnvelope,
    "enter-gallery": enterGalleryFromCard,
    "nav-story": () => runTransition(() => sceneManager.transitionTo(2), 2),
    "nav-gallery": () => runTransition(() => sceneManager.transitionTo(1), 1),
    "nav-wishes": () => runTransition(() => sceneManager.transitionTo(3), 3),
    "nav-games": () => runTransition(() => sceneManager.transitionTo(4), 4),
    "to-letter": () => runTransition(() => sceneManager.transitionTo(2), 2),
    "to-gallery": () => runTransition(() => sceneManager.transitionTo(1), 1),
    "to-wishes": () => runTransition(() => sceneManager.transitionTo(3), 3),
    "to-games": () => runTransition(() => sceneManager.transitionTo(4), 4),
    "open-photo": (button) => {
      if (transitioning || currentScene !== 1) return;
      galleryStartInstruction?.classList.add("is-dismissed");
      viewer.open(Number(button.dataset.photoIndex));
    },
    back: () => {
      if (transitioning || viewer.isOpen) return;
      return runTransition(() => sceneManager.transitionTo(0), 0);
    },
    "open-letter": async (button) => {
      if (transitioning || sceneManager.envelope.isOpen) return;
      transitioning = true;
      button.disabled = true;
      letterLayer.classList.add("letter-is-opening");
      try {
        await sceneManager.openEnvelope();
        letterLayer.classList.add("letter-is-open");
        header.inert = true;
        if (sceneManager.envelope?.group) {
          gsap.to(sceneManager.envelope.group.position, { y: -3.8, duration: 0.5, ease: "power2.out" });
        }
        await revealLetterPanel(letterPanel, { reducedMotion });
        letterPanel.scrollTop = 0;
        window.setTimeout(() => {
          letterPanel.focus({ preventScroll: true });
        }, 30);
      } finally {
        transitioning = false;
      }
    },
    "close-letter": async () => {
      if (transitioning) return;
      transitioning = true;
      await hideLetterPanel(letterPanel, { reducedMotion });
      letterLayer.classList.remove("letter-is-open", "letter-is-opening");
      openLetterButton.disabled = false;
      if (sceneManager.envelope?.group) {
        gsap.to(sceneManager.envelope.group.position, { y: 0, duration: 0.5, ease: "power2.out" });
      }
      hideScenes();
      try {
        await sceneManager.closeLetterAndFinish();
        setScene(1);
        header.inert = false;
        await sceneManager.enterGallery();
      } finally {
        transitioning = false;
      }
    },
    replay: () => runTransition(() => sceneManager.transitionTo(1), 1),
  });

  screenEnvelope?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenEnvelope();
    }
  });

  galleryStartInstruction?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      galleryStartInstruction.click();
    }
  });

  skipLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (currentScene === 0) {
      isEnvelopeOpen = true;
      header.classList.add("is-visible");
      header.inert = false;
      await runTransition(() => sceneManager.enterGallery(), 1);
    }
  });

  assetsLoadedPromise = sceneManager.loadAssets(({ completed, total }) => {
    const percent = Math.round((completed / total) * 100);
    loaderProgress.style.width = `${percent}%`;
  });

  // Promptly reveal the entrance so the user isn't kept waiting on asset downloads
  await Promise.race([
    assetsLoadedPromise,
    new Promise((resolve) => window.setTimeout(resolve, 600)),
  ]);

  loaderProgress.style.width = "100%";
  loaderStatus.textContent = "Welcome";
  resetEnvelope();
  await fadeLoader(loader, { reducedMotion });
  screenEnvelope?.classList.add("is-ready");
  screenEnvelope?.focus({ preventScroll: true });
}

function dispose() {
  window.clearTimeout(toastTimer);
  window.removeEventListener("beforeunload", dispose);
  window.removeEventListener("keydown", handleGlobalKeydown);
  window.removeEventListener("memory:photo-select", handlePhotoSelect);
  navigation?.dispose();
  gamesHub?.dispose();
  viewer?.dispose();
  musicPlayer?.dispose();
  sceneManager?.dispose();
}

window.addEventListener("beforeunload", dispose, { once: true });
window.addEventListener("keydown", handleGlobalKeydown);
if (import.meta.hot) import.meta.hot.dispose(dispose);

initialise().catch((err) => {
  console.error("FATAL: initialise failed:", err);
});
