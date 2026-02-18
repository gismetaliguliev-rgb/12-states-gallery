/**
 * FirstPersonControls - WASD + Mouse look controls for desktop
 */

import * as THREE from 'three';

export class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.isLocked = false;
    this.moveSpeed = 5;
    this.lookSpeed = 0.002;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    // Rotation
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    // Bounds
    this.bounds = null;

    // Vectors for movement calculation
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.init();
  }

  init() {
    // Pointer lock
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) {
        this.lock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
      console.log('pointerlockchange: isLocked =', this.isLocked);
    });

    // Mouse movement
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));

    // Keyboard
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  lock() {
    console.log('FirstPersonControls.lock() called');
    console.log('domElement:', this.domElement);
    try {
      this.domElement.requestPointerLock();
      console.log('requestPointerLock() called successfully');
    } catch (err) {
      console.error('requestPointerLock() error:', err);
    }
  }

  unlock() {
    document.exitPointerLock();
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * this.lookSpeed;
    this.euler.x -= movementY * this.lookSpeed;

    // Clamp vertical rotation
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
    }
  }

  setBounds(bounds) {
    this.bounds = bounds;
  }

  update(delta) {
    if (!this.isLocked) return;

    // Calculate movement direction
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    // Apply movement
    const speed = this.moveSpeed * delta;

    if (this.moveForward || this.moveBackward) {
      this.velocity.z = -this.direction.z * speed;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x = this.direction.x * speed;
    }

    // Move camera
    this.camera.translateX(this.velocity.x);
    this.camera.translateZ(this.velocity.z);

    // Apply bounds
    if (this.bounds) {
      this.camera.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.camera.position.x));
      this.camera.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.camera.position.z));
    }

    // Reset velocity
    this.velocity.x = 0;
    this.velocity.z = 0;
  }
}
