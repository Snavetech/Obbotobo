import * as THREE from "three";
import { gsap } from "gsap";
import { COLORS, SCENE_ANCHORS } from "./world.js";

const MOODS = [
  { ambient: 0.3, key: 48, fill: 16, color: COLORS.gold },
  { ambient: 0.54, key: 70, fill: 25, color: COLORS.gold },
  { ambient: 0.5, key: 60, fill: 21, color: COLORS.gold },
  { ambient: 0.72, key: 78, fill: 34, color: 0xffd997 },
];

export class Lighting {
  constructor(scene, { shadows = true } = {}) {
    this.scene = scene;
    this.ambient = new THREE.HemisphereLight(COLORS.ivory, COLORS.dark, 0.3);
    this.key = new THREE.SpotLight(COLORS.gold, 48, 48, Math.PI / 5, 0.72, 1.4);
    this.fill = new THREE.PointLight(COLORS.rose, 16, 32, 1.5);
    this.target = new THREE.Object3D();

    this.key.position.set(6, 10, 31);
    this.key.target = this.target;
    this.key.castShadow = shadows;
    this.key.shadow.mapSize.set(shadows ? 1024 : 256, shadows ? 1024 : 256);
    this.key.shadow.bias = -0.0004;
    this.fill.position.set(-7, 1, 29);
    this.target.position.copy(SCENE_ANCHORS.entrance);

    scene.add(this.ambient, this.key, this.fill, this.target);
  }

  setMood(index, anchor, { immediate = false } = {}) {
    const mood = MOODS[index] ?? MOODS[1];
    const duration = immediate ? 0 : 2.2;
    const keyPosition = anchor.clone().add(new THREE.Vector3(7, 9, 10));
    const fillPosition = anchor.clone().add(new THREE.Vector3(-7, 1.5, 7));

    gsap.to(this.ambient, { intensity: mood.ambient, duration, ease: "sine.inOut" });
    gsap.to(this.key, { intensity: mood.key, duration, ease: "sine.inOut" });
    gsap.to(this.fill, { intensity: mood.fill, duration, ease: "sine.inOut" });
    gsap.to(this.key.color, {
      r: new THREE.Color(mood.color).r,
      g: new THREE.Color(mood.color).g,
      b: new THREE.Color(mood.color).b,
      duration,
    });
    gsap.to(this.key.position, {
      x: keyPosition.x,
      y: keyPosition.y,
      z: keyPosition.z,
      duration,
      ease: "power2.inOut",
    });
    gsap.to(this.fill.position, {
      x: fillPosition.x,
      y: fillPosition.y,
      z: fillPosition.z,
      duration,
      ease: "power2.inOut",
    });
    gsap.to(this.target.position, {
      x: anchor.x,
      y: anchor.y,
      z: anchor.z,
      duration,
      ease: "power2.inOut",
    });
  }

  dispose() {
    gsap.killTweensOf([
      this.ambient,
      this.key,
      this.fill,
      this.key.position,
      this.fill.position,
      this.target.position,
    ]);
  }
}
