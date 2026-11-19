import { gsap } from "gsap";

export function revealClosing(root, { reducedMotion = false } = {}) {
  const elements = root.querySelectorAll("[data-closing-reveal]");
  gsap.killTweensOf(elements);
  return gsap.fromTo(
    elements,
    { autoAlpha: 0, y: reducedMotion ? 0 : 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: reducedMotion ? 0.1 : 1.1,
      stagger: reducedMotion ? 0 : 0.18,
      delay: reducedMotion ? 0 : 0.6,
      ease: "power3.out",
    },
  );
}
