# itch.io Two-Tier Pricing Strategy

## Pricing Strategy

You have **two paid versions** on itch.io:

1. **itch.io Base** - $5.00 - Play only, scan QR codes
2. **itch.io Premium** - $15.00 - Includes map editor

---

You have **two versions** of Drunk Simulator ready for itch.io:

---

## Version 1: Base Game (Free or Low Price)

**File:** `drunk-simulator-html5.zip` (780KB)

**Build command:**
```bash
./build-itchio.sh
```

**Features:**
- ✅ Play the game
- ✅ Use START button to play default map
- ✅ Use SCAN button to scan QR codes from friends
- ✅ Load custom maps created by others
- ❌ No map editor
- ❌ Can't create own maps

**Recommended pricing:** $5.00

**Player experience:**
"I want to play the game and try maps my friends made"

---

## Version 2: Premium/Creator Edition

**File:** `drunk-simulator-premium-html5.zip` (432KB)

**Build command:**
```bash
./build-itchio-premium.sh
```

**Features:**
- ✅ Everything from base game
- ✅ **Map Editor** - Create custom bar layouts
- ✅ **QR Code Export** - Share maps with friends
- ✅ **Save Maps** - Store up to 10 custom maps
- ✅ **LOAD MAP** - Test your creations instantly

**Recommended pricing:** $15.00

**Player experience:**
"I want to create crazy bar layouts and share them with friends"

---

## How to Set Up on itch.io

### Option A: Single Game, Multiple Files

1. Create one game page
2. Upload both ZIP files:
   - `drunk-simulator-html5.zip` - Set price: Free
   - `drunk-simulator-premium-html5.zip` - Set price: $2.99+
3. Label them clearly:
   - "Base Game - Play Only"
   - "Premium Edition - With Map Editor"

**Pros:** Simple, one game page, clear upsell
**Cons:** Players might be confused why there are two files

---

### Option B: Two Separate Games

1. Create two game pages:
   - "Drunk Simulator" (free or cheap)
   - "Drunk Simulator: Creator Edition" (premium)

**Pros:** Very clear what each is
**Cons:** More maintenance, split audience

---

## Recommended: Option A (Single Game Page)

**Title:** Drunk Simulator

**Short description:**
"A simulation game to experiment with crowd dynamics by making a bar. Play custom maps or create your own!"

**File uploads:**
1. **drunk-simulator-html5.zip**
   - Name: "Base Game (Play Only)"
   - Price: Free (or $0.99)
   - Description: "Play the game and load maps from QR codes"

2. **drunk-simulator-premium-html5.zip**
   - Name: "Premium Edition (With Map Editor)"
   - Price: $2.99
   - Description: "Includes map editor - create and share custom bar layouts!"

**Pricing strategy:**
- Base game attracts players
- Premium version monetizes creators
- Players who love the game will upgrade to make maps

---

## Price Recommendations

**Recommended Pricing:**
- Base: $5.00
- Premium: $15.00

**Name Your Own Price (Alternative):**
- Minimum: $5.00 (base) / $15.00 (premium)
- Suggested: $5.00 (base) / $15.00 (premium)

---

## Marketing Copy Examples

### For Base Version:
"🍺 Run your own bar simulation! Control the crowd, pour drinks, and watch the chaos unfold. Load custom maps created by the community via QR codes!"

### For Premium Version:
"💎 PREMIUM EDITION: Everything in the base game PLUS the powerful map editor! Design crazy bar layouts, share them with friends via QR codes, and become a level creator. Includes map saving, QR export, and instant playtesting."

---

## Update Strategy

When you fix bugs or add features:

**Update both versions:**
```bash
./build-itchio.sh         # Base version
./build-itchio-premium.sh # Premium version
```

Both get the bug fixes, but only premium keeps the editor.

---

## Analytics to Watch

Monitor which version sells better:
- **Lots of base, few premium:** Price premium too high
- **Lots of premium, few base:** Base version too limited, or price gap too small
- **Balanced:** Good pricing strategy

Adjust based on:
- Play/purchase ratio
- Community feedback
- Competition pricing

---

## Future Upsell Ideas

Once you have traction, consider:
- **Free base** → Strong upsell to premium ($2.99)
- **Subscription model** → $0.99/month for editor access
- **One-time unlock** → Start free, pay once to unlock editor

itch.io supports all these models!

---

## Quick Start

1. **Build both versions:**
   ```bash
   ./build-itchio.sh         # Creates drunk-simulator-html5.zip
   ./build-itchio-premium.sh # Creates drunk-simulator-premium-html5.zip
   ```

2. **Upload to itch.io:**
   - Go to itch.io/game/new
   - Upload first file, set price
   - Upload second file, set higher price
   - Label them clearly

3. **Set pricing:**
   - Base: Free (get players)
   - Premium: $2.99 (monetize creators)

4. **Launch!** 🚀

---

Your two builds are ready. Choose your pricing strategy and upload! 💎
