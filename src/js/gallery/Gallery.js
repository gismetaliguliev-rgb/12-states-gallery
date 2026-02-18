/**
 * Gallery - Main gallery class that builds the 3D space
 */

import * as THREE from 'three';
import { Room } from './Room.js';
import { PhotoFrame } from './PhotoFrame.js';
import { Lighting } from './Lighting.js';

export class Gallery {
  constructor(scene, config, loadingManager) {
    this.scene = scene;
    this.config = config;
    this.loadingManager = loadingManager;

    this.rooms = [];
    this.photoFrames = [];
    this.photoMeshes = [];
    this.photoDataMap = new Map(); // Maps mesh to photo data
  }

  async build() {
    // Create rooms
    for (const roomConfig of this.config.rooms) {
      const room = new Room(roomConfig, this.config.gallery.settings);
      this.scene.add(room.group);
      this.rooms.push(room);
    }

    this.loadingManager.updateProgress(40, 'Building gallery rooms...');

    // Add lighting
    const lighting = new Lighting(this.config.gallery.settings);
    this.scene.add(lighting.group);

    this.loadingManager.updateProgress(50, 'Setting up lighting...');

    // Create photo frames and load textures
    const totalPhotos = this.config.photos.length;
    let loadedPhotos = 0;

    for (const photoConfig of this.config.photos) {
      const frame = new PhotoFrame(photoConfig);
      await frame.loadPhoto();

      // Position the frame based on wall and position
      this.positionFrame(frame, photoConfig.position);

      this.scene.add(frame.group);
      this.photoFrames.push(frame);

      // Store photo mesh for raycasting
      this.photoMeshes.push(frame.photoMesh);
      this.photoDataMap.set(frame.photoMesh, photoConfig);
      this.frameMap = this.frameMap || new Map();
      this.frameMap.set(frame.photoMesh, frame);

      loadedPhotos++;
      const progress = 50 + (loadedPhotos / totalPhotos) * 45;
      this.loadingManager.updateProgress(progress, `Loading photos (${loadedPhotos}/${totalPhotos})...`);
    }

    this.loadingManager.updateProgress(95, 'Finalizing...');
  }

  positionFrame(frame, position) {
    const room = this.rooms.find(r => r.id === position.room);
    if (!room) return;

    const { width, height, depth } = room.config.dimensions;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    let x = position.x;
    let y = position.y;
    let z = 0;
    let rotation = 0;

    switch (position.wall) {
      case 'north':
        z = -halfDepth + 0.05;
        rotation = 0;
        break;
      case 'south':
        z = halfDepth - 0.05;
        rotation = Math.PI;
        break;
      case 'east':
        z = position.x;
        x = halfWidth - 0.05;
        rotation = -Math.PI / 2;
        break;
      case 'west':
        z = position.x;
        x = -halfWidth + 0.05;
        rotation = Math.PI / 2;
        break;
    }

    frame.group.position.set(x, y, z);
    frame.group.rotation.y = rotation;
  }

  getFrame(mesh) {
    if (this.frameMap && this.frameMap.has(mesh)) {
      return this.frameMap.get(mesh);
    }
    return null;
  }

  getPhotoData(mesh) {
    // Check if mesh is the photo mesh or part of frame
    if (this.photoDataMap.has(mesh)) {
      return this.photoDataMap.get(mesh);
    }

    // Check parent
    if (mesh.parent && this.photoDataMap.has(mesh.parent)) {
      return this.photoDataMap.get(mesh.parent);
    }

    return null;
  }

  dispose() {
    // Cleanup all resources
    for (const frame of this.photoFrames) {
      frame.dispose();
    }
    for (const room of this.rooms) {
      room.dispose();
    }
  }
}
