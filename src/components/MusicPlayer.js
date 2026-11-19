import { gsap } from "gsap";

export class MusicPlayer {
  constructor(button, source, { onStatus = () => {} } = {}) {
    this.button = button;
    this.onStatus = onStatus;
    this.audio = new Audio(source);
    this.audio.loop = true;
    this.audio.preload = "none";
    this.audio.volume = 0;
    this.available = true;
    this.isPlaying = false;

    this.toggle = this.toggle.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handlePause = this.handlePause.bind(this);
    button.addEventListener("click", this.toggle);
    this.audio.addEventListener("error", this.handleError, { once: true });
    this.audio.addEventListener("pause", this.handlePause);
  }

  async startFromGesture() {
    if (!this.available || this.isPlaying) return;
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.button.classList.add("is-playing");
      this.button.setAttribute("aria-label", "Mute background music");
      this.button.setAttribute("aria-pressed", "true");
      gsap.to(this.audio, { volume: 0.38, duration: 1.8, ease: "sine.out" });
    } catch (error) {
      if (error?.name !== "NotAllowedError") this.handleError();
    }
  }

  toggle() {
    if (!this.available) {
      return;
    }
    if (this.isPlaying) {
      gsap.to(this.audio, {
        volume: 0,
        duration: 0.45,
        onComplete: () => this.audio.pause(),
      });
      this.isPlaying = false;
      this.button.classList.remove("is-playing");
      this.button.setAttribute("aria-label", "Play background music");
      this.button.setAttribute("aria-pressed", "false");
      return;
    }
    this.startFromGesture();
  }

  handlePause() {
    if (this.audio.ended) return;
    this.isPlaying = false;
    this.button.classList.remove("is-playing");
    this.button.setAttribute("aria-pressed", "false");
  }

  handleError() {
    if (!this.available) return;
    this.available = false;
    this.isPlaying = false;
    this.button.classList.remove("is-playing");
    this.button.classList.add("is-unavailable");
    this.button.setAttribute("aria-label", "Background music unavailable");
  }

  dispose() {
    gsap.killTweensOf(this.audio);
    this.button.removeEventListener("click", this.toggle);
    this.audio.removeEventListener("error", this.handleError);
    this.audio.removeEventListener("pause", this.handlePause);
    this.audio.pause();
    this.audio.src = "";
  }
}
