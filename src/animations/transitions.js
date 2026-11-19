import { gsap } from "gsap";

export function activateSceneLayer(layers, activeIndex, { reducedMotion = false } = {}) {
  const duration = reducedMotion ? 0.1 : 0.45;

  layers.forEach((layer, index) => {
    const isActive = index === activeIndex;
    layer.classList.toggle("is-active", isActive);
    layer.setAttribute("aria-hidden", String(!isActive));
    gsap.killTweensOf(layer);
    gsap.to(layer, {
      autoAlpha: isActive ? 1 : 0,
      duration,
      ease: isActive ? "power2.out" : "power2.in",
      onStart: () => {
        if (isActive) layer.style.visibility = "visible";
      },
      onComplete: () => {
        if (!isActive) layer.style.visibility = "hidden";
      },
    });
  });
}

export function fadeLoader(loader, { reducedMotion = false } = {}) {
  return new Promise((resolve) => {
    gsap.to(loader, {
      autoAlpha: 0,
      duration: reducedMotion ? 0.1 : 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        loader.hidden = true;
        resolve();
      },
    });
  });
}

export function revealLetterPanel(panel, { reducedMotion = false } = {}) {
  panel.hidden = false;
  panel.setAttribute("aria-hidden", "false");
  gsap.set(panel, { xPercent: -50, yPercent: -50 });
  return gsap.fromTo(
    panel,
    { xPercent: -50, yPercent: -50, autoAlpha: 0, y: reducedMotion ? 0 : 25, scale: reducedMotion ? 1 : 0.98 },
    {
      xPercent: -50,
      yPercent: -50,
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: reducedMotion ? 0.1 : 0.65,
      ease: "power3.out",
    },
  );
}

export function hideLetterPanel(panel, { reducedMotion = false } = {}) {
  return new Promise((resolve) => {
    gsap.to(panel, {
      xPercent: -50,
      yPercent: -50,
      autoAlpha: 0,
      y: reducedMotion ? 0 : 18,
      duration: reducedMotion ? 0.1 : 0.45,
      ease: "power2.in",
      onComplete: () => {
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
        resolve();
      },
    });
  });
}
