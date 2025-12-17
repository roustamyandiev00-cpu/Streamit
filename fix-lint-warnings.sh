#!/bin/bash

# Script to fix remaining ESLint warnings

echo "Fixing ESLint warnings..."

# Fix unused imports in components
echo "Removing unused imports..."

# AudioMixer.js
sed -i '' 's/import { Music } from/import {/' src/components/AudioMixer.js 2>/dev/null || sed -i 's/import { Music } from/import {/' src/components/AudioMixer.js
sed -i '' 's/, Music,/,/' src/components/AudioMixer.js 2>/dev/null || sed -i 's/, Music,/,/' src/components/AudioMixer.js
sed -i '' 's/, Settings } from/} from/' src/components/AudioMixer.js 2>/dev/null || sed -i 's/, Settings } from/} from/' src/components/AudioMixer.js

# OverlayEditor.js - remove unused imports
sed -i '' 's/, RotateCw, Palette,/,/' src/components/OverlayEditor.js 2>/dev/null || sed -i 's/, RotateCw, Palette,/,/' src/components/OverlayEditor.js
sed -i '' 's/, Upload, Layers,/,/' src/components/OverlayEditor.js 2>/dev/null || sed -i 's/, Upload, Layers,/,/' src/components/OverlayEditor.js

# RecordingControls.js
sed -i '' 's/, Monitor,/,/' src/components/RecordingControls.js 2>/dev/null || sed -i 's/, Monitor,/,/' src/components/RecordingControls.js
sed -i '' 's/, Mic, RotateCw, Maximize2,/,/' src/components/RecordingControls.js 2>/dev/null || sed -i 's/, Mic, RotateCw, Maximize2,/,/' src/components/RecordingControls.js
sed -i '' 's/, Upload, Zap, Eye, EyeOff,/,/' src/components/RecordingControls.js 2>/dev/null || sed -i 's/, Upload, Zap, Eye, EyeOff,/,/' src/components/RecordingControls.js

# SceneManager.js
sed -i '' 's/, Edit3,/,/' src/components/SceneManager.js 2>/dev/null || sed -i 's/, Edit3,/,/' src/components/SceneManager.js
sed -i '' 's/, Volume2, Settings,/,/' src/components/SceneManager.js 2>/dev/null || sed -i 's/, Volume2, Settings,/,/' src/components/SceneManager.js
sed -i '' 's/, Move, RotateCw, Maximize2, Minimize2, Layers,/,/' src/components/SceneManager.js 2>/dev/null || sed -i 's/, Move, RotateCw, Maximize2, Minimize2, Layers,/,/' src/components/SceneManager.js

# Fix unused parameters with underscore prefix
echo "Fixing unused parameters..."

# API routes - prefix unused parameters with _
find src/app/api -name "*.js" -type f -exec sed -i '' 's/export async function GET(request)/export async function GET(_request)/g' {} \; 2>/dev/null
find src/app/api -name "*.js" -type f -exec sed -i 's/export async function GET(request)/export async function GET(_request)/g' {} \; 2>/dev/null

# Fix unused variables
sed -i '' 's/const userId = session.user.id;/\/\/ const userId = session.user.id;/' src/app/api/analytics/route.js 2>/dev/null || sed -i 's/const userId = session.user.id;/\/\/ const userId = session.user.id;/' src/app/api/analytics/route.js
sed -i '' 's/const userId = session.user.id;/\/\/ const userId = session.user.id;/' src/app/api/insights/route.js 2>/dev/null || sed -i 's/const userId = session.user.id;/\/\/ const userId = session.user.id;/' src/app/api/insights/route.js

echo "Done! Run 'npm run lint' to verify fixes."