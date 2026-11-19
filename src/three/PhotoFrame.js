import * as THREE from "three";
import { gsap } from "gsap";
import { COLORS } from "./world.js";

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function createPlaceholderTexture(index, item) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 820;
  const context = canvas.getContext("2d");

  // Rich espresso-obsidian background
  context.fillStyle = "#120e0b";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createRadialGradient(600, 410, 20, 600, 410, 640);
  glow.addColorStop(0, "rgba(44, 30, 20, 0.95)");
  glow.addColorStop(0.5, "rgba(24, 16, 12, 0.92)");
  glow.addColorStop(1, "rgba(10, 7, 5, 1)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Concentric antique gold borders
  context.strokeStyle = "rgba(212, 175, 55, 0.45)";
  context.lineWidth = 2;
  context.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);
  context.strokeStyle = "rgba(212, 175, 55, 0.2)";
  context.lineWidth = 1;
  context.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  // Corner diamond accents
  const corners = [
    [48, 48],
    [canvas.width - 48, 48],
    [48, canvas.height - 48],
    [canvas.width - 48, canvas.height - 48],
  ];
  context.fillStyle = "rgba(212, 175, 55, 0.65)";
  corners.forEach(([cx, cy]) => {
    context.save();
    context.translate(cx, cy);
    context.rotate(Math.PI / 4);
    context.fillRect(-5, -5, 10, 10);
    context.restore();
  });

  context.textAlign = "center";

  // Monogram circle A · S centered in the frame
  context.beginPath();
  context.arc(600, 380, 52, 0, Math.PI * 2);
  context.strokeStyle = "rgba(212, 175, 55, 0.65)";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "#D4AF37";
  context.font = "500 26px 'Cinzel', Georgia, serif";
  context.letterSpacing = "4px";
  context.fillText("A · S", 602, 389);

  // Subtle milestone mark below
  context.fillStyle = "rgba(212, 175, 55, 0.75)";
  context.font = "500 13px 'Inter', sans-serif";
  context.letterSpacing = "5px";
  context.fillText("10 YEARS OF LOVE", 600, 475);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.isPlaceholder = true;
  return texture;
}

