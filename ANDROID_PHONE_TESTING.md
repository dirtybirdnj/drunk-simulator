# Testing on Your Android Phone

There are **two ways** to test the Capacitor build on your physical Android phone:

---

## Option 1: USB Debugging (Requires Android Studio)

### Prerequisites
1. Install [Android Studio](https://developer.android.com/studio)
2. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → System → Developer Options
   - Enable "USB Debugging"

### Steps
1. **Build and sync:**
   ```bash
   npm run cap:sync
   ```

2. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

3. **Connect your phone via USB**
   - Unlock your phone
   - Accept the "Allow USB debugging?" prompt

4. **Run from Android Studio:**
   - Click the green play button
   - Select your phone from the device list
   - App will install and launch automatically

**Pros:** Live reload, debugging tools, instant testing
**Cons:** Requires Android Studio installation (~3GB)

---

## Option 2: Build APK and Install Manually (Easiest)

### Prerequisites
- Android Studio installed (same as Option 1)
- Phone allows "Install from Unknown Sources"

### Steps

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

3. **Build debug APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   cd ..
   ```

4. **Find the APK:**
   The APK will be at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

5. **Transfer to phone:**
   - **Via USB:** Copy `app-debug.apk` to your phone's Downloads folder
   - **Via AirDrop/Nearby Share:** Send the file wirelessly
   - **Via Cloud:** Upload to Google Drive, download on phone

6. **Install on phone:**
   - Open file manager on phone
   - Navigate to Downloads
   - Tap `app-debug.apk`
   - Allow "Install from Unknown Sources" if prompted
   - Tap "Install"

**Pros:** No USB cable needed, easy to share with friends
**Cons:** Must rebuild APK after each code change

---

## Option 3: Quick Test Script (Automated APK Build)

I can create a simple script that:
1. Builds the web app
2. Syncs to Android
3. Builds the APK
4. Shows you where the APK is

Want me to create this?

---

## Troubleshooting

### "App not installed" error
- Make sure you enabled "Install from Unknown Sources"
- Delete old version of app first

### Gradle build fails
- Make sure Android Studio SDK is configured
- Run Android Studio once and let it download necessary SDKs

### APK too large for transfer
- APK should be ~50-80MB
- Use Google Drive or similar for transfer

---

## What You'll Test

Once installed, you should see:
- ✅ The "DRUNK SIMULATOR" boot screen
- ✅ Menu buttons (START, SCAN, EDITOR)
- ✅ Player movement with touch controls
- ✅ NPCs wandering around
- ✅ Map rendering correctly

The camera/QR scanner will use the native camera API (better than browser!).

---

## Next Steps After Testing

Once you confirm it works on your phone:
1. Test QR scanning feature
2. Share APK with friends for testing
3. Prepare for Google Play Store submission
