import * as THREE from "three";
import { COLORS } from "./world.js";

function createParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255, 245, 210, 0.95)");
  gradient.addColorStop(0.18, "rgba(214, 179, 106, 0.7)");
  gradient.addColorStop(1, "rgba(214, 179, 106, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export class Particles {
  constructor({ center, count = 260, spread = new THREE.Vector3(28, 16, 28), opacity = 0.5 }) {
    this.center = center.clone();
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      positions[offset] = (Math.random() - 0.5) * spread.x;
      positions[offset + 1] = (Math.random() - 0.5) * spread.y;
      positions[offset + 2] = (Math.random() - 0.5) * spread.z;
      scales[i] = 0.35 + Math.random() * 0.65;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    this.texture = createParticleTexture();
    this.material = new THREE.PointsMaterial({
      color: COLORS.gold,
      map: this.texture,
      size: 0.12,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.position.copy(center);
    this.points.frustumCulled = false;
  }

  update(elapsed, reducedMotion = false) {
    if (reducedMotion) return;
    this.points.rotation.y = elapsed * 0.006;
    this.points.position.y = this.center.y + Math.sin(elapsed * 0.12) * 0.18;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
