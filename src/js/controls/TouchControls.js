/**
 * TouchControls - Touch-based controls for mobile devices
 * Left joystick: move forward/back/left/right
 * Right side swipe: look around (rotate camera)
 * Rotation wheel: dedicated yaw rotation
 */

import * as THREE from 'three';

export class TouchControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.isLocked = true;
    this.moveSpeed = 3.5;
    this.lookSpeed = 0.003;
    this.autoWalkSpeed = 1.5;

    // Joystick state (left side)
    this.joystickTouch = null;
    this.joystickOrigin = { x: 0, y: 0 };
    this.joystickDelta = { x: 0, y: 0 }; // -1..1
    this.joystickEl = null;
    this.joystickStickEl = null;
    this.joystickRadius = 50;

    // Look/swipe state (right side of screen)
    this.lookTouch = null;
    this.lastLookPosition = { x: 0, y: 0 };
    this.touchStartTime = 0;
    this.touchMoved = false;

    // Rotation wheel state
    this.rotationWheelEl = null;
    this.rotationTouch = null;
    this.rotationLastX = 0;
    this.rotationSpeed = 0.012;

    // Euler for camera rotation
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    // Bounds
    this.bounds = null;

    // Velocity
    this.velocity = new THREE.Vector3();

    // Auto-walk / waypoints
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.autoWalking = false; // off by default — user drives manually
    this.isMovingToWaypoint = false;
    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();

    this.init();
  }

  init() {
    // Canvas touch for look (right side swipe)
    this.domElement.addEventListener('touchstart', (e) => this.onCanvasTouchStart(e), { passive: false });
    this.domElement.addEventListener('touchmove', (e) => this.onCanvasTouchMove(e), { passive: false });
    this.domElement.addEventListener('touchend', (e) => this.onCanvasTouchEnd(e), { passive: false });

    // Build joystick UI
    this._buildJoystick();

    // Rotation wheel
    this._bindRotationWheel();
  }

  _buildJoystick() {
    // Create joystick container
    const container = document.createElement('div');
    container.id = 'mobile-joystick';
    container.innerHTML = `
      <div class="joystick-base-ring">
        <div class="joystick-stick-dot"></div>
      </div>
    `;
    document.body.appendChild(container);

    this.joystickEl = container;
    this.joystickStickEl = container.querySelector('.joystick-stick-dot');

    // Touch events on joystick
    container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      this.joystickTouch = touch.identifier;
      const rect = container.getBoundingClientRect();
      this.joystickOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      this._updateJoystick(touch.clientX, touch.clientY);
      // Stop auto-walk when user takes manual control
      this.isMovingToWaypoint = false;
      this.autoWalking = false;
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.joystickTouch) {
          this._updateJoystick(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystickTouch) {
          this.joystickTouch = null;
          this.joystickDelta = { x: 0, y: 0 };
          // Reset stick to center
          if (this.joystickStickEl) {
            this.joystickStickEl.style.transform = 'translate(-50%, -50%)';
          }
          break;
        }
      }
    }, { passive: false });
  }

  _updateJoystick(clientX, clientY) {
    const dx = clientX - this.joystickOrigin.x;
    const dy = clientY - this.joystickOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = this.joystickRadius;
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    // Normalize to -1..1
    this.joystickDelta.x = stickX / maxDist;
    this.joystickDelta.y = stickY / maxDist;

    // Move stick dot visually
    if (this.joystickStickEl) {
      this.joystickStickEl.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;
    }
  }

  _bindRotationWheel() {
    const el = document.getElementById('mobile-rotation-wheel');
    if (!el) return;
    this.rotationWheelEl = el;
    const track = el.querySelector('.rotation-wheel-track');
    if (!track) return;

    track.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      this.rotationTouch = touch.identifier;
      this.rotationLastX = touch.clientX;
      this.isMovingToWaypoint = false;
      this.autoWalking = false;
    }, { passive: false });

    track.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === this.rotationTouch) {
          const deltaX = touch.clientX - this.rotationLastX;
          this.rotationLastX = touch.clientX;

          this.euler.setFromQuaternion(this.camera.quaternion);
          this.euler.y -= deltaX * this.rotationSpeed;
          this.camera.quaternion.setFromEuler(this.euler);

          const indicator = el.querySelector('.rotation-wheel-indicator');
          if (indicator) {
            const angle = (this.euler.y * 180 / Math.PI) % 360;
            indicator.style.transform = `rotate(${angle}deg)`;
          }
          break;
        }
      }
    }, { passive: false });

    track.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.rotationTouch) {
          this.rotationTouch = null;
          break;
        }
      }
    }, { passive: false });
  }

  lock() {
    this.isLocked = true;
    if (this.joystickEl) this.joystickEl.classList.remove('hidden');
  }

  unlock() {
    this.isLocked = false;
    this.autoWalking = false;
    if (this.joystickEl) this.joystickEl.classList.add('hidden');
  }

  // Build waypoints from photo positions
  setWaypoints(photos, room) {
    const { width, depth } = room.dimensions;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const viewDistance = 2.5;

    this.waypoints = [];

    for (const photo of photos) {
      if (photo.id === 'photo-cover') continue;

      const pos = photo.position;
      let viewX, viewZ, lookX, lookZ;

      switch (pos.wall) {
        case 'north':
          viewX = pos.x; viewZ = -halfDepth + viewDistance;
          lookX = pos.x; lookZ = -halfDepth;
          break;
        case 'south':
          viewX = pos.x; viewZ = halfDepth - viewDistance;
          lookX = pos.x; lookZ = halfDepth;
          break;
        case 'east':
          viewX = halfWidth - viewDistance; viewZ = pos.x;
          lookX = halfWidth; lookZ = pos.x;
          break;
        case 'west':
          viewX = -halfWidth + viewDistance; viewZ = pos.x;
          lookX = -halfWidth; lookZ = pos.x;
          break;
      }

      this.waypoints.push({
        photo,
        position: new THREE.Vector3(viewX, 1.6, viewZ),
        lookAt: new THREE.Vector3(lookX, pos.y, lookZ)
      });
    }

    // Start at first waypoint position but don't auto-walk
    if (this.waypoints.length > 0) {
      this.camera.position.copy(this.waypoints[0].position);
      this.smoothLookAt(this.waypoints[0].lookAt, 1);
    }
  }

  moveToWaypoint(index) {
    if (index < 0 || index >= this.waypoints.length) return;
    this.currentWaypointIndex = index;
    const wp = this.waypoints[index];
    this.targetPosition.copy(wp.position);
    this.targetLookAt.copy(wp.lookAt);
    this.isMovingToWaypoint = true;
  }

  goToNextWaypoint() {
    const next = (this.currentWaypointIndex + 1) % this.waypoints.length;
    this.moveToWaypoint(next);
    this.autoWalking = true;
  }

  goToPrevWaypoint() {
    const prev = (this.currentWaypointIndex - 1 + this.waypoints.length) % this.waypoints.length;
    this.moveToWaypoint(prev);
    this.autoWalking = true;
  }

  toggleAutoWalk() {
    this.autoWalking = !this.autoWalking;
    if (this.autoWalking && !this.isMovingToWaypoint) {
      this.goToNextWaypoint();
    }
    return !this.autoWalking;
  }

  // Canvas touch — right side = look, left side = nothing (joystick handles it)
  onCanvasTouchStart(event) {
    if (event.target !== this.domElement) return;
    event.preventDefault();

    // Loop all new touches — pick one on the right half for look
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      // Right half of screen → look/rotate
      if (touch.clientX > window.innerWidth / 2 && this.lookTouch === null) {
        this.lookTouch = touch.identifier;
        this.lastLookPosition = { x: touch.clientX, y: touch.clientY };
        this.touchStartTime = Date.now();
        this.touchMoved = false;
        break;
      }
    }
  }

  onCanvasTouchMove(event) {
    event.preventDefault();

    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];

      if (touch.identifier === this.lookTouch) {
        const deltaX = touch.clientX - this.lastLookPosition.x;
        const deltaY = touch.clientY - this.lastLookPosition.y;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          this.touchMoved = true;
        }

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= deltaX * this.lookSpeed;
        this.euler.x -= deltaY * this.lookSpeed;
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);

        this.lastLookPosition = { x: touch.clientX, y: touch.clientY };

        if (this.isMovingToWaypoint) {
          this.isMovingToWaypoint = false;
          this.autoWalking = false;
        }
      }
    }
  }

  onCanvasTouchEnd(event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      if (event.changedTouches[i].identifier === this.lookTouch) {
        this.lookTouch = null;
      }
    }
  }

  setBounds(bounds) {
    this.bounds = bounds;
  }

  update(delta) {
    if (!this.isLocked) return;

    // Joystick movement
    const jx = this.joystickDelta.x;
    const jy = this.joystickDelta.y;

    if (Math.abs(jx) > 0.05 || Math.abs(jy) > 0.05) {
      // Get camera forward and right vectors (horizontal plane only)
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      const speed = this.moveSpeed * delta;
      this.camera.position.addScaledVector(forward, -jy * speed);
      this.camera.position.addScaledVector(right, jx * speed);

      // Stop auto-walk if user is manually moving
      if (this.isMovingToWaypoint) {
        this.isMovingToWaypoint = false;
        this.autoWalking = false;
      }
    }

    // Auto-walk to waypoint (when triggered by ◀ ▶ buttons)
    if (this.isMovingToWaypoint) {
      const speed = this.autoWalkSpeed * delta;
      const direction = new THREE.Vector3().subVectors(this.targetPosition, this.camera.position);
      const distance = direction.length();

      if (distance < 0.1) {
        this.camera.position.copy(this.targetPosition);
        this.isMovingToWaypoint = false;
        this.smoothLookAt(this.targetLookAt, delta);

        if (this.autoWalking) {
          setTimeout(() => {
            if (this.autoWalking && !this.isMovingToWaypoint) {
              this.goToNextWaypoint();
            }
          }, 3000);
        }
      } else {
        direction.normalize();
        this.camera.position.addScaledVector(direction, Math.min(speed, distance));
        this.smoothLookAt(this.targetLookAt, delta);
      }
    }

    // Apply bounds
    if (this.bounds) {
      this.camera.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.camera.position.x));
      this.camera.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.camera.position.z));
    }
  }

  smoothLookAt(target, delta) {
    const targetDir = new THREE.Vector3().subVectors(target, this.camera.position).normalize();
    const targetEuler = new THREE.Euler();
    targetEuler.y = Math.atan2(-targetDir.x, -targetDir.z);
    targetEuler.x = Math.asin(Math.max(-1, Math.min(1, targetDir.y)));

    this.euler.setFromQuaternion(this.camera.quaternion);
    const lerpFactor = Math.min(1, delta * 3);
    this.euler.x += (targetEuler.x - this.euler.x) * lerpFactor;
    this.euler.y += (targetEuler.y - this.euler.y) * lerpFactor;
    this.camera.quaternion.setFromEuler(this.euler);
  }
}
