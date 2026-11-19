import * as THREE from "three";
import { gsap } from "gsap";
import { CameraController } from "./CameraController.js";
import { Lighting } from "./Lighting.js";
import { Particles } from "./Particles.js";
import { Entrance } from "./Entrance.js";
import { Gallery } from "./Gallery.js";
import { Envelope } from "./Envelope.js";
import { FinalScene } from "./FinalScene.js";
import {
  COLORS,
  SCENE_ANCHORS,
  getCameraFov,
  getCameraPoses,
  getViewportMode,
} from "./world.js";

export class SceneManager {
  constructor(canvas, content, {
    reducedMotion = false,
    viewportMode = getViewportMode(),
    lowPower = false,
  } = {}) {
    this.canvas = canvas;
    this.content = content;
    this.reducedMotion = reducedMotion;
    this.viewportMode = viewportMode;
    this.isMobile = viewportMode === "phone";
    this.lowPower = lowPower;
    this.activeScene = 0;
    this.pointerStart = null;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.darker);
    this.scene.fog = new THREE.FogExp2(COLORS.darker, this.isMobile ? 0.024 : 0.019);

    this.camera = new THREE.PerspectiveCamera(getCameraFov(viewportMode), 1, 0.1, 180);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !lowPower,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = !lowPower;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, viewportMode === "desktop" ? 1.8 : 1.4));

    this.cameraPoses = getCameraPoses(viewportMode);
    this.cameraController = new CameraController(this.camera, canvas, {
      reducedMotion,
      isMobile: viewportMode !== "desktop",
    });
    this.cameraController.setPose(this.cameraPoses[0].position, this.cameraPoses[0].target);
    this.lighting = new Lighting(this.scene, { shadows: !lowPower });

    this.entrance = new Entrance(SCENE_ANCHORS.entrance, {
      shadows: !lowPower,
      reducedMotion,
    });
    this.gallery = new Gallery(content.photos, SCENE_ANCHORS.gallery, {
      viewportMode,
      reducedMotion,
      shadows: !lowPower,
      maxAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
    });
    this.envelope = new Envelope(SCENE_ANCHORS.letter, {
      shadows: !lowPower,
      reducedMotion,
    });
    this.finalScene = new FinalScene(SCENE_ANCHORS.closing, { reducedMotion });
    this.particles = new Particles({
      center: new THREE.Vector3(30, 0.5, 3),
      count: lowPower ? 180 : 460,
      spread: new THREE.Vector3(82, 20, 46),
      opacity: lowPower ? 0.34 : 0.5,
    });

    this.scene.add(
      this.entrance.group,
      this.gallery.group,
      this.envelope.group,
      this.finalScene.group,
      this.particles.points,
    );

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.handleResize = this.handleResize.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.render = this.render.bind(this);
    window.addEventListener("resize", this.handleResize, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("pointerdown", this.handlePointerDown, { passive: true });
    window.addEventListener("pointerup", this.handlePointerUp, { passive: true });
    this.handleResize();
    this.lighting.setMood(0, SCENE_ANCHORS.entrance, { immediate: true });
    this.renderer.setAnimationLoop(this.render);
  }

  async loadAssets(onProgress) {
    const result = await this.gallery.loadTextures(onProgress);
    this.finalScene.setTextures(this.gallery.getTextures());
    return result;
  }

  handlePointerDown(event) {
    if (event.target.closest("button, a, input, nav, [role='button'], .glass-panel, .screen-envelope")) return;
    this.pointerStart = { x: event.clientX, y: event.clientY };
  }

  handlePointerUp(event) {
    if (this.activeScene !== 1 || this.cameraController.isAnimating || !this.pointerStart) return;
    const distance = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
    this.pointerStart = null;
    if (distance > 8) return;

    const bounds = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const index = this.gallery.pick(this.raycaster);
    if (index >= 0) {
      window.dispatchEvent(new CustomEvent("memory:photo-select", { detail: { index } }));
    }
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const nextViewportMode = getViewportMode(width, height);
    const viewportChanged = nextViewportMode !== this.viewportMode;
    this.viewportMode = nextViewportMode;
    this.isMobile = nextViewportMode === "phone";
    this.camera.aspect = width / height;
    this.camera.fov = getCameraFov(nextViewportMode);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, nextViewportMode === "desktop" ? 1.8 : 1.4));
    this.gallery.setViewportMode(nextViewportMode);
    this.cameraController.isMobile = nextViewportMode !== "desktop";
    this.cameraPoses = getCameraPoses(nextViewportMode);

    if (viewportChanged && this.gallery.selectedIndex < 0 && !this.cameraController.isAnimating) {
      const pose = this.cameraPoses[this.activeScene];
      this.cameraController.setPose(pose.position, pose.target);
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.renderer.setAnimationLoop(null);
      this.clock.stop();
      return;
    }
    this.clock.start();
    this.renderer.setAnimationLoop(this.render);
  }

  setBackground(color, duration = 2) {
    const target = new THREE.Color(color);
    const actualDuration = this.reducedMotion ? 0.2 : duration;
    gsap.to(this.scene.background, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: actualDuration,
      ease: "sine.inOut",
    });
    gsap.to(this.scene.fog.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: actualDuration,
      ease: "sine.inOut",
    });
  }

  async enterGallery() {
    this.activeScene = 1;
    this.entrance.group.visible = false;
    this.envelope.group.visible = false;
    this.setBackground(COLORS.dark, 2.8);
    this.lighting.setMood(1, SCENE_ANCHORS.gallery);
    this.cameraController.setInteractionEnabled(false);
    const pose = this.cameraPoses[1];
    await this.cameraController.moveTo(pose.position, pose.target, {
      duration: 1.8,
      ease: "power3.inOut",
    });
    this.cameraController.setInteractionEnabled(true);
  }

  async transitionTo(index) {
    if (index < 0 || index > 4) return;
    if (this.gallery.selectedIndex >= 0) this.gallery.clearFocus();
    this.activeScene = index;
    this.entrance.group.visible = index === 0;
    this.envelope.group.visible = false; // Hide 3D envelope model so it never obstructs the letter or navigation
    const anchors = [
      SCENE_ANCHORS.entrance,
      SCENE_ANCHORS.gallery,
      SCENE_ANCHORS.letter,
      SCENE_ANCHORS.closing,
      SCENE_ANCHORS.closing,
    ];
    const moodIdx = index > 3 ? 3 : index;
    this.lighting.setMood(moodIdx, anchors[moodIdx]);
    this.setBackground(index === 3 ? COLORS.burgundy : index === 0 ? COLORS.darker : COLORS.dark);
    this.cameraController.setInteractionEnabled(false);

    if (index === 3) this.finalScene.reveal();
    const pose = this.cameraPoses[index > 3 ? 3 : index];
    await this.cameraController.moveTo(pose.position, pose.target, {
      duration: index === 3 ? 1.9 : 1.4,
      ease: "power3.inOut",
    });
    this.cameraController.setInteractionEnabled(index === 1);
  }

  async selectPhoto(index) {
    if (index < 0 || index >= this.gallery.frames.length) return;
    this.gallery.focus(index);
    this.cameraController.setInteractionEnabled(false);
    const focusDistance =
      this.viewportMode === "phone"
        ? 7.6
        : this.viewportMode === "tablet"
          ? 7.1
          : this.viewportMode === "compact-landscape"
            ? 6.7
            : 6.25;
    await this.cameraController.focusObject(this.gallery.getFrame(index), {
      distance: focusDistance,
      duration: 1.15,
    });
  }

  async closePhoto() {
    this.gallery.clearFocus();
    const pose = this.cameraPoses[1];
    await this.cameraController.moveTo(pose.position, pose.target, {
      duration: 0.95,
      ease: "power3.inOut",
    });
    this.cameraController.setInteractionEnabled(true);
  }

  async openEnvelope() {
    this.cameraController.setInteractionEnabled(false);
    const focusDistance =
      this.viewportMode === "phone" ? 8.7 : this.viewportMode === "tablet" ? 8.1 : 7.4;
    await Promise.all([
      this.cameraController.focusObject(this.envelope.model, {
        distance: focusDistance,
        duration: 1.25,
      }),
      this.envelope.open(),
    ]);
  }

  async closeLetterAndFinish() {
    await this.envelope.close();
    await this.transitionTo(3);
  }

  render() {
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;
    this.cameraController.update(delta);
    this.entrance.update(elapsed);
    this.gallery.update(elapsed);
    this.envelope.update(elapsed);
    this.finalScene.update(elapsed);
    this.particles.update(elapsed, this.reducedMotion);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointerup", this.handlePointerUp);
    this.cameraController.dispose();
    this.lighting.dispose();
    this.gallery.dispose();
    this.particles.dispose();
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.scene.traverse((object) => {
      gsap.killTweensOf([object, object.position, object.rotation, object.scale]);
      if (object.geometry && !geometries.has(object.geometry)) {
        geometries.add(object.geometry);
        object.geometry.dispose();
      }
      const objectMaterials = object.material
        ? Array.isArray(object.material)
          ? object.material
          : [object.material]
        : [];
      objectMaterials.forEach((material) => {
        if (materials.has(material)) return;
        materials.add(material);
        gsap.killTweensOf(material);
        Object.values(material).forEach((value) => {
          if (value?.isTexture && !textures.has(value)) {
            textures.add(value);
            value.dispose();
          }
        });
        material.dispose();
      });
    });
    gsap.killTweensOf([this.scene.background, this.scene.fog?.color]);
    this.renderer.dispose();
  }
}
