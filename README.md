# Study Leveling

An AI-powered, gamified flashcard learning platform designed to help users retain knowledge, stay motivated, and level up their learning journey. Study Leveling blends the proven effectiveness of flashcards with AI-driven learning assistance and engaging gamification. Users can create and study flashcards, while earning XP, maintaining streaks, and unlocking achievements.

## Features

- **Flashcard Management:** Create, edit, and delete flashcards.
- **AI-Powered Learning:** Automatically generate flashcards from uploaded notes; receive AI-evaluated personalized explanations for answers.
- **Interactive Study Modes:** Answer via text or voice; get instant AI feedback highlighting correct, incorrect, and missing points.
- **Gamification & Rewards:** Earn XP for study sessions, maintain streaks, unlock achievements, and complete daily challenges for coin rewards.
- **Personalized Progress Tracking:** View your level, XP progress, streak history, study time, and unlocked achievements in an engaging profile dashboard.
- **Customizable Learning Experience:** Decorate flashcards with stickers purchased from the in-app store.

## Tech Stack

- **Frontend:** React Native (TypeScript)
- **State Management:** Zustand + MMKV (local persistence)
- **Backend:** AWS Amplify
- **Auth:** Amazon Cognito
- **Database:** Amazon DynamoDB
- **Serverless Logic:** AWS Lambda + API Gateway

## Screens

| Screen                   | Description                           |
| ------------------------ | ------------------------------------- |
| **Login / Sign Up**      | Secure account creation & access      |
| **Dashboard**            | Shows level, XP, streak, decks        |
| **Flashcard Editor**     | Create or edit cards                  |
| **Flashcard Review**     | Study mode with progress tracker      |
| **AI Feedback**          | Highlight correct/incorrect answers   |
| **Reward Screen**        | Celebrate earned XP and progress      |
| **Profile Stats**        | Achievements, streaks, time studied   |
| **Daily Challenges**     | XP & coin rewards for tasks           |
| **Store**                | Buy stickers                          |
| **Flashcard Decoration** | Personalize flashcards with cosmetics |
| **Account Management**   | Change password, delete account       |

## Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the Amplify sandbox

   ```bash
    npx ampx sandbox --profile <profile-name>
   ```

3. Run the app

   ```bash
    npx expo start
   ```
