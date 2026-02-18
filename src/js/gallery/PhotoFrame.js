/**
 * PhotoFrame - Creates framed photos to display on walls
 */

import * as THREE from 'three';

export class PhotoFrame {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
    this.photoMesh = null;
    this.spotlight = null;

    this.createFrame();
  }

  createFrame() {
    const { width, height } = this.config.dimensions;
    const frameConfig = this.config.frame || {
      style: 'modern',
      color: '#1a1a1a',
      width: 0.05
    };

    const frameWidth = frameConfig.width;
    const frameDepth = 0.03;

    // Only create frame if style is not "none"
    if (frameConfig.style !== 'none' && frameWidth > 0) {
      const frameColor = new THREE.Color(frameConfig.color);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: frameColor,
        roughness: 0.4,
        metalness: 0.2
      });

      // Frame sides
      const topBottom = new THREE.BoxGeometry(width + frameWidth * 2, frameWidth, frameDepth);
      const leftRight = new THREE.BoxGeometry(frameWidth, height, frameDepth);

      // Top
      const top = new THREE.Mesh(topBottom, frameMaterial);
      top.position.set(0, height / 2 + frameWidth / 2, 0);
      top.castShadow = true;
      this.group.add(top);

      // Bottom
      const bottom = new THREE.Mesh(topBottom, frameMaterial);
      bottom.position.set(0, -height / 2 - frameWidth / 2, 0);
      bottom.castShadow = true;
      this.group.add(bottom);

      // Left
      const left = new THREE.Mesh(leftRight, frameMaterial);
      left.position.set(-width / 2 - frameWidth / 2, 0, 0);
      left.castShadow = true;
      this.group.add(left);

      // Right
      const right = new THREE.Mesh(leftRight, frameMaterial);
      right.position.set(width / 2 + frameWidth / 2, 0, 0);
      right.castShadow = true;
      this.group.add(right);

      // Back panel (behind photo)
      const backGeometry = new THREE.PlaneGeometry(width, height);
      const backMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 1,
        metalness: 0
      });
      const back = new THREE.Mesh(backGeometry, backMaterial);
      back.position.z = -frameDepth / 2;
      this.group.add(back);
    }

    // Photo placeholder (will be replaced with texture)
    const photoGeometry = new THREE.PlaneGeometry(width, height);
    const photoMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0
    });
    this.photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    this.photoMesh.position.z = 0.001;
    this.group.add(this.photoMesh);

    // Add spotlight for this photo
    this.addSpotlight(width, height);
  }

  addSpotlight(width, height) {
    // Use PointLight instead of SpotLight to reduce texture units
    // SpotLights with shadows use too many texture slots (WebGL limit is 16)
    this.spotlight = new THREE.PointLight(0xffffff, 0.8, 4);
    this.spotlight.position.set(0, height / 2 + 0.5, 0.5);
    // No shadows to avoid MAX_TEXTURE_IMAGE_UNITS error
    this.spotlight.castShadow = false;

    this.group.add(this.spotlight);
  }

  async loadPhoto() {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();

      loader.load(
        this.config.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 16;

          // Check if we need to add text overlay
          if (this.config.overlay) {
            this.addTextOverlay(texture);
          } else {
            this.photoMesh.material.map = texture;
            this.photoMesh.material.color = new THREE.Color(0xffffff);
            this.photoMesh.material.needsUpdate = true;
          }

          resolve();
        },
        undefined,
        (error) => {
          console.warn(`Failed to load photo: ${this.config.src}`, error);
          // Keep placeholder color on error
          resolve();
        }
      );
    });
  }

  addTextOverlay(baseTexture) {
    const { width, height } = this.config.dimensions;
    const overlay = this.config.overlay;

    // Create canvas for compositing
    const canvas = document.createElement('canvas');
    const scale = 800; // Higher resolution for text
    canvas.width = scale;
    canvas.height = scale * (height / width);
    const ctx = canvas.getContext('2d');

    // Draw base image with darkening for full overlay
    const img = baseTexture.image;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (overlay.position === 'full') {
      // Store base image for hover toggling
      this._overlayBaseImage = baseTexture.image;
      this._overlayCanvas = canvas;
      this._overlayCtx = ctx;
      this._overlayFontSize = canvas.height * 0.07;

      // Draw normal state (no background)
      this._drawExplication(false);
    } else {
      // Bottom overlay - gradient at bottom only
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);

      // Draw text at bottom
      ctx.fillStyle = overlay.color || '#ffffff';
      ctx.textAlign = 'center';

      const lines = overlay.text.split('\n');
      const lineHeight = canvas.height * 0.08;
      const startY = canvas.height - (lines.length * lineHeight) - canvas.height * 0.05;

      lines.forEach((line, i) => {
        if (i === 0) {
          ctx.font = `bold ${canvas.height * 0.1}px Arial, sans-serif`;
        } else {
          ctx.font = `${canvas.height * 0.05}px Arial, sans-serif`;
        }
        ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
      });
    }

    // Create texture from canvas
    const overlayTexture = new THREE.CanvasTexture(canvas);
    overlayTexture.colorSpace = THREE.SRGBColorSpace;
    overlayTexture.anisotropy = 16;

    this.photoMesh.material.map = overlayTexture;
    this.photoMesh.material.color = new THREE.Color(0xffffff);
    this.photoMesh.material.needsUpdate = true;
  }

  _drawExplication(hovered) {
    const canvas = this._overlayCanvas;
    const ctx = this._overlayCtx;
    const fontSize = this._overlayFontSize;

    // Redraw base image
    ctx.drawImage(this._overlayBaseImage, 0, 0, canvas.width, canvas.height);

    ctx.font = `300 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${fontSize * 0.25}px`;

    const text = 'EXPLICATION';
    const textWidth = ctx.measureText(text).width;
    const padX = fontSize * 0.7;
    const padY = fontSize * 0.35;
    const rectW = textWidth + padX * 2;
    const rectH = fontSize + padY * 2;
    const rectX = canvas.width / 2 - rectW / 2;
    const rectY = canvas.height / 2 - rectH / 2;

    if (hovered) {
      // White pill background on hover
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, rectW, rectH, rectH / 2);
      ctx.fill();
    }

    // Black text always
    ctx.fillStyle = '#000000';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Update texture
    if (this.photoMesh.material.map) {
      this.photoMesh.material.map.needsUpdate = true;
    }
  }

  setHover(hovered) {
    if (!this._overlayCanvas) return;
    if (this._isHovered === hovered) return; // skip if unchanged
    this._isHovered = hovered;
    this._drawExplication(hovered);
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
