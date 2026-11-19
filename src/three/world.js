import * as THREE from "three";

export const COLORS = {
  burgundy: 0x1a120e,
  wine: 0x261a14,
  dark: 0x140f0c,
  darker: 0x0c0806,
  gold: 0xd4af37,
  ivory: 0xf5ede2,
  rose: 0xc89d68,
  white: 0xfffcf7,
};

export const SCENE_ANCHORS = {
  entrance: new THREE.Vector3(0, 0, 25),
  gallery: new THREE.Vector3(0, -0.6, 0),
  letter: new THREE.Vector3(30, 0, -1),
  closing: new THREE.Vector3(60, 0, -1),
};

export function getViewportMode(width = window.innerWidth, height = window.innerHeight) {
  if (height <= 560 && width > height && width <= 1000) return "compact-landscape";
  if (width < 720) return "phone";
  if (width <= 1100 && height > width) return "tablet";
  return "desktop";
}

export function getCameraFov(viewportMode = "desktop") {
  if (viewportMode === "phone") return 51;
  if (viewportMode === "tablet") return 47;
  if (viewportMode === "compact-landscape") return 46;
  return 43;
}

export function getCameraPoses(viewportMode = "desktop") {
  const isPhone = viewportMode === "phone";
  const isTablet = viewportMode === "tablet";
  const isCompactLandscape = viewportMode === "compact-landscape";
  const galleryDistance = isPhone ? 21 : isTablet ? 23.5 : isCompactLandscape ? 17.5 : 16.5;
  const sceneDistance = isPhone ? 14 : isTablet ? 13.5 : isCompactLandscape ? 11.8 : 11.5;

  return [
    {
      position: new THREE.Vector3(0, 0.4, isPhone || isTablet ? 39 : 37),
      target: new THREE.Vector3(0, 0.2, 25),
    },
    {
      position: new THREE.Vector3(0, isPhone ? -0.4 : -0.2, galleryDistance),
      target: new THREE.Vector3(0, isPhone ? -1.0 : -0.7, -0.6),
    },
    {
      position: new THREE.Vector3(30, 0.4, sceneDistance),
      target: new THREE.Vector3(30, 0.15, -1),
    },
    {
      position: new THREE.Vector3(60, 0.5, isPhone ? 15 : isTablet ? 14 : 12),
      target: new THREE.Vector3(60, 0, -2.5),
    },
  ];
}
