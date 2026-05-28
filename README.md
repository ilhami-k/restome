# RestoMe

RestoMe is an Expo React Native app for in-restaurant ordering.

Customers scan a table QR code, browse the menu, add items to a local cart, submit an order, and follow item status in real time. Kitchen staff enter through a hidden staff QR code, log in, manage the live order queue, update item statuses, send messages, and manage menu items.

## Requirements

- Node.js 20.19.4 or newer
- npm
- Expo Go on a physical phone, or an Android emulator through Android Studio
- A configured Supabase project

## Environment

Create a `.env` file at the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
The .env file and the values are provided by email (or in the document requested by the professor)
```

The `.env` file is required to connect the app to Supabase. It is ignored by Git and must be provided separately when testing the project.

## Install And Run

```bash
npm install
npm run start
```

Then scan the Expo QR code with Expo Go.

If the phone cannot reach the local development server, use the tunnel command:

```bash
npm run start:tunnel
```

If tunnel mode has ngrok/network issues, the recommended fallback is Android Studio:

1. Start an Android emulator.
2. Run `npm run start`.
3. Press `a` in the Expo terminal to open the app on the emulator.

## Demo Access

Customer QR codes are stored in `src/qr-codes/`.

Available table codes:

```txt
TABLE_001
TABLE_002
TABLE_003
TABLE_004
TABLE_005
TABLE_006
```

Kitchen access is hidden from the customer UI. To open kitchen mode, scan `src/qr-codes/kitchen.svg` or type:

```txt
KITCHEN_001
```

Kitchen login uses Supabase Auth.

Kitchen demo credentials are not committed to the public repository. They must be provided separately to the evaluator during the demo or by private message.



## Scripts

- `npm run start` - start Expo
- `npm run start:tunnel` - start Expo with tunnel mode
- `npm run ts:check` - run TypeScript checks
- `npm test` - run tests

## Known Limits

- The app requires an active connection.
- There is no offline order queue.
- Orders are immutable once submitted by the customer.
- Payment is out of scope.
- The bill request screen is interface/local feedback only; it is not persisted in Supabase.

