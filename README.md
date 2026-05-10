# RestoMe

Expo React Native restaurant ordering app.

## Run

Install Node.js 20 or newer, then run:

```bash
npm install
npm run start
```

Scan the QR code with Expo Go.

If Expo Go stays on the loading screen, run the LAN start command instead:

```bash
npm run start:lan
```

For WSL only: if the QR code still shows a `172.*` address, run the LAN command with your Windows IP:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.x.x npm run start:lan
```

## Scripts

- `npm run start`
- `npm run start:lan`
- `npm run start:tunnel`
- `npm run android`
- `npm run ios`
- `npm run ts:check`
- `npm test`
