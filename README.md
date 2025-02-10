# Reading List Platform

A modern web application for managing and analyzing your reading list. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- 📚 Track multiple content types (books, videos, articles, academic papers)
- 🔍 Smart content analysis using Claude AI
- 🔎 Related content recommendations
- 📊 Progress tracking and statistics
- 🏆 Achievement system
- 🎨 Beautiful, responsive UI
- 🌙 Dark/light mode support
- 🔐 Secure authentication with Google

## Tech Stack

- Next.js 14
- Firebase (Authentication & Firestore)
- Tailwind CSS
- Framer Motion
- Claude API
- Google Custom Search API

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project set up
- Claude API access
- Google Custom Search API configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret

NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key

NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_SEARCH_ENGINE_ID=your_search_engine_id
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reading-list.git
   cd reading-list
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Google sign-in
3. Create a Firestore database
4. Add the following security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /items/{itemId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   └── ProtectedRoute.tsx
│   ├── content/
│   │   ├── ContentCard.tsx
│   │   ├── AddContentForm.tsx
│   │   └── ContentAnalysis.tsx
│   ├── profile/
│   │   ├── UserProfile.tsx
│   │   └── Stats.tsx
│   └── lists/
│       ├── ReadingList.tsx
│       └── FilterBar.tsx
├── lib/
│   └── firebase.ts
├── services/
│   ├── claudeService.ts
│   └── googleSearchService.ts
└── types/
    └── index.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 