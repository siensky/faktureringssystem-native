# faktureringssystem-native

En [Expo](https://expo.dev)/React Native-app (SDK 57) för kundportalen i `faktureringssystem-be` — samma fakturor, betalningar och företagsbyte som webbportalen, plus native-specifika funktioner: Face ID/Touch ID-inloggning, haptisk feedback, delning av fakturor via native Share Sheet, och lokala push-notiser vid statusändringar.

## Arkitektur

- **Navigation**: [React Navigation](https://reactnavigation.org) (native-stack + bottom-tabs), inte Expo Router. Navigatorer ligger i [`src/navigation/`](src/navigation/), skärmar i [`src/screens/`](src/screens/). Se [AGENTS.md](AGENTS.md) för resonemanget bakom valet.
- **State/data**: [TanStack Query](https://tanstack.com/query) mot en tunn `fetch`-baserad API-klient i [`src/api/`](src/api/) — single-flight token-refresh på 401, se [`src/api/client.ts`](src/api/client.ts).
- **Auth**: access-token i minnet, refresh-token krypterat i Keychain/Keystore via `expo-secure-store` ([`src/auth/tokenStore.ts`](src/auth/tokenStore.ts)), med ett Face ID/Touch ID-gate ovanpå ([`src/auth/biometrics.ts`](src/auth/biometrics.ts)).
- **Typer**: [`src/types/contracts.ts`](src/types/contracts.ts) är en handskriven spegling av de DTO:er appen faktiskt använder från backendens delade `contracts`-paket — ingen path-mapping mellan repona, så projektet fungerar fristående.

## Komma igång

```bash
npm install
cp .env.example .env   # sätt EXPO_PUBLIC_API_URL mot din körande faktureringssystem-be
npm run ios             # eller npm run android / npm run web
```

Appen förväntar sig en körande `faktureringssystem-be` (`docker compose up -d`) på adressen i `.env`.

## Kommandon

```bash
npx tsc --noEmit    # typecheck
npm run lint         # expo lint
npm test             # jest
```

Kör typecheck, lint och tester innan en ändring anses klar.
