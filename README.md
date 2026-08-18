# ft-lock

A 42-style Electron desktop lock screen. Uses `assets/ft_lock_bkg.jpg` as the
exact, unmodified background — no generated backgrounds, no extra icons/logos
drawn on top.

## Configuration

Edit `.env`:

```env
LOCKED_BY=abkhairi
LOCK_PASSWORD=123456
```

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The app opens fullscreen in kiosk mode with no window chrome. The password
field is auto-focused on launch. Correct password quits the app; wrong
password shows an inline error with a small shake animation and resets the
field.

## Build a distributable

```bash
npm run build
```

Uses `electron-builder` (configured in `package.json`) to produce:
- Windows: an NSIS installer
- macOS: a `.dmg`
- Linux: an `AppImage`

Output lands in `dist/`.

## Project structure

```
ft-lock/
├── package.json
├── main.js          # Electron main process, window + IPC handlers
├── preload.js        # contextBridge — exposes only getConfig/checkPassword/unlock
├── .env               # LOCKED_BY / LOCK_PASSWORD
├── src/
│   ├── index.html
│   ├── style.css
│   └── renderer.js
└── assets/
    └── ft_lock_bkg.jpg
```

## Notes on architecture

- `nodeIntegration` is disabled and `contextIsolation` is enabled; the
  renderer only talks to Node/Electron through the three functions exposed
  in `preload.js`.
- The password comparison happens in the main process (`main.js`), not in
  the renderer, so the plaintext password is never sent to devtools-visible
  renderer state beyond the single attempt being checked.
- Kiosk/fullscreen mode is exited before `app.quit()` so the OS is left in a
  clean state.
