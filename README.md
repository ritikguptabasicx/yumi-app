# Yumi Catering (React Native / Expo)

Production-ready React Native app for **Yumi Catering**, migrated from the Vite web app using **Expo SDK 52**, **Expo Router**, and **NativeWind v4**.

## Requirements

- Node.js 18+
- Android Studio (for `expo run:android`)
- Expo Go or a development build

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure API URL
cp .env.example .env
# Edit EXPO_PUBLIC_API_BASE_URL

# 3. Start development server
npx expo start

# 4. Run on Android device/emulator
npx expo run:android
```

Press `a` in the Expo terminal to open on Android emulator.

## Project structure

```
app/                    # Expo Router file-based routes
  (auth)/               # Public auth screens
  (app)/                # Protected app screens
src/
  components/           # UI + feature components
  contexts/             # UserContext (auth)
  hooks/                # SWR data hooks
  lib/                  # apiClient, i18n, storage, assets
  pages/                # Screen implementations
  store/                # Zustand (meal planner, checkout)
assets/                 # Images + locale JSON
```

## NativeWind

- `global.css` — Tailwind entry
- `tailwind.config.js` — theme (brand colors)
- `metro.config.js` — `withNativeWind()`
- `babel.config.js` — css-interop babel plugin (no Reanimated 4 worklets preset)

Use `className` on React Native `View`, `Text`, `Pressable`, etc.

## Deep links

Scheme: `yumicatering://`

Payment return routes: `/(auth)/success`, `/(auth)/failed`

## Legacy web files

Removed from the bundle: `src/App.jsx`, `src/main.jsx`, Vite config. The app is Expo-only.
