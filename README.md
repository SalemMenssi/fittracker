# FitTrack AI

Self-development RPG app built with Expo (React Native) and Node.js/MongoDB. Train body, mind, and eight intelligences through AI daily quests, routines, challenges, tests, and a marketplace.

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Optional: `npm run seed`, `npm run migrate:onboarding`

## Mobile app setup

```bash
cd fittracker-
npm install
npx expo install expo-notifications expo-device expo-constants
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api` in `.env` or edit `DEV_API_HOST` in `Src/services/config.js`.

## Push notifications (EAS)

1. `npx eas init` in `fittracker-`
2. Set `EXPO_PUBLIC_PROJECT_ID` and `app.json` → `expo.extra.eas.projectId`
3. Use a development/EAS build for full remote push (Expo Go has limitations)

## Demo accounts (after seed)

- hunter@example.com / password123
- admin@system.app / admin123

## Production

- Strong JWT_SECRET, never commit .env
- Production API URL via EXPO_PUBLIC_API_URL
- EAS credentials for push
