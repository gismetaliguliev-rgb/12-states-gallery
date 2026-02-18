/**
 * KIS-GALLERY - Main Entry Point
 * 3D Virtual Photography Gallery
 */

import * as THREE from 'three';
import { Gallery } from './gallery/Gallery.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { TouchControls } from './controls/TouchControls.js';
import { LoadingManager } from './ui/LoadingManager.js';
import { PhotoModal } from './ui/PhotoModal.js';
import { MobileGallery } from './ui/MobileGallery.js';

// Image protection - disable keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Disable Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12
  if (
    (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) ||
    (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
    e.key === 'F12'
  ) {
    e.preventDefault();
    return false;
  }
});

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.loadingManager = new LoadingManager();
    this.photoModal = new PhotoModal();

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Mode tracking for mobile
    this.mode = 'loading'; // 'loading' | '2d' | '3d'
    this.threeInitialized = false;

    this.init();
  }

  async init() {
    try {
      console.log('Initializing gallery...');

      // Load config first (needed for both modes)
      const response = await fetch('/gallery-config.json');
      this.config = await response.json();

      if (this.isMobile) {
        // Mobile: show 2D gallery by default
        this.loadingManager.updateProgress(50, 'Loading photos...');
        this.mobileGallery = new MobileGallery(this.config, this.photoModal);
        this.loadingManager.updateProgress(100, 'Ready!');

        this.loadingManager.onComplete(() => {
          this.switchTo2D();
        });

        // Setup mode switching buttons
        this.setupModeSwitching();
      } else {
        // Desktop: normal 3D flow
        this.initThreeJS();
      }

      console.log('Gallery initialized successfully!');
    } catch (error) {
      console.error('CRITICAL ERROR:', error);
    }
  }

  async initThreeJS() {
    if (this.threeInitialized) return;
    this.threeInitialized = true;

    // Setup Three.js
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();

    // Add basic light immediately so something is visible
    const basicLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(basicLight);

    // Load gallery and create 3D gallery
    this.loadingManager.updateProgress(20, 'Loading gallery configuration...');

    this.gallery = new Gallery(this.scene, this.config, this.loadingManager);
    await this.gallery.build();

    // Set camera to spawn point
    const spawnPoint = this.config.rooms[0].spawnPoint;
    this.camera.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);

    this.loadingManager.updateProgress(100, 'Ready!');

    // Setup controls
    this.setupControls();

    // Setup interaction
    this.setupInteraction();

    // Setup UI
    this.setupUI();

    // Start render loop
    this.animate();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  setupModeSwitching() {
    const btn3D = document.getElementById('btn-switch-to-3d');
    const btn2D = document.getElementById('btn-switch-to-2d');

    if (btn3D) {
      btn3D.addEventListener('click', () => this.switchTo3D());
    }
    if (btn2D) {
      btn2D.addEventListener('click', () => this.switchTo2D());
    }
  }

  async switchTo3D() {
    this.mode = '3d';

    // Hide 2D gallery
    if (this.mobileGallery) {
      this.mobileGallery.hide();
    }

    // Always hide loading & instructions immediately
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');
    loadingScreen.style.display = 'none';
    document.getElementById('instructions').classList.add('hidden');

    // Show canvas immediately so user sees something
    this.container.style.display = 'block';

    // Initialize Three.js if not yet done
    if (!this.threeInitialized) {
      await this.initThreeJS();
    }

    // Show 3D UI
    document.getElementById('ui-overlay').classList.remove('hidden');
    document.getElementById('mobile-3d-controls').classList.remove('hidden');
    const tapHint = document.getElementById('mobile-tap-hint');
    if (tapHint) tapHint.classList.remove('hidden');
    const rotationWheel = document.getElementById('mobile-rotation-wheel');
    if (rotationWheel) rotationWheel.classList.remove('hidden');

    // Start controls
    if (this.controls) {
      this.controls.lock();
    }
  }

  switchTo2D() {
    this.mode = '2d';

    // Hide 3D elements
    this.container.style.display = 'none';
    document.getElementById('ui-overlay').classList.add('hidden');
    document.getElementById('mobile-3d-controls').classList.add('hidden');
    const tapHint = document.getElementById('mobile-tap-hint');
    if (tapHint) tapHint.classList.add('hidden');
    const rotationWheel = document.getElementById('mobile-rotation-wheel');
    if (rotationWheel) rotationWheel.classList.add('hidden');
    document.getElementById('instructions').classList.add('hidden');
    const ls = document.getElementById('loading-screen');
    ls.classList.add('fade-out');
    ls.style.display = 'none';

    // Unlock 3D controls
    if (this.controls) {
      this.controls.unlock();
    }

    // Show 2D gallery
    if (this.mobileGallery) {
      this.mobileGallery.show();
    }
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Shadows disabled to avoid WebGL MAX_TEXTURE_IMAGE_UNITS limit
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.container.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.6, 5);
  }

  setupControls() {
    if (this.isMobile) {
      this.controls = new TouchControls(this.camera, this.renderer.domElement);
      // Don't show old joystick controls
    } else {
      this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
    }

    // Set movement bounds based on room dimensions
    if (this.config) {
      const room = this.config.rooms[0];
      this.controls.setBounds({
        minX: -room.dimensions.width / 2 + 0.5,
        maxX: room.dimensions.width / 2 - 0.5,
        minZ: -room.dimensions.depth / 2 + 0.5,
        maxZ: room.dimensions.depth / 2 - 0.5
      });
    }

    // Setup photo waypoints for mobile auto-walk
    if (this.isMobile && this.controls.setWaypoints) {
      this.controls.setWaypoints(this.config.photos, this.config.rooms[0]);
    }

  }

  setupInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Click/tap to interact with photos
    const handleInteract = (event) => {
      if (this.photoModal.isOpen) return;
      if (this.mode === '2d') return;
      if (!this.controls.isLocked && !this.isMobile) return;

      if (this.isMobile && event.type === 'click') {
        // On mobile: raycast from tap position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      } else {
        // Desktop: center crosshair
        this.mouse.x = 0;
        this.mouse.y = 0;
      }

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.gallery.photoMeshes, true);

      if (intersects.length > 0) {
        const photoData = this.gallery.getPhotoData(intersects[0].object);
        if (photoData) {
          this.photoModal.open(photoData);
          this.controls.unlock();
        }
      }
    };

    window.addEventListener('click', handleInteract);

    // Hover detection for photo hint and info
    this.hoveredPhoto = null;
    this.photoHint = document.getElementById('photo-hint');
    this.photoInfo = document.getElementById('photo-info');
    this.photoInfoTitle = document.getElementById('photo-info-title');
    this.photoInfoDescription = document.getElementById('photo-info-description');
  }

  setupUI() {
    const instructions = document.getElementById('instructions');
    const startButton = document.getElementById('start-button');
    const uiOverlay = document.getElementById('ui-overlay');

    if (!this.isMobile) {
      // Desktop: show instructions when loading complete
      this.loadingManager.onComplete(() => {
        console.log('Loading complete, showing instructions');
        instructions.classList.remove('hidden');
      });
    }

    // Start button
    startButton.addEventListener('click', () => {
      console.log('Start button clicked');
      instructions.classList.add('hidden');
      uiOverlay.classList.remove('hidden');
      console.log('Calling controls.lock()');
      this.controls.lock();
      console.log('controls.lock() called, isLocked:', this.controls.isLocked);
    });

    // Show instructions when controls unlocked (desktop)
    if (!this.isMobile) {
      document.addEventListener('pointerlockchange', () => {
        if (!document.pointerLockElement && !this.photoModal.isOpen) {
          instructions.classList.remove('hidden');
          uiOverlay.classList.add('hidden');
        }
      });
    }

    // Modal close handler
    this.photoModal.onClose(() => {
      if (!this.isMobile) {
        this.controls.lock();
      } else if (this.mode === '3d') {
        this.controls.lock();
      }
    });
  }

  updatePhotoHover() {
    if (!this.controls.isLocked && !this.isMobile) {
      // Hide info when not in gallery mode
      this.photoInfo.classList.add('hidden');
      return;
    }

    // Skip hover on mobile (no crosshair)
    if (this.isMobile) return;

    this.mouse.x = 0;
    this.mouse.y = 0;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.gallery.photoMeshes, true);

    if (intersects.length > 0 && intersects[0].distance < 5) {
      this.photoHint.classList.remove('hidden');
      this.renderer.domElement.style.cursor = 'pointer';

      const hoveredMesh = intersects[0].object;

      // Hover effect for overlay photos (EXPLICATION)
      if (this._lastHoveredFrame && this._lastHoveredMesh !== hoveredMesh) {
        this._lastHoveredFrame.setHover(false);
      }
      const frame = this.gallery.getFrame(hoveredMesh);
      if (frame) {
        frame.setHover(true);
        this._lastHoveredFrame = frame;
        this._lastHoveredMesh = hoveredMesh;
      }

      // Show photo info in bottom left corner
      const photoData = this.gallery.getPhotoData(hoveredMesh);
      if (photoData) {
        this.photoInfoTitle.textContent = photoData.title || '';
        this.photoInfoDescription.textContent = photoData.description || '';
        this.photoInfo.classList.remove('hidden');
      }
    } else {
      this.photoHint.classList.add('hidden');
      this.photoInfo.classList.add('hidden');
      this.renderer.domElement.style.cursor = 'default';

      // Remove hover from last frame
      if (this._lastHoveredFrame) {
        this._lastHoveredFrame.setHover(false);
        this._lastHoveredFrame = null;
        this._lastHoveredMesh = null;
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock ? this.clock.getDelta() : 0;
    if (!this.clock) this.clock = new THREE.Clock();

    // Update controls
    if (this.controls) {
      this.controls.update(delta);
    }

    // Update hover state
    if (this.gallery && this.gallery.photoMeshes.length > 0) {
      this.updatePhotoHover();
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}

// Start the app
new App();
