# Drunk Simulator - Multi-Platform Deployment Guide

## Overview

This game runs on **three platforms** from a single codebase:
- **Web Browser** (development & production)
- **Desktop** (Electron - Windows, Mac, Linux)
- **Mobile** (Capacitor - iOS & Android)

---

## Development Workflow

### Browser Development (Fastest)
```bash
npm run dev
```
- Starts Vite dev server at `http://localhost:5173`
- Hot reload enabled
- Use this for daily development
- No platform-specific features (camera, etc.)

---

## Platform Builds

### 1. Web Browser (Production)

**Build:**
```bash
npm run build
```
- Creates production build in `dist/`
- Deploy `dist/` folder to any static hosting (Netlify, Vercel, GitHub Pages)

**Preview locally:**
```bash
npm run preview
```

---

### 2. Desktop (Electron)

**Development mode:**
```bash
npm run electron:dev
```
- Runs Electron window with live reload
- Opens Chrome DevTools automatically
- Window size: 443×923 (phone dimensions)

**Build for distribution:**
```bash
npm run electron:build
```
- Creates installable apps in `release/` folder
- **Mac:** `.dmg` and `.zip`
- **Windows:** `.exe` installer and portable `.exe`
- **Linux:** `.AppImage` and `.deb`

**Platform-specific notes:**
- Mac builds require macOS
- Windows builds work on any platform (via wine)
- Linux builds work on any platform

---

### 3. Mobile (Capacitor)

#### iOS

**Prerequisites:**
- macOS required
- Xcode installed (not just Command Line Tools)
- CocoaPods installed: `sudo gem install cocoapods`

**Build:**
```bash
npm run cap:build:ios
```
- Builds and syncs to `ios/` folder
- Opens Xcode project
- Build/run from Xcode (Cmd+R)
- Test on simulator or physical device

**Manual sync (after code changes):**
```bash
npm run cap:sync
npx cap open ios
```

#### Android

**Prerequisites:**
- Android Studio installed
- Android SDK configured

**Build:**
```bash
npm run cap:build:android
```
- Builds and syncs to `android/` folder
- Opens Android Studio project
- Build/run from Android Studio
- Test on emulator or physical device

**Manual sync (after code changes):**
```bash
npm run cap:sync
npx cap open android
```

---

## Platform-Specific Quirks & Notes

### Web Browser
- ✅ Works everywhere
- ❌ No native camera access (QR scanner uses browser API)
- ❌ Limited offline support
- ⚠️ Phone mockup overlay only shows on desktop (1024px+ width)

### Electron
- ✅ Desktop app with native feel
- ✅ Chrome DevTools for debugging
- ❌ No native camera (would need to implement via Web API)
- ⚠️ Large file size (~150MB with Electron runtime)
- ⚠️ Map editor currently visible (may want to hide in desktop version)

### iOS (Capacitor)
- ✅ Native camera via `@capacitor/camera` plugin
- ✅ App Store distribution ready
- ⚠️ Requires macOS + Xcode for building
- ⚠️ CocoaPods dependency management required
- ⚠️ iOS Developer account needed for device testing ($99/year for App Store)

### Android (Capacitor)
- ✅ Native camera via `@capacitor/camera` plugin
- ✅ Google Play Store distribution ready
- ✅ Can build on any platform (Windows, Mac, Linux)
- ⚠️ Requires Android Studio + SDK
- ⚠️ Google Play Developer account ($25 one-time fee)

---

## Project Structure

```
drunk-simulator/
├── src/                    # Game source code (TypeScript + Phaser)
├── dist/                   # Built web app (generated)
├── electron/               # Electron wrapper
│   └── main.js            # Electron main process
├── ios/                    # iOS native project (Capacitor)
├── android/                # Android native project (Capacitor)
├── release/                # Electron build output
├── capacitor.config.ts    # Capacitor configuration
└── package.json           # Build scripts
```

---

## Build Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start browser dev server |
| `npm run build` | Build for web production |
| `npm run preview` | Preview production build locally |
| `npm run electron:dev` | Run Electron in dev mode |
| `npm run electron:build` | Build Electron apps for distribution |
| `npm run cap:sync` | Sync web code to mobile platforms |
| `npm run cap:build:ios` | Build and open iOS project |
| `npm run cap:build:android` | Build and open Android project |

---

## Testing Checklist

Before releasing, test on all platforms:

### Core Gameplay
- [ ] Player movement (touch/mouse/keyboard)
- [ ] NPC wandering behavior
- [ ] Collision detection
- [ ] Map rendering

### Platform-Specific Features
- [ ] **Web:** Works in Chrome, Safari, Firefox
- [ ] **Electron:** Window opens, game runs identically to web
- [ ] **iOS:** Camera QR scanner works, touch controls work
- [ ] **Android:** Camera QR scanner works, touch controls work

### Known Issues
- iOS pod install requires full Xcode (not just Command Line Tools)
- Map editor is currently always visible (may want platform detection)
- QR scanner uses browser API in web/Electron, native camera in mobile

---

## Future Deployment Enhancements

### Phase 2 (After packaging validated):
- Add native Share API for map trading
- Implement platform-specific feature detection
- Add PWA support for web version (installable on mobile)
- Configure splash screens and app icons
- Add deep linking for QR code map sharing

---

## App Store Submission

### iOS App Store
1. Build in Xcode (Product → Archive)
2. Validate build
3. Upload to App Store Connect
4. Fill in metadata, screenshots
5. Submit for review (1-3 day wait)

### Google Play Store
1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Fill in metadata, screenshots
4. Submit for review (few hours wait)

---

## Current Status

✅ Electron wrapper configured and tested
✅ Capacitor iOS platform added
✅ Capacitor Android platform added
⚠️ iOS requires Xcode/CocoaPods for final builds
⚠️ App icons and splash screens not configured yet
⚠️ No code changes needed - this is pure packaging setup

**Next Step:** Get full Xcode installed and test iOS build on device
