import * as THREE from "three";
import { gsap } from "gsap";
import { COLORS } from "./world.js";

export class Entrance {
  constructor(anchor, { shadows = true, reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.opened = false;
    this.group = new THREE.Group();
    this.group.position.copy(anchor);

    const stone = new THREE.MeshStandardMaterial({
      color: COLORS.burgundy,
      roughness: 0.5,
      metalness: 0.15,
      emissive: COLORS.wine,
      emissiveIntensity: 0.12,
    });
    this.gold = new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      roughness: 0.26,
      metalness: 0.78,
      emissive: COLORS.gold,
      emissiveIntensity: 0.1,
    });

    const leftColumn = new THREE.Mesh(new THREE.BoxGeometry(0.72, 8.3, 0.82), stone);
    const rightColumn = leftColumn.clone();
    leftColumn.position.set(-3.05, -0.35, 0);
    rightColumn.position.set(3.05, -0.35, 0);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.82, 0.72, 0.88), stone);
    lintel.position.set(0, 3.7, 0);

    const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 7.55, 0.1), this.gold);
    const rightTrim = leftTrim.clone();
    leftTrim.position.set(-2.62, -0.35, 0.47);
    rightTrim.position.set(2.62, -0.35, 0.47);
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(5.32, 0.08, 0.1), this.gold);
    topTrim.position.set(0, 3.3, 0.47);

    this.portalMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.wine,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    this.portal = new THREE.Mesh(new THREE.PlaneGeometry(5.25, 7.45), this.portalMaterial);
    this.portal.position.set(0, -0.35, -0.05);

    const threshold = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.16, 1.8), stone);
    threshold.position.set(0, -4.5, 0.25);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(25, 24),
      new THREE.MeshStandardMaterial({
        color: COLORS.darker,
        roughness: 0.88,
        metalness: 0.08,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -4.58, -3.5);
    floor.receiveShadow = shadows;

    [leftColumn, rightColumn, lintel, threshold].forEach((mesh) => {
      mesh.castShadow = shadows;
      mesh.receiveShadow = shadows;
    });

    this.light = new THREE.PointLight(COLORS.gold, 24, 18, 1.7);
    this.light.position.set(0, 0.5, 1.7);
    this.group.add(
      floor,
      this.portal,
      leftColumn,
      rightColumn,
      lintel,
      leftTrim,
      rightTrim,
      topTrim,
      threshold,
      this.light,
    );
  }

  open() {
    this.opened = true;
    const duration = this.reducedMotion ? 0.25 : 2.2;
    const timeline = gsap.timeline();
    timeline.to(this.portalMaterial, { opacity: 0.72, duration, ease: "sine.inOut" }, 0);
    timeline.to(this.light, { intensity: 58, duration, ease: "power2.inOut" }, 0);
    timeline.to(this.gold, { emissiveIntensity: 0.48, duration, ease: "sine.inOut" }, 0);
    return timeline;
  }

  update(elapsed) {
    if (this.reducedMotion || this.opened) return;
    this.portalMaterial.opacity = 0.27 + Math.sin(elapsed * 0.7) * 0.035;
  }
}
