#!/bin/bash

# Build Android APK for testing on physical device

echo "🤖 Building Drunk Simulator for Android..."
echo ""

# Step 1: Build web app
echo "📦 Step 1: Building web app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi
echo "✅ Web build complete"
echo ""

# Step 2: Sync to Android
echo "📱 Step 2: Syncing to Android project..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Android sync failed!"
    exit 1
fi
echo "✅ Sync complete"
echo ""

# Step 3: Build APK
echo "🔨 Step 3: Building Android APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "❌ APK build failed!"
    echo ""
    echo "⚠️  You may need to install Android Studio first:"
    echo "   https://developer.android.com/studio"
    exit 1
fi
cd ..
echo "✅ APK build complete"
echo ""

# Show output location
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! APK ready for installation"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 Location: $APK_PATH"
    echo "📦 Size: $APK_SIZE"
    echo ""
    echo "Next steps:"
    echo "1. Transfer app-debug.apk to your Android phone"
    echo "2. Open the file on your phone"
    echo "3. Allow 'Install from Unknown Sources' if prompted"
    echo "4. Tap 'Install'"
    echo ""
    echo "Or open in Android Studio for USB debugging:"
    echo "   npx cap open android"
    echo ""
else
    echo "❌ APK not found at expected location"
    exit 1
fi
