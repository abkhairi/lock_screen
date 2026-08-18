# ft-lock

## creer un file .env et inclus
```
LOCKED_BY=abkhairi
LOCK_PASSWORD=123
```
## apres run cmd (npm install) pour install package node_module:
```
npm install 
```

## Run
```bash
npm start
```

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
