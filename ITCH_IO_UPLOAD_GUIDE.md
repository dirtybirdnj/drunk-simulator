# Uploading Drunk Simulator to itch.io

## What You're Uploading

Your game as an **HTML5 web game** that runs directly in the browser. Players click "Run Game" and play instantly - no downloads needed.

---

## Step 1: Prepare the Build

The build is already ready in the `dist/` folder:

```bash
# Already built! But if you need to rebuild:
npm run build
cp map-editor.html dist/
```

**What's in dist/:**
- `index.html` - Main game file
- `map-editor.html` - Map editor (accessible via EDITOR button)
- `assets/` - Game code and assets (~1.5MB)

---

## Step 2: Create a ZIP File

itch.io requires you to upload a ZIP file:

```bash
cd dist
zip -r drunk-simulator-html5.zip .
mv drunk-simulator-html5.zip ..
cd ..
```

Now you have `drunk-simulator-html5.zip` ready to upload.

---

## Step 3: Upload to itch.io

1. **Go to itch.io** and log in
2. **Click "Upload New Project"** (or go to your existing game's edit page)
3. **Fill in game details:**
   - Title: **Drunk Simulator**
   - Project URL: `yourusername.itch.io/drunk-simulator`
   - Short description: "A simulation game to experiment with crowd dynamics by making a bar"

4. **Upload the game:**
   - Click "Upload files"
   - Drop `drunk-simulator-html5.zip`
   - Check the box: **"This file will be played in the browser"**

5. **Configure embed options:**
   - **Embed options:** Click "Edit" next to the uploaded file
   - **Viewport dimensions:**
     - Width: `1024` (or `100%`)
     - Height: `1824` (or `100%`)
   - **Automatically start on page load:** ✅ (recommended)
   - **Mobile friendly:** ✅ (yes!)
   - **Orientation:** Portrait (9:16 aspect ratio)

6. **Set game details:**
   - **Kind of project:** HTML
   - **Release status:** Released (or Early Access)
   - **Pricing:** Free (or set a price)
   - **Genre:** Simulation
   - **Tags:** simulation, bar, crowd-dynamics, mobile

7. **Add screenshots:**
   - Take screenshots of:
     - Boot screen with DRUNK animation
     - Gameplay with NPCs walking
     - Map editor interface
     - QR code sharing feature

8. **Save & Publish:**
   - Click "Save" at bottom
   - Click "View page" to see it live
   - Share the link!

---

## How It Will Work on itch.io

### Desktop Players (Laptop/Desktop)
- Game displays with phone mockup overlay
- 1024×1824 game area centered on screen
- Can play with mouse or keyboard
- EDITOR button works for creating custom maps

### Mobile Players (Phone/Tablet)
- Phone mockup overlay is hidden
- Game fills the browser window
- Touch controls work
- Can scan QR codes with native camera (in browser)

### What Works
✅ Player movement (touch, mouse, keyboard)
✅ NPC AI and wandering behavior
✅ Map editor with QR code sharing
✅ All game mechanics
✅ Responsive design (works on any screen size)

### What Doesn't Work (in browser)
⚠️ Camera QR scanning uses browser API (works, but not as smooth as native)
⚠️ No offline play (requires internet connection)

---

## Updating Your Game

When you fix bugs or add features:

1. **Rebuild:**
   ```bash
   npm run build
   cp map-editor.html dist/
   ```

2. **Create new ZIP:**
   ```bash
   cd dist
   zip -r drunk-simulator-html5.zip .
   mv drunk-simulator-html5.zip ..
   cd ..
   ```

3. **Upload to itch.io:**
   - Go to your game's edit page
   - Upload new ZIP
   - Check "Replace existing file"
   - Players will get the update immediately (browser caching may delay ~5 mins)

---

## Recommended itch.io Settings

**Viewport Size:**
```
Width: 1024px (or auto)
Height: 1824px (or auto)
```

**Embed Settings:**
- ✅ Click to launch
- ✅ Mobile friendly
- ✅ Fullscreen button
- ✅ Automatically start

**Access:**
- Public or Restricted (your choice)
- Consider "Early Access" while testing

---

## Testing Before Publishing

Before publishing, test the uploaded game:

1. Upload as **Draft** first
2. Click "View page" to test
3. Try on:
   - Desktop browser (Chrome, Firefox, Safari)
   - Mobile browser (iOS Safari, Android Chrome)
4. Verify:
   - Game loads correctly
   - Player movement works
   - EDITOR button works
   - Map editor loads
   - QR codes generate

---

## Common Issues

### "Game won't start"
- Make sure you zipped the **contents** of dist/, not the dist/ folder itself
- ZIP should have index.html at root, not dist/index.html

### "Missing files / 404 errors"
- Make sure map-editor.html is in the ZIP
- Check that assets/ folder is included

### "Game is too small/large"
- Adjust viewport dimensions in itch.io embed settings
- Try "auto" or "100%" for width/height

### "Phone mockup doesn't show"
- This is expected on mobile/tablet
- It only shows on desktop (>= 1024px width)
- Game works fine without it

---

## Next Steps After Upload

1. **Share your game:**
   - Post on social media
   - Share with friends for QR code testing
   - Get feedback

2. **Monitor analytics:**
   - itch.io shows play count, downloads, etc.
   - See which maps players create and share

3. **Update based on feedback:**
   - Easy to update (just re-upload ZIP)
   - Players get updates instantly

4. **Consider mobile app versions:**
   - Once you have traction on itch.io
   - Use Capacitor builds for app stores
   - More work but reaches more players

---

## Your Game is Ready! 🎉

The `dist/` folder contains everything you need. Just ZIP it up and upload to itch.io. No code changes needed - it's already optimized for web play.

**File to upload:** `drunk-simulator-html5.zip`
**Size:** ~1.5MB (tiny!)
**Platforms:** Works everywhere (desktop, mobile, tablet)

Good luck with your launch! 🍻
