export class PhotoViewer {
  constructor(root, photos, { onSelect, onClose, onFinish, onStateChange = () => {} }) {
    this.root = root;
    this.photos = photos;
    this.onSelect = onSelect;
    this.onClose = onClose;
    this.onFinish = onFinish;
    this.onStateChange = onStateChange;
    this.index = 0;
    this.isOpen = false;
    this.touchStart = null;
    this.previousFocus = null;

    this.title = root.querySelector(".viewer-title");
    this.date = root.querySelector(".viewer-date");
    this.caption = root.querySelector(".viewer-caption");
    this.infoElement = root.querySelector(".viewer-info");
    this.current = root.querySelector(".viewer-current");
    this.closeButton = root.querySelector("[data-viewer-close]");
    this.previousButton = root.querySelector("[data-viewer-previous]");
    this.nextButton = root.querySelector("[data-viewer-next]");
    this.infoFadeTimer = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    root.addEventListener("click", this.handleClick);
    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("pointerdown", this.handlePointerDown, { passive: true });
    window.addEventListener("pointerup", this.handlePointerUp, { passive: true });
  }

  scheduleInfoFade() {
    window.clearTimeout(this.infoFadeTimer);
    this.infoElement?.classList.remove("is-faded");
    this.infoFadeTimer = window.setTimeout(() => {
      this.infoElement?.classList.add("is-faded");
    }, 3200);
  }

  toggleInfo() {
    if (this.infoElement?.classList.contains("is-faded")) {
      this.scheduleInfoFade();
    } else {
      window.clearTimeout(this.infoFadeTimer);
      this.infoElement?.classList.add("is-faded");
    }
  }

  handleClick(event) {
    if (event.target.closest("[data-viewer-close]")) {
      this.close();
      return;
    }
    if (event.target.closest("[data-viewer-previous]")) {
      this.previous();
      return;
    }
    if (event.target.closest("[data-viewer-next]")) {
      this.next();
      return;
    }
    if (event.target.closest(".viewer-shade") || event.target.closest(".viewer-info")) {
      this.toggleInfo();
    }
  }

  handleKeydown(event) {
    if (!this.isOpen) return;
    if (event.key === "Escape") this.close();
    if (event.key === "ArrowLeft") this.previous();
    if (event.key === "ArrowRight") this.next();
    if (event.key === "Tab") {
      const controls = [...this.root.querySelectorAll("button:not(:disabled)")];
      const first = controls[0];
      const last = controls.at(-1);
      if (document.activeElement === this.root) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  handlePointerDown(event) {
    if (!this.isOpen || event.pointerType !== "touch") return;
    this.touchStart = { x: event.clientX, y: event.clientY };
  }

  handlePointerUp(event) {
    if (!this.isOpen || !this.touchStart || event.pointerType !== "touch") return;
    const dx = event.clientX - this.touchStart.x;
    const dy = event.clientY - this.touchStart.y;
    this.touchStart = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) this.previous();
    else this.next();
  }

  updateContent() {
    const photo = this.photos[this.index];
    if (this.title) this.title.textContent = photo.title;
    if (this.date) {
      this.date.textContent = "";
      this.date.hidden = true;
    }
    if (this.caption) {
      this.caption.textContent = "";
      this.caption.hidden = true;
    }
    if (this.current) {
      this.current.textContent = String(this.index + 1).padStart(2, "0");
    }

    const isLast = this.index === this.photos.length - 1;
    if (this.nextButton) {
      this.nextButton.classList.toggle("to-letter", isLast);
      this.nextButton.setAttribute("aria-label", isLast ? "Continue to our story letter" : "Next photograph");
      this.nextButton.title = isLast ? "Continue to our story letter" : "Next photograph";
    }
  }

  open(index) {
    this.previousFocus = document.activeElement;
    this.index = index;
    this.isOpen = true;
    this.updateContent();
    this.scheduleInfoFade();
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    this.root.inert = false;
    document.body.classList.add("photo-is-open");
    this.onStateChange(true);
    this.focusTimer = window.setTimeout(() => {
      this.closeButton.focus({ preventScroll: true });
      if (document.activeElement !== this.closeButton) this.root.focus({ preventScroll: true });
    }, 0);
    this.onSelect(this.index);
  }

  goTo(index) {
    this.index = (index + this.photos.length) % this.photos.length;
    this.updateContent();
    this.scheduleInfoFade();
    this.onSelect(this.index);
  }

  previous() {
    this.goTo(this.index - 1);
  }

  next() {
    if (this.index >= this.photos.length - 1) {
      this.close();
      this.onFinish?.();
      return;
    }
    this.goTo(this.index + 1);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    window.clearTimeout(this.focusTimer);
    window.clearTimeout(this.infoFadeTimer);
    this.infoElement?.classList.remove("is-faded");
    this.root.classList.remove("is-open");
    this.root.setAttribute("aria-hidden", "true");
    this.root.inert = true;
    document.body.classList.remove("photo-is-open");
    this.onStateChange(false);
    this.onClose();
    if (this.previousFocus instanceof HTMLElement) this.previousFocus.focus({ preventScroll: true });
  }

  dispose() {
    window.clearTimeout(this.focusTimer);
    window.clearTimeout(this.infoFadeTimer);
    this.root.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointerup", this.handlePointerUp);
  }
}
