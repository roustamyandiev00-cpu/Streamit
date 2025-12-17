#!/bin/bash

# Script om Yjs integratie naar GitHub te pushen

echo "🚀 Yjs integratie naar GitHub pushen..."
echo ""

# Check of we in een git repository zijn
if [ ! -d ".git" ]; then
    echo "❌ Error: Dit is geen git repository!"
    echo "   Initialiseer eerst: git init"
    exit 1
fi

# Check of er een remote is
if ! git remote | grep -q "origin"; then
    echo "⚠️  Geen 'origin' remote gevonden."
    echo "   Voeg een remote toe met: git remote add origin <url>"
    exit 1
fi

# Stap 1: Check status
echo "📋 Huidige git status:"
git status --short
echo ""

# Stap 2: Voeg alle nieuwe bestanden toe
echo "➕ Nieuwe bestanden toevoegen..."
git add src/lib/yjs/
git add src/lib/socket.js
git add src/hooks/useYjsCollaboration.js
git add src/components/YjsProvider.jsx
git add src/components/CollaborativeSceneManager.example.js
git add docs/YJS_*.md
git add YJS_INTEGRATION_COMPLETE.md
git add package.json
git add package-lock.json
echo "✅ Bestanden toegevoegd"
echo ""

# Stap 3: Commit
echo "💾 Commit maken..."
git commit -m "feat: Yjs integratie voor collaborative editing

- Socket.io provider voor Yjs synchronisatie
- React hooks voor Yjs (useYjsCollaboration, useYjsState)
- YjsProvider component voor React Context
- Server-side Yjs support in Socket.io
- Offline support via IndexedDB
- Volledige documentatie (YJS_USAGE.md, YJS_QUICK_START.md, etc.)
- Voorbeeld componenten voor collaborative editing

Features:
- Real-time scene management synchronisatie
- Collaborative overlay editing
- Stream notes synchronisatie
- Conflict-free CRDT algoritme
- Offline editing support"
echo "✅ Commit gemaakt"
echo ""

# Stap 4: Push naar GitHub
echo "📤 Pushen naar GitHub..."
read -p "Wil je nu pushen naar GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main || git push origin master
    echo ""
    echo "✅ Succesvol gepusht naar GitHub!"
else
    echo "⏸️  Push geannuleerd. Je kunt later pushen met: git push"
fi

echo ""
echo "🎉 Klaar!"

