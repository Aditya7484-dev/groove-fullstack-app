# 🎵 Groove — Full-Stack Music App

A complete music streaming web app with user authentication, song uploads, and real audio playback.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| File Upload | Multer |
| Auth | JWT + bcryptjs |
| Middleware | CORS, dotenv |

---

## Prerequisites

- **Node.js** v16+ — https://nodejs.org
- **MongoDB** running locally OR a MongoDB Atlas URI
- **npm** (comes with Node.js)

---

## Setup & Run

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/groove
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

> For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

### 3. Start the server

```bash
# Production
npm start

# Development (auto-restart on file change)
npm run dev
```

### 4. Open in browser

```
http://localhost:5000
```

---

## Features

- **User Auth** — Register / Login with JWT tokens, passwords hashed with bcrypt
- **Upload Songs** — Upload MP3/WAV/OGG/FLAC audio + cover image (up to 50MB)
- **Real Playback** — HTML5 Audio API with progress bar, seek, volume control
- **Like Songs** — Toggle likes, saved per user in MongoDB
- **Genre Filter** — Filter songs by genre (Pop, Rock, Jazz, Electronic, Hip-Hop, Classical)
- **Search** — Live search by title, artist, or album
- **Play Count** — Tracks how many times each song has been played
- **My Uploads** — View and delete your own uploaded songs

---

## API Endpoints (for Postman testing)

### Auth
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | `{username, email, password}` | No |
| POST | `/api/auth/login` | `{email, password}` | No |
| GET | `/api/auth/me` | — | Bearer Token |

### Songs
| Method | Endpoint | Notes | Auth |
|--------|----------|-------|------|
| GET | `/api/songs` | `?genre=pop&search=text` | No |
| GET | `/api/songs/:id` | — | No |
| POST | `/api/songs` | multipart: `audio`, `cover`, `title`, `artist`, `album`, `genre` | Bearer Token |
| DELETE | `/api/songs/:id` | Only uploader | Bearer Token |
| POST | `/api/songs/:id/play` | Increment play count | No |
| POST | `/api/songs/:id/like` | Toggle like | Bearer Token |

### Users
| Method | Endpoint | Notes | Auth |
|--------|----------|-------|------|
| GET | `/api/users/profile` | Full profile + liked songs | Bearer Token |
| GET | `/api/users/my-uploads` | Songs you uploaded | Bearer Token |
| POST | `/api/users/playlist` | `{name}` — create playlist | Bearer Token |

---

## Project Structure

```
groove-fullstack/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── songController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js          ← JWT protect middleware
│   │   └── upload.js        ← Multer config
│   ├── models/
│   │   ├── User.js
│   │   └── Song.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── songs.js
│   │   └── users.js
│   ├── uploads/             ← Auto-created on first upload
│   │   ├── songs/
│   │   └── covers/
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── api.js           ← Fetch helpers, token management
    │   ├── player.js        ← Audio player engine
    │   └── app.js           ← App logic, rendering
    ├── pages/
    │   ├── login.html
    │   └── register.html
    └── index.html
```

---

## Postman Collection Quick Start

1. Register a user: `POST /api/auth/register`
2. Copy the `token` from the response
3. In Postman, set header: `Authorization: Bearer <token>`
4. Upload a song: `POST /api/songs` with form-data fields
5. List songs: `GET /api/songs`
