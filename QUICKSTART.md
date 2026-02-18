# Quick Start Guide — KIS-GALLERY

Get your 3D photography gallery running in 5 minutes.

---

## 1. Install Dependencies

Open terminal in the `KIS-GALLERY` folder and run:

```bash
npm install
```

This installs Three.js and Vite.

---

## 2. Add Your Photos

1. Place your photos in: `public/assets/photos/`
2. Edit `public/gallery-config.json`
3. Update the `photos` array with your images

Example entry:
```json
{
  "id": "my-photo-1",
  "src": "/assets/photos/my-image.jpg",
  "title": "My Photo Title",
  "description": "Where and when I took this",
  "dimensions": { "width": 1.5, "height": 1 },
  "position": {
    "room": "main",
    "wall": "north",
    "x": 0,
    "y": 1.8
  },
  "frame": {
    "style": "modern",
    "color": "#1a1a1a",
    "width": 0.04
  }
}
```

---

## 3. Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000`

---

## 4. Navigate the Gallery

**Desktop:**
- Click "Enter Gallery" to start
- WASD or Arrow keys to move
- Mouse to look around
- Click on photos to view details
- ESC to release cursor

**Mobile:**
- Touch and drag to look around
- Use virtual joystick to move
- Tap photos for details

---

## 5. Use the CMS (Optional)

For easier photo management:

```bash
npm run cms
```

Opens admin at `http://localhost:3001`

- Add/edit/delete photos visually
- Adjust settings (colors, lighting)
- Export config when done

---

## 6. Build for Production

```bash
npm run build
```

Creates optimized files in `dist/` folder.

---

## 7. Deploy

Upload the `dist/` folder to:
- Netlify (drag & drop)
- Vercel (git deploy)
- GitHub Pages
- Any static host

---

## Need Help?

- Check `CLAUDE.md` for project overview
- Read `C-core/project-brief.md` for requirements
- See `T-tools/workflows/add-photo-workflow.md` for detailed photo adding steps

---

## Wall Reference

```
        NORTH (back wall)
           ┌─────────┐
           │         │
  WEST     │    •    │    EAST
  (left)   │  start  │   (right)
           │         │
           └─────────┘
        SOUTH (entrance)
```

Photos on:
- `north` wall → You see them when entering
- `east` wall → On your right
- `west` wall → On your left
- `south` wall → Behind you when entering

---

Enjoy your virtual gallery! 🖼️
