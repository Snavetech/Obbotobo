import * as THREE from "three";
import { gsap } from "gsap";
import { COLORS } from "./world.js";

export class FinalScene {
  constructor(anchor, { reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.group = new THREE.Group();
    this.group.position.copy(anchor);
    this.pathMaterials = [];
    this.echoes = [];

    for (let index = 0; index < 24; index += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: COLORS.gold,
        transparent: true,
        opacity: 0.02,
        depthWrite: false,
      });
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(1.7 - index * 0.035, 0.44), material);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(Math.sin(index * 0.28) * 0.52, -2.65, 3.1 - index * 0.75);
      this.pathMaterials.push(material);
      this.group.add(tile);
    }

    this.horizon = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffd99a,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.horizon.position.set(0, 0.6, -18);
    this.group.add(this.horizon);

    this.warmLight = new THREE.PointLight(0xffd89b, 38, 36, 1.4);
    this.warmLight.position.set(0, 2, -8);
    this.group.add(this.warmLight);
  }

  setTextures(textures) {
    this.echoes.forEach((echo) => {
      this.group.remove(echo);
      echo.geometry.dispose();
      echo.material.dispose();
    });
    this.echoes = textures.map((texture, index) => {
      const image = texture?.image;
      const aspect = image?.naturalWidth
        ? image.naturalWidth / image.naturalHeight
        : image?.width && image?.height
          ? image.width / image.height
          : 1.45;
      const height = 1.75;
      const width = Math.min(2.7, Math.max(1.25, height * aspect));
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: COLORS.ivory,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      });
      const echo = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      const side = index % 2 === 0 ? -1 : 1;
      echo.position.set(side * (4.4 + (index % 3) * 0.7), 1.5 - (index % 3) * 1.7, -2 - index * 1.7);
      echo.userData.baseY = echo.position.y;
      echo.rotation.y = side * -0.2;
      this.group.add(echo);
      return echo;
    });
  }

  reveal() {
    const duration = this.reducedMotion ? 0.25 : 2.4;
    this.pathMaterials.forEach((material, index) => {
      gsap.to(material, {
        opacity: Math.max(0.08, 0.52 - index * 0.014),
        duration,
        delay: this.reducedMotion ? 0 : index * 0.035,
        ease: "sine.out",
      });
    });
    this.echoes.forEach((echo, index) => {
      gsap.to(echo.material, {
        opacity: 0.1,
        duration,
        delay: this.reducedMotion ? 0 : 0.5 + index * 0.12,
      });
    });
    gsap.to(this.horizon.material, { opacity: 0.52, duration: duration * 1.2, ease: "sine.inOut" });
  }

  update(elapsed) {
    if (this.reducedMotion) return;
    this.horizon.scale.setScalar(1 + Math.sin(elapsed * 0.28) * 0.025);
    this.echoes.forEach((echo, index) => {
      echo.position.y = echo.userData.baseY + Math.sin(elapsed * 0.36 + index) * 0.045;
    });
  }
}
