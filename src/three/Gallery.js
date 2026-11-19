import * as THREE from "three";
import { PhotoFrame } from "./PhotoFrame.js";
import { COLORS } from "./world.js";

const DESKTOP_LAYOUT = [
  { position: [-7.25, 2.75, 0.2], rotationY: 0.14, scale: 0.78 },
  { position: [-2.42, 2.9, -1.4], rotationY: 0.05, scale: 0.78 },
  { position: [2.42, 2.8, -1.2], rotationY: -0.05, scale: 0.78 },
  { position: [7.25, 2.65, 0], rotationY: -0.14, scale: 0.78 },
  { position: [-5.05, -2.55, -1.35], rotationY: 0.13, scale: 0.84 },
  { position: [0, -2.45, 0.05], rotationY: 0, scale: 0.84 },
  { position: [5.05, -2.6, -1.45], rotationY: -0.13, scale: 0.84 },
];

const MOBILE_LAYOUT = [
  { position: [-1.9, 4.4, -0.4], rotationY: 0.08, scale: 0.6 },
  { position: [1.9, 4.35, -1.1], rotationY: -0.08, scale: 0.6 },
  { position: [-1.9, 1.45, -1.05], rotationY: 0.07, scale: 0.6 },
  { position: [1.9, 1.4, -0.2], rotationY: -0.07, scale: 0.6 },
  { position: [-1.9, -1.5, -0.25], rotationY: 0.08, scale: 0.6 },
  { position: [1.9, -1.45, -1.15], rotationY: -0.08, scale: 0.6 },
  { position: [0, -4.45, -0.65], rotationY: 0, scale: 0.62 },
];

const TABLET_LAYOUT = [
  { position: [-2.85, 4.25, -0.5], rotationY: 0.1, scale: 0.66 },
  { position: [2.85, 4.2, -1.25], rotationY: -0.1, scale: 0.66 },
  { position: [-2.85, 1.4, -1.2], rotationY: 0.09, scale: 0.66 },
  { position: [2.85, 1.35, -0.25], rotationY: -0.09, scale: 0.66 },
  { position: [-2.85, -1.45, -0.3], rotationY: 0.1, scale: 0.66 },
  { position: [2.85, -1.4, -1.3], rotationY: -0.1, scale: 0.66 },
  { position: [0, -4.3, -0.7], rotationY: 0, scale: 0.67 },
];

const COMPACT_LANDSCAPE_LAYOUT = [
  { position: [-7.05, 2.15, 0], rotationY: 0.12, scale: 0.62 },
  { position: [-2.35, 2.22, -1.1], rotationY: 0.04, scale: 0.62 },
  { position: [2.35, 2.18, -1], rotationY: -0.04, scale: 0.62 },
  { position: [7.05, 2.1, -0.1], rotationY: -0.12, scale: 0.62 },
  { position: [-4.7, -2.15, -1.05], rotationY: 0.1, scale: 0.65 },
  { position: [0, -2.1, 0], rotationY: 0, scale: 0.65 },
  { position: [4.7, -2.15, -1.15], rotationY: -0.1, scale: 0.65 },
];

export class Gallery {
  constructor(photos, anchor, {
    viewportMode = "desktop",
    reducedMotion = false,
    shadows = true,
    maxAnisotropy = 1,
  } = {}) {
    this.photos = photos;
    this.viewportMode = viewportMode;
    this.reducedMotion = reducedMotion;
    this.maxAnisotropy = maxAnisotropy;
    this.selectedIndex = -1;
    this.group = new THREE.Group();
    this.group.position.copy(anchor);

    this.frames = photos.map((photo, index) => {
      const frame = new PhotoFrame(photo, index, { shadows, reducedMotion });
      this.group.add(frame);
      return frame;
    });
    this.applyLayout();

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 25),
      new THREE.MeshStandardMaterial({
        color: COLORS.darker,
        metalness: 0.14,
        roughness: 0.82,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -5.25, -3.5);
    floor.receiveShadow = shadows;
    this.group.add(floor);

    [-7, 0, 7].forEach((x, index) => {
      const light = new THREE.PointLight(index === 1 ? COLORS.gold : COLORS.rose, 11, 13, 1.8);
      light.position.set(x, index === 1 ? 0 : 1.5, 3.2);
      this.group.add(light);
    });
  }

  applyLayout() {
    const layouts = {
      desktop: DESKTOP_LAYOUT,
      phone: MOBILE_LAYOUT,
      tablet: TABLET_LAYOUT,
      "compact-landscape": COMPACT_LANDSCAPE_LAYOUT,
    };
    const layout = layouts[this.viewportMode] ?? DESKTOP_LAYOUT;
    this.frames.forEach((frame, index) => {
      const item = layout[index];
      frame.setLayout({
        position: new THREE.Vector3(...item.position),
        rotationY: item.rotationY,
        scale: item.scale,
      });
    });
  }

  setViewportMode(viewportMode) {
    if (this.viewportMode === viewportMode) return;
    this.viewportMode = viewportMode;
    this.applyLayout();
  }

  async loadTextures(onProgress = () => {}) {
    const loader = new THREE.TextureLoader();
    let completed = 0;
    const missing = [];

    await Promise.all(
      this.photos.map(
        (photo, index) =>
          new Promise((resolve) => {
            loader.load(
              photo.image,
              (texture) => {
                this.frames[index].setTexture(texture, this.maxAnisotropy);
                completed += 1;
                onProgress({ completed, total: this.photos.length, missing: missing.length });
                resolve();
              },
              undefined,
              () => {
                missing.push(photo.image);
                completed += 1;
                onProgress({ completed, total: this.photos.length, missing: missing.length });
                resolve();
              },
            );
          }),
      ),
    );

    return { loaded: this.photos.length - missing.length, missing };
  }

  pick(raycaster) {
    const meshes = this.frames.flatMap((frame) => frame.interactiveMeshes);
    const [intersection] = raycaster.intersectObjects(meshes, false);
    if (!intersection) return -1;
    return intersection.object.userData.photoIndex ?? -1;
  }

  focus(index) {
    this.selectedIndex = index;
    this.frames.forEach((frame, frameIndex) => {
      frame.setFocusState(frameIndex === index ? "selected" : "dimmed");
    });
  }

  clearFocus() {
    this.selectedIndex = -1;
    this.frames.forEach((frame) => frame.setFocusState("default"));
  }

  getFrame(index) {
    return this.frames[index];
  }

  getTextures() {
    return this.frames.map((frame) => frame.photoMaterial.map);
  }

  update(elapsed) {
    this.frames.forEach((frame) => frame.update(elapsed));
  }

  dispose() {
    this.frames.forEach((frame) => frame.dispose());
    this.group.traverse((child) => {
      if (child.geometry && !this.frames.includes(child)) child.geometry.dispose();
      if (child.material && !this.frames.includes(child)) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }
}
