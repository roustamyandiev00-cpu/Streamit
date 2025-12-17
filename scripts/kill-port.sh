#!/bin/bash
# Script om proces op poort 3001 te stoppen

PORT=${1:-3001}

echo "Zoeken naar proces op poort $PORT..."

# Vind proces ID op poort
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo "Geen actief proces gevonden op poort $PORT"
    echo "Poort is mogelijk in TIME_WAIT state - wacht een paar seconden en probeer opnieuw"
    exit 0
fi

echo "Proces gevonden: PID $PID"
echo "Stoppen van proces..."

kill $PID 2>/dev/null

# Wacht even
sleep 1

# Check of het gestopt is
if kill -0 $PID 2>/dev/null; then
    echo "Forced kill nodig..."
    kill -9 $PID 2>/dev/null
    sleep 1
fi

# Verifieer
if ! kill -0 $PID 2>/dev/null; then
    echo "✓ Proces succesvol gestopt"
else
    echo "✗ Kon proces niet stoppen"
    exit 1
fi

