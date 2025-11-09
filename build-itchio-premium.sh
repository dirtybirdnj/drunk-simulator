#!/bin/bash

# Build Drunk Simulator PREMIUM for itch.io (with map editor)

echo "💎 Building Drunk Simulator PREMIUM for itch.io..."
echo ""

# Build web version with editor ENABLED
echo "📦 Building web version (editor ENABLED)..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Copy map editor for premium build
echo "📝 Including map editor (premium feature)..."
cp map-editor.html dist/

# Create ZIP with different name
echo "🗜️  Creating PREMIUM ZIP file..."
cd dist
zip -r ../drunk-simulator-premium-html5.zip .
cd ..

# Show result
if [ -f "drunk-simulator-premium-html5.zip" ]; then
    SIZE=$(du -h drunk-simulator-premium-html5.zip | cut -f1)
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! itch.io PREMIUM build ready"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 File: drunk-simulator-premium-html5.zip"
    echo "📦 Size: $SIZE"
    echo ""
    echo "⭐ PREMIUM FEATURES INCLUDED:"
    echo "   ✅ Map Editor"
    echo "   ✅ QR Code Sharing"
    echo "   ✅ Create Custom Maps"
    echo "   ✅ Share Maps with Friends"
    echo ""
    echo "Next steps:"
    echo "1. Go to itch.io game edit page"
    echo "2. Upload drunk-simulator-premium-html5.zip"
    echo "3. Check 'This file will be played in the browser'"
    echo "4. Set viewport: 1024×1824"
    echo "5. Set price higher than base version"
    echo ""
    echo "See ITCH_IO_UPLOAD_GUIDE.md for full instructions"
    echo ""
else
    echo "❌ ZIP creation failed"
    exit 1
fi
