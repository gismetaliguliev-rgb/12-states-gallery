# Learning Log — KIS-GALLERY

Track what we learn during development.

---

## Format
```
### [Date] - [Topic]
**What happened:** Brief description
**What worked:** Key success
**What to remember:** Takeaway for future
```

---

## Entries

### 2024 - Initial Setup
**What happened:** Created project structure using ABC-TOM framework
**What worked:** Modular Three.js architecture with separate classes for Room, PhotoFrame, Lighting
**What to remember:** Keep 3D components isolated for easy updates

### 2024 - Navigation
**What happened:** Implemented first-person controls
**What worked:** Pointer lock API for mouse look, WASD for movement
**What to remember:** Always add bounds checking to prevent walking through walls

---

## Performance Notes

- Limit lights to under 10 for good performance
- Use 512x512 shadow maps for spotlights (balance quality/performance)
- Lazy load photos with placeholders
- Target 60fps minimum

---

## Browser Quirks

- Safari needs explicit WebGL 2.0 context
- iOS needs touch event passive: false for preventDefault
- Firefox has stricter CORS for local development

---

## User Feedback

(Add feedback here as you receive it)

---
