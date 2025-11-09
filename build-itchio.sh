#!/bin/bash

# Build Drunk Simulator for itch.io (without map editor)

echo "🎮 Building Drunk Simulator for itch.io..."
echo ""

# Build web version with editor disabled
echo "📦 Building web version (editor disabled)..."
DISABLE_EDITOR=true npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# DO NOT copy map editor for itch.io builds
echo "⚠️  Map editor excluded from itch.io build"

# Create ZIP
echo "🗜️  Creating ZIP file..."
cd dist
zip -r ../drunk-simulator-html5.zip .
cd ..

# Show result
if [ -f "drunk-simulator-html5.zip" ]; then
    SIZE=$(du -h drunk-simulator-html5.zip | cut -f1)
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! itch.io build ready"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 File: drunk-simulator-html5.zip"
    echo "📦 Size: $SIZE"
    echo ""
    echo "Next steps:"
    echo "1. Go to itch.io/game/new"
    echo "2. Upload drunk-simulator-html5.zip"
    echo "3. Check 'This file will be played in the browser'"
    echo "4. Set viewport: 1024×1824"
    echo ""
    echo "See ITCH_IO_UPLOAD_GUIDE.md for full instructions"
    echo ""
else
    echo "❌ ZIP creation failed"
    exit 1
fi
