# Zagazig Housing - سكن الزقازيق 🏠

منصة لإيجاد السكن المناسب للطلاب في الزقازيق

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io

## Setup

### Backend
```bash
cd back
npm install
npm start
```

### Frontend
```bash
cd front
npm install
npm run dev
```

## Environment Variables

Create `.env` in `/back` folder:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key
```
