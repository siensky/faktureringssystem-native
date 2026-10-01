# faktureringssystem-native

Mobile client for my invoicing system, built in React Native/Expo. Same backend and same data as the web portal, but made for a phone for real instead of just shrinking the web version — Face ID login, haptic feedback, native sharing of invoices as PDF, and local notifications when an invoice changes status.

<p>
  <img src="docs/screenshots/login.png" width="200" alt="Login" />
  <img src="docs/screenshots/invoices.png" width="200" alt="Invoice list" />
  <img src="docs/screenshots/invoice-detail.png" width="200" alt="Invoice detail" />
  <img src="docs/screenshots/company-switcher.png" width="200" alt="Switch company" />
</p>

## What you can do

Log in, view your invoices, open or share an invoice as a PDF, pay via Stripe Checkout, and switch between companies if you're linked to more than one.

## Stack

Expo (SDK 57), React Navigation, TanStack Query, TypeScript. Chose React Navigation over Expo Router to get an explicit folder structure (`navigation/`, `screens/`) rather than having routing driven by the file system — more to write by hand, but easier to follow as the app grows.

## Try it without a backend

The app normally talks to a real backend (`faktureringssystem-be`), but you don't need to start it just to look at the app:

```bash
npm install
npm run demo
```

This starts the app in the browser with a built-in fake API — any login works, two made-up companies with different invoice statuses, everything you see in the screenshots above. No network call leaves the computer. PDF opening and payment are deliberately not simulated (there's no real file or payment to simulate), so they show the same "not available yet" error message the app already has.

The same flag (`EXPO_PUBLIC_USE_MOCKS=true`) also works for `npm run ios`/`android`, see `src/api/mockData.ts` for the fixture data.

## Running against a real backend

```bash
cp .env.example .env    # point EXPO_PUBLIC_API_URL at your own faktureringssystem-be
npm run ios             # or: npm run android / npm run web
```

Requires a running instance of the backend (`docker compose up -d` in that repo).

## Testing

```bash
npm test              # jest — 34 tests
npx tsc --noEmit       # typecheck
npm run lint           # eslint
```

The tests live where bugs actually hide: money formatting, token refresh (including what happens if several requests get a 401 at the same time), the fake API's routing, and the diff logic behind the notifications. I've deliberately not written component tests for the screens — they're thin wrappers around native APIs (camera, Face ID, the share sheet) that are easier to verify by running the app than through snapshots that would just mirror the code anyway.

Face ID, haptics, sharing, and notifications are native-only and can't be tested in the browser — run `npm run ios` or `npm run android` to see them for real.
