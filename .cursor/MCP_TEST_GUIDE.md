# MCP Test Gids - Praktische Voorbeelden

## Quick Test Checklist

### ✅ Basis Functionaliteit Tests

1. **Tab Management:**
   - [x] Lijst tabs
   - [ ] Maak nieuwe tab
   - [ ] Sluit tab
   - [ ] Selecteer tab

2. **Navigatie:**
   - [ ] Navigeer naar URL
   - [ ] Ga terug
   - [ ] Resize window

3. **Snapshots & Screenshots:**
   - [x] Maak snapshot
   - [ ] Maak screenshot
   - [ ] Full page screenshot

4. **Interacties:**
   - [ ] Klik op element
   - [ ] Type tekst
   - [ ] Vul formulier
   - [ ] Selecteer dropdown

## Praktische Test Scenario's voor Streamit

### Test 1: Homepage Check

```javascript
// 1. Navigate naar Streamit homepage
browser_navigate('http://localhost:3001')

// 2. Wacht op content
browser_wait_for({ text: 'Streamit' })

// 3. Maak snapshot om elementen te zien
browser_snapshot()

// 4. Screenshot voor visuele verificatie
browser_take_screenshot({ filename: 'homepage.png', fullPage: true })

// 5. Check console voor errors
browser_console_messages()
```

### Test 2: Login Flow

```javascript
// 1. Navigate naar login pagina
browser_navigate('http://localhost:3001/auth/signin')

// 2. Wacht op login form
browser_wait_for({ text: 'Sign in' })

// 3. Maak snapshot
browser_snapshot()

// 4. Vul login formulier (gebruik refs uit snapshot)
browser_fill_form({
  fields: [
    { name: 'Email', ref: '#email-input', type: 'textbox', value: 'test@example.com' },
    { name: 'Password', ref: '#password-input', type: 'textbox', value: 'password123' }
  ]
})

// 5. Klik login button
browser_click({ element: 'Login button', ref: '#login-button' })

// 6. Wacht op redirect
browser_wait_for({ text: 'Dashboard' })

// 7. Screenshot van resultaat
browser_take_screenshot({ filename: 'after-login.png' })
```

### Test 3: Studio Page Test

```javascript
// 1. Navigate naar studio
browser_navigate('http://localhost:3001/studio')

// 2. Wacht op studio interface
browser_wait_for({ text: 'Studio' })

// 3. Maak snapshot
browser_snapshot()

// 4. Check voor video preview element
// (gebruik refs uit snapshot)

// 5. Screenshot van studio interface
browser_take_screenshot({ filename: 'studio-interface.png', fullPage: true })

// 6. Check network requests voor API calls
browser_network_requests()

// 7. Check console voor errors
browser_console_messages()
```

### Test 4: Multi-Tab Test

```javascript
// 1. Maak eerste tab voor homepage
browser_tabs({ action: 'new' })
browser_navigate('http://localhost:3001')

// 2. Maak tweede tab voor studio
browser_tabs({ action: 'new' })
browser_navigate('http://localhost:3001/studio')

// 3. Switch tussen tabs
browser_tabs({ action: 'select', index: 0 })
browser_snapshot()

browser_tabs({ action: 'select', index: 1 })
browser_snapshot()

// 4. Screenshot van beide tabs
browser_take_screenshot({ filename: 'tab-1.png' })
browser_tabs({ action: 'select', index: 0 })
browser_take_screenshot({ filename: 'tab-0.png' })
```

## Automatische Test Suite Setup

### Voorbeeld Test Configuratie

```json
{
  "mcpTests": {
    "baseUrl": "http://localhost:3001",
    "timeout": 30000,
    "screenshots": {
      "enabled": true,
      "directory": "./screenshots"
    },
    "tests": [
      {
        "name": "Homepage Load",
        "url": "/",
        "waitFor": "Streamit",
        "screenshot": "homepage.png"
      },
      {
        "name": "Login Flow",
        "url": "/auth/signin",
        "interactions": [
          {
            "type": "fill_form",
            "fields": [
              { "name": "email", "value": "test@example.com" },
              { "name": "password", "value": "password123" }
            ]
          },
          {
            "type": "click",
            "element": "login-button"
          }
        ],
        "waitFor": "Dashboard",
        "screenshot": "after-login.png"
      }
    ]
  }
}
```

## Debugging Tips

### 1. Element Niet Gevonden

**Probleem:** `browser_click` faalt met "element not found"

**Oplossing:**
```javascript
// Maak altijd eerst een nieuwe snapshot
browser_snapshot()

// Gebruik de exacte ref uit de snapshot
// Check of element zichtbaar is in screenshot
browser_take_screenshot({ element: 'target-element', ref: '#element-id' })

// Wacht op element om te verschijnen
browser_wait_for({ text: 'Expected Text' })
```

### 2. Timing Issues

**Probleem:** Acties worden uitgevoerd voordat pagina geladen is

**Oplossing:**
```javascript
// Altijd wachten op specifieke content
browser_wait_for({ text: 'Page loaded indicator' })

// Of wacht op tijd
browser_wait_for({ time: 2000 }) // 2 seconden wachten

// Check console messages voor laad indicatoren
browser_console_messages()
```

### 3. Formulier Niet Gevuld

**Probleem:** `browser_fill_form` werkt niet

**Oplossing:**
```javascript
// Gebruik individuele browser_type calls
browser_snapshot()
browser_type({
  element: 'Email input',
  ref: '#email', // exact ref uit snapshot
  text: 'test@example.com'
})

// Of gebruik JavaScript evaluatie
browser_evaluate({
  function: () => {
    document.querySelector('#email').value = 'test@example.com';
  }
})
```

### 4. Screenshot Issues

**Probleem:** Screenshot is leeg of onvolledig

**Oplossing:**
```javascript
// Gebruik fullPage voor volledige pagina
browser_take_screenshot({ fullPage: true })

// Wacht op content eerst
browser_wait_for({ text: 'Content loaded' })

// Screenshot specifiek element
browser_take_screenshot({
  element: 'Specific element',
  ref: '#element-id'
})
```

## Performance Monitoring

### Network Request Analyse

```javascript
// Na navigatie of interactie
browser_navigate('http://localhost:3001/api/streams')
browser_wait_for({ time: 3000 })

// Check network requests
const requests = browser_network_requests()

// Analyseer:
// - Failed requests
// - Slow requests (>1000ms)
// - API errors (4xx, 5xx)
```

### Console Error Monitoring

```javascript
// Check voor JavaScript errors
const messages = browser_console_messages()

// Filter errors
const errors = messages.filter(m => m.level === 'error')

// Log alle errors voor debugging
console.log('Errors found:', errors)
```

## Best Practices Checklist

- [ ] Maak altijd snapshot voor interacties
- [ ] Wacht op content voordat je interacteert
- [ ] Gebruik screenshots voor visuele verificatie
- [ ] Check console messages voor errors
- [ ] Monitor network requests voor API issues
- [ ] Cleanup tabs na tests
- [ ] Gebruik betekenisvolle screenshot namen
- [ ] Documenteer test flows

## Integratie met CI/CD

### GitHub Actions Voorbeeld

```yaml
name: MCP Browser Tests

on: [push, pull_request]

jobs:
  mcp-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start Streamit
        run: npm run dev &
      - name: Wait for server
        run: sleep 10
      - name: Run MCP tests
        # MCP tests zouden hier uitgevoerd worden
        # via Cursor MCP tools
```

---

*Gebruik deze gids als referentie voor het testen van Streamit met MCP browser tools.*

