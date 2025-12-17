#!/bin/bash

# Script om volledig Streamit project naar GitHub te pushen

echo "🚀 Streamit project naar GitHub pushen..."
echo ""

# Check of we in een git repository zijn
if [ ! -d ".git" ]; then
    echo "❌ Error: Dit is geen git repository!"
    exit 1
fi

# Check of er al een remote is
if git remote | grep -q "origin"; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ Remote gevonden: $REMOTE_URL"
    echo ""
    read -p "Wil je deze remote gebruiken? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Verwijder huidige remote..."
        git remote remove origin
        REMOTE_URL=""
    fi
fi

# Als er geen remote is, vraag om URL
if [ -z "$REMOTE_URL" ]; then
    echo "📝 Geen remote gevonden. Voeg een GitHub repository toe:"
    echo ""
    echo "Voorbeelden:"
    echo "  - https://github.com/username/streamit.git"
    echo "  - git@github.com:username/streamit.git"
    echo ""
    read -p "GitHub repository URL: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo "❌ Geen URL ingevoerd. Exiting..."
        exit 1
    fi
    
    echo ""
    echo "➕ Remote toevoegen: $REPO_URL"
    git remote add origin "$REPO_URL"
    echo "✅ Remote toegevoegd"
    echo ""
fi

# Check huidige branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Huidige branch: $CURRENT_BRANCH"
echo ""

# Push naar GitHub
echo "📤 Pushen naar GitHub..."
read -p "Wil je nu pushen naar GitHub? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Pushen naar origin/$CURRENT_BRANCH..."
    
    # Probeer eerst te pushen, als het faalt, probeer met upstream
    if git push -u origin "$CURRENT_BRANCH"; then
        echo ""
        echo "✅ Succesvol gepusht naar GitHub!"
        echo ""
        echo "🌐 Je repository is nu beschikbaar op:"
        REMOTE_URL=$(git remote get-url origin)
        if [[ $REMOTE_URL == *"github.com"* ]]; then
            # Extract repository URL
            REPO_PATH=$(echo "$REMOTE_URL" | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
            echo "   https://github.com/$REPO_PATH"
        fi
    else
        echo ""
        echo "❌ Push gefaald. Mogelijke oorzaken:"
        echo "   - Repository bestaat nog niet op GitHub"
        echo "   - Geen toegang tot de repository"
        echo "   - Verkeerde URL"
        echo ""
        echo "💡 Maak eerst een repository aan op GitHub en probeer opnieuw."
    fi
else
    echo "⏸️  Push geannuleerd."
    echo ""
    echo "💡 Je kunt later pushen met:"
    echo "   git push -u origin $CURRENT_BRANCH"
fi

echo ""
echo "🎉 Klaar!"