function createLabelTexture(index, title) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 220;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(14, 10, 8, 0.88)";
  roundedRect(context, 28, 24, 968, 170, 18);
  context.strokeStyle = "rgba(212, 175, 55, 0.28)";
  context.lineWidth = 2;
  context.strokeRect(48, 44, 928, 130);
  context.textAlign = "left";
  context.fillStyle = "rgba(212, 175, 55, 0.9)";
  context.font = "500 25px 'Inter', sans-serif";
  context.fillText(String(index + 1).padStart(2, "0"), 78, 112);
  context.fillStyle = "#F5EDE2";
  context.font = "500 45px 'Cormorant Garamond', Georgia, serif";
  context.fillText(title, 154, 118);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class PhotoFrame extends THREE.Group {
  constructor(content, index, { shadows = true, reducedMotion = false } = {}) {
    super();
    this.content = content;
    this.index = index;
    this.shadows = shadows;
    this.reducedMotion = reducedMotion;
    this.basePosition = new THREE.Vector3();
    this.baseRotationY = 0;
    this.baseScale = 1;
    this.interactiveMeshes = [];
    this.visuals = new THREE.Group();
    this.add(this.visuals);

    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      metalness: 0.82,
      roughness: 0.25,
      emissive: COLORS.gold,
      emissiveIntensity: 0.06,
      transparent: true,
    });
    this.backMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.darker,
      metalness: 0.18,
      roughness: 0.65,
      transparent: true,
    });
    this.photoMaterial = new THREE.MeshBasicMaterial({
      map: createPlaceholderTexture(index, content),
      toneMapped: false,
      transparent: true,
    });
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.12,
      transmission: 0.05,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
    });
    this.labelTexture = createLabelTexture(index, content.title);
    this.labelMaterial = new THREE.MeshBasicMaterial({
      map: this.labelTexture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });

    this.buildFrame(4.15, 2.85);
  }

  clearVisuals() {
    this.visuals.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
    });
    this.visuals.clear();
    this.interactiveMeshes = [];
  }

  buildFrame(photoWidth, photoHeight) {
    this.clearVisuals();
    this.photoWidth = photoWidth;
    this.photoHeight = photoHeight;
    const border = 0.2;
    const outerWidth = photoWidth + border * 2;
    const outerHeight = photoHeight + border * 2;

    const backing = new THREE.Mesh(
      new THREE.BoxGeometry(outerWidth + 0.1, outerHeight + 0.1, 0.18),
      this.backMaterial,
    );
    backing.position.z = -0.1;
    backing.castShadow = this.shadows;
    backing.receiveShadow = this.shadows;

    const horizontalGeometry = new THREE.BoxGeometry(outerWidth + 0.12, border, 0.28);
    const verticalGeometry = new THREE.BoxGeometry(border, outerHeight - border, 0.28);
    const top = new THREE.Mesh(horizontalGeometry, this.goldMaterial);
    const bottom = new THREE.Mesh(horizontalGeometry.clone(), this.goldMaterial);
    const left = new THREE.Mesh(verticalGeometry, this.goldMaterial);
    const right = new THREE.Mesh(verticalGeometry.clone(), this.goldMaterial);
    top.position.set(0, outerHeight / 2 - border / 2, 0.04);
    bottom.position.set(0, -outerHeight / 2 + border / 2, 0.04);
    left.position.set(-outerWidth / 2 + border / 2, 0, 0.04);
    right.position.set(outerWidth / 2 - border / 2, 0, 0.04);
    [top, bottom, left, right].forEach((part) => {
      part.castShadow = this.shadows;
    });

    this.photoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(photoWidth, photoHeight),
      this.photoMaterial,
    );
    this.photoMesh.position.z = 0.055;
    this.photoMesh.userData.photoIndex = this.index;

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(photoWidth, photoHeight), this.glassMaterial);
    glass.position.z = 0.075;
    glass.userData.photoIndex = this.index;

    this.hitArea = new THREE.Mesh(
      new THREE.PlaneGeometry(outerWidth + 0.35, outerHeight + 0.35),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    this.hitArea.position.z = 0.09;
    this.hitArea.userData.photoIndex = this.index;

    const labelWidth = Math.max(3.7, Math.min(5.2, outerWidth + 0.45));
    this.labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(labelWidth, labelWidth * (220 / 1024)),
      this.labelMaterial,
    );
    this.labelMesh.position.set(0, -outerHeight / 2 - 0.58, 0.035);

    this.visuals.add(backing, top, bottom, left, right, this.photoMesh, glass, this.hitArea, this.labelMesh);
    this.interactiveMeshes = [this.hitArea, this.photoMesh, glass];
  }

  setTexture(texture, maxAnisotropy = 1) {
    const image = texture.image;
    const aspect = image?.naturalWidth
      ? image.naturalWidth / image.naturalHeight
      : image?.width && image?.height
        ? image.width / image.height
        : 1.45;

    let width;
    let height;
    if (aspect >= 1) {
      width = 4.25;
      height = width / aspect;
      if (height < 2.45) {
        height = 2.45;
        width = Math.min(4.8, height * aspect);
      }
    } else {
      height = 3.75;
      width = Math.max(2.55, height * aspect);
    }

    const previousTexture = this.photoMaterial.map;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    texture.needsUpdate = true;
    this.photoMaterial.map = texture;
    this.photoMaterial.needsUpdate = true;
    this.buildFrame(width, height);

    if (previousTexture?.userData?.isPlaceholder) previousTexture.dispose();
  }

  setLayout({ position, rotationY = 0, scale = 1 }) {
    this.basePosition.copy(position);
    this.baseRotationY = rotationY;
    this.baseScale = scale;
    this.position.copy(position);
    this.rotation.y = rotationY;
    this.scale.setScalar(scale);
  }

  setFocusState(state) {
    if (this.index === 0 && (state === "selected" || state === "dimmed")) {
      this.hasBeenOpened = true;
      this.goldMaterial.emissiveIntensity = 0.06;
    }
    const dimmed = state === "dimmed";
    const selected = state === "selected";
    const opacity = dimmed ? 0.2 : 1;
    const duration = this.reducedMotion ? 0.1 : 0.6;

    gsap.to([this.photoMaterial, this.goldMaterial, this.backMaterial], {
      opacity,
      duration,
      ease: "sine.out",
    });
    gsap.to(this.labelMaterial, {
      opacity: selected || dimmed ? 0 : 1,
      duration,
      ease: "sine.out",
    });
    gsap.to(this.glassMaterial, { opacity: dimmed ? 0.015 : 0.09, duration });
    gsap.to(this.scale, {
      x: this.baseScale * (selected ? 1.035 : 1),
      y: this.baseScale * (selected ? 1.035 : 1),
      z: this.baseScale * (selected ? 1.035 : 1),
      duration,
      ease: "power2.out",
    });
  }

  update(elapsed) {
    if (this.reducedMotion) return;
    this.position.y = this.basePosition.y + Math.sin(elapsed * 0.42 + this.index * 1.37) * 0.1;
    this.rotation.z = Math.sin(elapsed * 0.28 + this.index) * 0.005;

    if (this.index === 0 && !this.hasBeenOpened) {
      const pulse = (Math.sin(elapsed * 2.8) + 1) * 0.5;
      this.goldMaterial.emissiveIntensity = 0.06 + pulse * 0.26;
    }
  }

  dispose() {
    gsap.killTweensOf([
      this.photoMaterial,
      this.goldMaterial,
      this.backMaterial,
      this.labelMaterial,
      this.glassMaterial,
      this.scale,
    ]);
    this.clearVisuals();
    this.photoMaterial.map?.dispose();
    this.labelTexture.dispose();
    this.photoMaterial.dispose();
    this.goldMaterial.dispose();
    this.backMaterial.dispose();
    this.labelMaterial.dispose();
    this.glassMaterial.dispose();
  }
}
