import * as THREE from "three";
import { gsap } from "gsap";

export class CameraController {
  constructor(camera, element, { reducedMotion = false, isMobile = false } = {}) {
    this.camera = camera;
    this.element = element;
    this.reducedMotion = reducedMotion;
    this.isMobile = isMobile;
    this.basePosition = camera.position.clone();
    this.baseTarget = new THREE.Vector3();
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.displayPosition = camera.position.clone();
    this.displayTarget = new THREE.Vector3();
    this.positionOffset = new THREE.Vector3();
    this.targetOffset = new THREE.Vector3();
    this.desiredPosition = new THREE.Vector3();
    this.desiredTarget = new THREE.Vector3();
    this.interactionEnabled = true;
    this.isAnimating = false;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", this.handlePointerLeave);
  }

  handlePointerMove(event) {
    if (event.pointerType === "touch") return;
    this.pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    );
  }

  handlePointerLeave() {
    this.pointerTarget.set(0, 0);
  }

  setPose(position, target) {
    this.basePosition.copy(position);
    this.baseTarget.copy(target);
    this.displayPosition.copy(position);
    this.displayTarget.copy(target);
    this.camera.position.copy(position);
    this.camera.lookAt(target);
  }

  setInteractionEnabled(enabled) {
    this.interactionEnabled = enabled;
    if (!enabled) this.pointerTarget.set(0, 0);
  }

  moveTo(position, target, { duration = 2.4, ease = "power3.inOut" } = {}) {
    this.isAnimating = true;
    const actualDuration = this.reducedMotion ? Math.min(duration, 0.35) : duration;

    return new Promise((resolve) => {
      gsap.killTweensOf([this.basePosition, this.baseTarget]);
      const timeline = gsap.timeline({
        defaults: { duration: actualDuration, ease },
        onComplete: () => {
          this.basePosition.copy(position);
          this.baseTarget.copy(target);
          this.isAnimating = false;
          resolve();
        },
      });

      timeline.to(
        this.basePosition,
        { x: position.x, y: position.y, z: position.z },
        0,
      );
      timeline.to(this.baseTarget, { x: target.x, y: target.y, z: target.z }, 0);
    });
  }

  focusObject(object, { distance = 6.2, duration = 1.8 } = {}) {
    const worldPosition = new THREE.Vector3();
    const worldQuaternion = new THREE.Quaternion();
    object.getWorldPosition(worldPosition);
    object.getWorldQuaternion(worldQuaternion);

    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion).normalize();
    const cameraPosition = worldPosition.clone().add(normal.multiplyScalar(distance));
    cameraPosition.y += this.isMobile ? 0.15 : 0.05;

    return this.moveTo(cameraPosition, worldPosition, {
      duration,
      ease: "power3.inOut",
    });
  }

  update(delta) {
    const smoothing = this.reducedMotion ? 1 : 1 - Math.pow(0.001, delta);
    this.pointer.lerp(this.pointerTarget, Math.min(1, smoothing * 0.42));

    const interaction = this.interactionEnabled && !this.isAnimating && !this.reducedMotion ? 1 : 0;
    this.positionOffset.set(
      this.pointer.x * 0.38 * interaction,
      this.pointer.y * 0.22 * interaction,
      0,
    );
    this.targetOffset.set(
      this.pointer.x * 0.22 * interaction,
      this.pointer.y * 0.12 * interaction,
      0,
    );

    this.desiredPosition.copy(this.basePosition).add(this.positionOffset);
    this.desiredTarget.copy(this.baseTarget).add(this.targetOffset);
    this.displayPosition.lerp(this.desiredPosition, Math.min(1, smoothing));
    this.displayTarget.lerp(this.desiredTarget, Math.min(1, smoothing));
    this.camera.position.copy(this.displayPosition);
    this.camera.lookAt(this.displayTarget);
  }

  dispose() {
    window.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("pointerleave", this.handlePointerLeave);
    gsap.killTweensOf([this.basePosition, this.baseTarget]);
  }
}
