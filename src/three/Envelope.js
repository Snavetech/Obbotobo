import * as THREE from "three";
import { gsap } from "gsap";
import { COLORS } from "./world.js";

function createTriangle(width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, -height);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

export class Envelope {
  constructor(anchor, { shadows = true, reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.isOpen = false;
    this.group = new THREE.Group();
    this.group.position.copy(anchor);
    this.model = new THREE.Group();
    // Position the 3D envelope lower and scaled tastefully
    this.model.position.set(0, -1.6, 0);
    this.model.scale.setScalar(0.72);
    this.group.add(this.model);

    this.paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8, // Clean warm ivory
      roughness: 0.82,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const paperShade = new THREE.MeshStandardMaterial({
      color: 0xe6ded2,
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3, 0.18), this.paperMaterial);
    body.castShadow = shadows;
    body.receiveShadow = shadows;

    const leftFold = new THREE.Mesh(createTriangle(3, 2.4), paperShade);
    leftFold.rotation.z = -Math.PI / 2;
    leftFold.position.set(-2.35, -1.45, 0.105);
    const rightFold = leftFold.clone();
    rightFold.rotation.z = Math.PI / 2;
    rightFold.position.x = 2.35;

    const bottomFold = new THREE.Mesh(createTriangle(4.65, 1.8), this.paperMaterial);
    bottomFold.rotation.z = Math.PI;
    bottomFold.position.set(0, -1.42, 0.125);

    this.flapPivot = new THREE.Group();
    this.flapPivot.position.set(0, 1.46, 0.12);
    this.flap = new THREE.Mesh(createTriangle(4.7, 1.9), this.paperMaterial);
    this.flap.castShadow = shadows;
    this.flapPivot.add(this.flap);

    this.letter = new THREE.Mesh(
      new THREE.BoxGeometry(4.15, 2.62, 0.055),
      new THREE.MeshStandardMaterial({
        color: 0xfcf9f4,
        roughness: 0.88,
        emissive: 0xf5ede2,
        emissiveIntensity: 0.03,
      }),
    );
    this.letter.position.set(0, 0.05, -0.08);
    this.letter.castShadow = shadows;

    this.sealMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      metalness: 0.8,
      roughness: 0.28,
      emissive: COLORS.gold,
      emissiveIntensity: 0.08,
    });
    this.seal = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.14, 48), this.sealMaterial);
    this.seal.rotation.x = Math.PI / 2;
    this.seal.position.set(0, 0.1, 0.28);
    this.seal.castShadow = shadows;

    const sealInset = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.025, 8, 40),
      new THREE.MeshBasicMaterial({ color: COLORS.ivory, transparent: true, opacity: 0.5 }),
    );
    sealInset.position.z = 0.08;
    this.seal.add(sealInset);

    this.model.add(this.letter, body, leftFold, rightFold, bottomFold, this.flapPivot, this.seal);
    // Subtle, warm champagne accent light (not blinding gold 37)
    this.light = new THREE.PointLight(0xfff3e3, 7, 14, 1.8);
    this.light.position.set(0, 2.2, 3.5);
    this.group.add(this.light);
  }

  open() {
    if (this.isOpen) return Promise.resolve();
    this.isOpen = true;
    const speed = this.reducedMotion ? 0.2 : 1;

    return new Promise((resolve) => {
      const timeline = gsap.timeline({ onComplete: resolve });
      timeline.to(this.seal.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.45 * speed,
        ease: "back.in(1.7)",
      });
      timeline.to(
        this.seal.position,
        { y: -0.35, z: 0.7, duration: 0.45 * speed, ease: "power2.in" },
        0,
      );
      timeline.to(this.flapPivot.rotation, {
        x: Math.PI * 0.78, // Tilted open without shooting to the very top
        duration: 1.05 * speed,
        ease: "power3.inOut",
      });
      timeline.to(
        this.letter.position,
        { y: 1.6, z: 0.35, duration: 1.15 * speed, ease: "power3.out" },
        `-=${0.35 * speed}`,
      );
      timeline.to(
        this.letter.scale,
        { x: 1.05, y: 1.05, z: 1.05, duration: 0.8 * speed, ease: "sine.out" },
        "<",
      );
      timeline.to(this.light, { intensity: 10, duration: 1.1 * speed }, 0);
    });
  }

  close() {
    if (!this.isOpen) return Promise.resolve();
    this.isOpen = false;
    const speed = this.reducedMotion ? 0.2 : 1;

    return new Promise((resolve) => {
      const timeline = gsap.timeline({ onComplete: resolve });
      timeline.to(this.letter.position, {
        y: 0.05,
        z: -0.08,
        duration: 0.85 * speed,
        ease: "power2.inOut",
      });
      timeline.to(this.letter.scale, { x: 1, y: 1, z: 1, duration: 0.55 * speed }, "<");
      timeline.to(this.flapPivot.rotation, {
        x: 0,
        duration: 0.78 * speed,
        ease: "power3.inOut",
      });
      timeline.set(this.seal.position, { y: 0.1, z: 0.28 });
      timeline.to(this.seal.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5 * speed,
        ease: "back.out(1.5)",
      });
      timeline.to(this.light, { intensity: 21, duration: 0.7 * speed }, 0);
    });
  }

  update(elapsed) {
    if (this.reducedMotion || this.isOpen) return;
    this.model.position.y = Math.sin(elapsed * 0.58) * 0.13;
    this.model.rotation.z = Math.sin(elapsed * 0.34) * 0.012;
  }
}
