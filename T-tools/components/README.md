# Reusable Components

This folder contains reusable code snippets and components for the gallery.

---

## Three.js Components

### PhotoFrame
Location: `src/js/gallery/PhotoFrame.js`
- Creates framed photo display
- Handles texture loading
- Includes spotlight per photo

### Room
Location: `src/js/gallery/Room.js`
- Creates room geometry (walls, floor, ceiling)
- Configurable dimensions
- Includes baseboard detail

### Lighting
Location: `src/js/gallery/Lighting.js`
- Gallery lighting setup
- Track lights simulation
- Configurable intensity

---

## Control Components

### FirstPersonControls
Location: `src/js/controls/FirstPersonControls.js`
- WASD movement
- Mouse look (pointer lock)
- Boundary enforcement

### TouchControls
Location: `src/js/controls/TouchControls.js`
- Virtual joystick for movement
- Touch-to-look
- Mobile optimized

---

## UI Components

### LoadingManager
Location: `src/js/ui/LoadingManager.js`
- Progress tracking
- Loading screen control
- Error display

### PhotoModal
Location: `src/js/ui/PhotoModal.js`
- Full-screen photo viewer
- Photo details display
- Keyboard/click close

---

## Usage Patterns

### Adding a new component

1. Create file in appropriate folder
2. Export class/function
3. Import in main.js or parent component
4. Document usage here

### Component structure

```javascript
/**
 * ComponentName - Brief description
 */
import * as THREE from 'three';

export class ComponentName {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();

    this.init();
  }

  init() {
    // Setup logic
  }

  update(delta) {
    // Frame update logic
  }

  dispose() {
    // Cleanup resources
  }
}
```
