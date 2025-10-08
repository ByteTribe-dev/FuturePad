# FuturePad Server

Backend server for the FuturePad application built with Node.js, Express.js, and MongoDB.

## Features

- User authentication (register/login) with JWT
- CRUD operations for letters
- MongoDB integration with Mongoose
- Input validation
- CORS support
- Environment configuration

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Navigate to the server directory:

   ```bash
   cd FuturePadServer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy `.env` file and update the values:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/futurepad
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start MongoDB (if running locally):

   ```bash
   mongod
   ```

5. Run the server:

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Letters

- `GET /api/letters` - Get all letters for authenticated user
- `GET /api/letters/:id` - Get specific letter
- `POST /api/letters` - Create new letter
- `PUT /api/letters/:id` - Update letter
- `DELETE /api/letters/:id` - Delete letter

## Project Structure

```
src/
├── index.js          # Main server file
├── models/           # MongoDB models
│   ├── User.js
│   └── Letter.js
├── routes/           # API routes
│   ├── auth.js
│   └── letters.js
└── middleware/       # Custom middleware
    └── auth.js
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
