# Technical Specification — KIS-GALLERY

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    KIS-GALLERY                          │
├─────────────────────────────────────────────────────────┤
│  Frontend (Static)           │  CMS (Local/Admin)       │
│  ├── index.html              │  ├── admin.html          │
│  ├── Three.js Gallery        │  ├── Photo Upload        │
│  ├── Controls                │  ├── Position Editor     │
│  └── Asset Loading           │  └── JSON Export         │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                           │
│  gallery-config.json ← Photos, positions, metadata      │
│  /assets/photos/     ← Optimized images                 │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core
| Technology | Purpose | Why |
|------------|---------|-----|
| **Three.js** | 3D rendering | Industry standard, great docs |
| **Vite** | Build tool | Fast, modern, simple config |
| **Vanilla JS** | Logic | No framework overhead |
| **CSS** | Styling | Simple, no preprocessor needed |

### Development
| Tool | Purpose |
|------|---------|
| **ESLint** | Code quality |
| **Prettier** | Formatting |
| **Live Server** | Development |

### Deployment
| Service | Purpose |
|---------|---------|
| **Netlify/Vercel** | Static hosting |
| **Cloudinary** (optional) | Image CDN |

---

## File Structure

```
KIS-GALLERY/
├── src/
│   ├── js/
│   │   ├── main.js              # Entry point
│   │   ├── gallery/
│   │   │   ├── Gallery.js       # Main gallery class
│   │   │   ├── Room.js          # Room geometry
│   │   │   ├── PhotoFrame.js    # Photo display
│   │   │   └── Lighting.js      # Gallery lighting
│   │   ├── controls/
│   │   │   ├── FirstPerson.js   # WASD + mouse
│   │   │   └── TouchControls.js # Mobile support
│   │   ├── ui/
│   │   │   ├── LoadingScreen.js # Loading state
│   │   │   ├── PhotoModal.js    # Photo details
│   │   │   └── Instructions.js  # Control hints
│   │   └── utils/
│   │       ├── imageLoader.js   # Lazy loading
│   │       └── config.js        # Configuration
│   ├── css/
│   │   ├── main.css
│   │   ├── loading.css
│   │   └── ui.css
│   └── assets/
│       ├── photos/              # Gallery photos
│       └── models/              # 3D models (frames, etc)
├── cms-admin/
│   ├── index.html               # Admin interface
│   ├── admin.js                 # CMS logic
│   └── admin.css                # Admin styles
├── public/
│   ├── gallery-config.json      # Gallery data
│   └── favicon.ico
├── index.html                   # Main entry
├── package.json
├── vite.config.js
└── README.md
```

---

## Data Structure

### gallery-config.json
```json
{
  "gallery": {
    "name": "Kis Photography",
    "description": "Professional photography portfolio",
    "settings": {
      "wallColor": "#f5f5f5",
      "floorColor": "#2a2a2a",
      "ambientLight": 0.6,
      "spotlightIntensity": 1.2
    }
  },
  "rooms": [
    {
      "id": "main",
      "name": "Main Gallery",
      "dimensions": {
        "width": 20,
        "height": 4,
        "depth": 15
      },
      "spawnPoint": { "x": 0, "y": 1.6, "z": 5 }
    }
  ],
  "photos": [
    {
      "id": "photo-001",
      "src": "/assets/photos/landscape-sunset.jpg",
      "thumbnail": "/assets/photos/thumbs/landscape-sunset.jpg",
      "title": "Sunset Over Mountains",
      "description": "Captured in the Alps, 2024",
      "dimensions": { "width": 1.5, "height": 1 },
      "position": {
        "room": "main",
        "wall": "north",
        "x": -3,
        "y": 1.6
      },
      "frame": {
        "style": "modern",
        "color": "#1a1a1a",
        "width": 0.05
      }
    }
  ]
}
```

---

## 3D Gallery Implementation

### Room Geometry
```javascript
// Simple box room with customizable dimensions
class Room {
  constructor(config) {
    this.width = config.width;
    this.height = config.height;
    this.depth = config.depth;

    this.createWalls();
    this.createFloor();
    this.createCeiling();
  }

  createWalls() {
    // North, South, East, West walls
    // Using PlaneGeometry with MeshStandardMaterial
  }
}
```

### Photo Frame
```javascript
class PhotoFrame {
  constructor(photoConfig) {
    this.group = new THREE.Group();

    // Frame border (BoxGeometry)
    // Photo texture (PlaneGeometry + TextureLoader)
    // Spotlight for this photo
  }

  async loadTexture(src) {
    // Lazy load with placeholder
  }
}
```

### Controls
```javascript
// First-person controls
class FirstPersonControls {
  constructor(camera, domElement) {
    this.moveSpeed = 5;
    this.lookSpeed = 0.002;

    // WASD movement
    // Mouse look (pointer lock)
    // Collision detection with walls
  }
}
```

---

## CMS Implementation

### Admin Interface Features
1. **Photo List View**
   - Thumbnail grid
   - Upload new photo
   - Delete photo
   - Edit metadata

2. **Gallery Editor**
   - 2D top-down view of room
   - Drag photos to position
   - Wall selection dropdown
   - Height adjustment slider

3. **Settings Panel**
   - Wall color picker
   - Lighting adjustments
   - Room dimensions

### Data Flow
```
Upload Photo → Resize/Optimize → Save to /assets/photos/
                                       ↓
                              Update gallery-config.json
                                       ↓
                              Gallery reads new config
```

---

## Performance Optimizations

### Image Loading
- Progressive JPEG for photos
- Generate thumbnails for lazy loading
- Use `loading="lazy"` in texture loader
- LOD (Level of Detail) for distant photos

### 3D Rendering
- Frustum culling (automatic in Three.js)
- Limit draw calls (merge static geometry)
- Use instanced meshes for frames
- Shadow maps only for key lights

### Bundle Size
- Tree-shake Three.js imports
- Code split admin panel
- Lazy load UI components

---

## Browser Compatibility

### Required Features
- WebGL 2.0
- ES6+ JavaScript
- Pointer Lock API
- File API (for CMS)

### Fallbacks
- WebGL detection with message
- Touch controls for mobile
- Simplified mode for low-end devices

---

## Security Considerations

### CMS
- Local-only operation (no server)
- File validation on upload
- JSON sanitization

### Public Site
- No user input on public gallery
- Static file serving only
- CSP headers recommended

---

## Development Workflow

### Commands
```bash
npm run dev        # Start dev server (Vite)
npm run build      # Production build
npm run preview    # Preview production build
npm run cms        # Start CMS admin server
npm run optimize   # Optimize images
```

### Git Workflow
- `main` branch = production
- `develop` branch = development
- Feature branches for new features

---

## Deployment Checklist

- [ ] Run production build
- [ ] Optimize all images
- [ ] Test on mobile devices
- [ ] Check WebGL compatibility
- [ ] Verify gallery-config.json
- [ ] Set up CDN for images
- [ ] Configure custom domain
- [ ] Add analytics (optional)
