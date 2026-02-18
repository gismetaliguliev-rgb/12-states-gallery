# Workflow: Add Photo to Gallery

Step-by-step process for adding new photographs to the 3D gallery.

---

## Prerequisites
- Photo file ready (JPEG recommended)
- Photo dimensions determined
- Planned wall placement

---

## Steps

### 1. Prepare the Image

```
Optimal sizes:
- Small display (< 1m): 1200 x 800 px
- Medium display (1-2m): 2000 x 1333 px
- Large display (> 2m): 3000 x 2000 px

Export settings:
- Format: JPEG
- Quality: 80-85%
- Color space: sRGB
```

### 2. Add Image File

Copy your image to:
```
public/assets/photos/your-photo-name.jpg
```

Optional: Create thumbnail for faster loading:
```
public/assets/photos/thumbs/your-photo-name.jpg
(300 x 200 px, 70% quality)
```

### 3. Update Configuration

Edit `public/gallery-config.json` and add entry to `photos` array:

```json
{
  "id": "photo-XXX",
  "src": "/assets/photos/your-photo-name.jpg",
  "thumbnail": "/assets/photos/thumbs/your-photo-name.jpg",
  "title": "Your Photo Title",
  "description": "Brief description of the photo",
  "dimensions": {
    "width": 1.5,
    "height": 1.0
  },
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

### 4. Position Guide

**Walls:**
- `north` — Back wall (facing you when you enter)
- `south` — Front wall (behind you when you enter)
- `east` — Right wall
- `west` — Left wall

**X position:**
- Negative values → Left side of wall
- Zero → Center of wall
- Positive values → Right side of wall

**Y position (height):**
- `1.5 - 1.8` — Eye level (recommended)
- Higher for dramatic effect
- Lower for intimate viewing

### 5. Dimensions Guide

Set display dimensions in meters:

```
Portrait photo: width: 1.0, height: 1.5
Landscape photo: width: 1.5, height: 1.0
Square: width: 1.2, height: 1.2
Large statement: width: 2.0, height: 1.3
```

### 6. Test

1. Run `npm run dev`
2. Open gallery in browser
3. Navigate to photo location
4. Verify:
   - Photo loads correctly
   - Dimensions look right
   - Position is good
   - Click interaction works

### 7. Adjust if Needed

Common adjustments:
- Move photo: Change `x` position
- Change height: Adjust `y` value
- Resize: Modify dimensions
- Move to different wall: Change `wall` value

---

## Using CMS Instead

1. Run `npm run cms`
2. Click "Add Photo"
3. Upload image
4. Fill in details
5. Save
6. Download new `gallery-config.json`
7. Replace file in `public/`

---

## Checklist

- [ ] Image optimized for web
- [ ] File added to correct location
- [ ] Config entry added
- [ ] Unique ID assigned
- [ ] Position makes sense with other photos
- [ ] Tested in browser
- [ ] Mobile tested
