# YuVienCe Backend

Complete Node.js/Express backend for the YuVienCe platform with PostgreSQL database.

## Features

- User authentication (register/login with JWT)
- Social feed (posts, likes, comments)
- Photo memories (albums and photos)
- Music streaming (tracks and playlists)
- Video feed
- Study hub (resources and notes)
- Task/productivity management
- User profiles and following system

## Setup

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (copy from .env.example):
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL credentials

4. Run migrations:
```bash
npm run migrate
```

5. Seed the database with realistic data:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

Server will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:userId` - Get user profile

### Social Feed
- `GET /api/social` - Get public posts
- `POST /api/social` - Create post (requires auth)
- `POST /api/social/:postId/like` - Like/unlike post (requires auth)
- `GET /api/social/:postId/comments` - Get post comments
- `POST /api/social/:postId/comments` - Add comment (requires auth)

### Memories
- `GET /api/memories` - Get user's albums (requires auth)
- `POST /api/memories` - Create album (requires auth)
- `GET /api/memories/:albumId/photos` - Get album photos
- `POST /api/memories/:albumId/photos` - Add photo (requires auth)

### Music
- `GET /api/music/tracks` - Get all tracks
- `GET /api/music/playlists` - Get user's playlists (requires auth)
- `POST /api/music/playlists` - Create playlist (requires auth)
- `GET /api/music/playlists/:playlistId/tracks` - Get playlist tracks
- `POST /api/music/playlists/:playlistId/tracks` - Add track to playlist (requires auth)

### Videos
- `GET /api/videos` - Get public videos
- `POST /api/videos` - Upload video (requires auth)
- `GET /api/videos/user/:userId` - Get user's videos

### Study Hub
- `GET /api/study/resources` - Get user's resources (requires auth)
- `POST /api/study/resources` - Create resource (requires auth)
- `GET /api/study/notes` - Get user's notes (requires auth)
- `POST /api/study/notes` - Create note (requires auth)
- `PUT /api/study/notes/:noteId` - Update note (requires auth)

### Tasks
- `GET /api/tasks` - Get user's tasks (requires auth)
- `POST /api/tasks` - Create task (requires auth)
- `PUT /api/tasks/:taskId` - Update task (requires auth)
- `DELETE /api/tasks/:taskId` - Delete task (requires auth)

### Users
- `GET /api/users/stats/:userId` - Get follower/following counts
- `GET /api/users/:userId/followers` - Get user's followers
- `GET /api/users/:userId/following` - Get user's following
- `POST /api/users/:userId/follow` - Follow user (requires auth)
- `POST /api/users/:userId/unfollow` - Unfollow user (requires auth)

## Database Schema

The database includes tables for:
- Users
- Social Posts
- Post Likes & Comments
- Memory Albums & Photos
- Music Tracks & Playlists
- Videos
- Study Resources & Notes
- Tasks
- Followers

## Sample Data

The seed script creates:
- 21 sample users (1 admin + 20 regular users)
- 15 music tracks
- Multiple social posts with interactions
- Memory albums with photos
- User playlists
- Videos
- Study resources and notes
- Tasks with different statuses
- Follower relationships

## Authentication

Requests requiring authentication should include a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained from `/api/auth/login` or `/api/auth/register`

## Development

```bash
npm run dev      # Start dev server with auto-reload
npm run build    # Build TypeScript
npm run migrate  # Run database migrations
npm run seed     # Seed database with sample data
```

## Production Build

```bash
npm run build
npm start
```
