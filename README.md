# Classwork Schedule Planner

A beginner-friendly MERN application for a weekly class timetable and the tasks attached to each class.

## Requirements

- Node.js 20.19 or newer (or Node.js 22.12 or newer)
- npm, included with Node.js
- MongoDB, either installed locally or hosted by MongoDB Atlas

## First-time setup

1. Install Node.js and npm if they are not already installed.
2. Start a local MongoDB server, or create a MongoDB Atlas database.
3. In a terminal, open the `server` folder and install its packages:

   ```powershell
   cd server
   npm install
   Copy-Item .env.example .env
   ```

4. Edit `server/.env` and set `MONGODB_URI`.
5. In a second terminal, install the client packages:

   ```powershell
   cd client
   npm install
   ```

## Run the development app

Start the backend in one terminal:

```powershell
cd server
npm run dev
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The starter screen checks the Express API and MongoDB connection. The server health endpoint is available at `http://localhost:5000/api/health`.

## MongoDB connection

For a local MongoDB server, the example connection string is:

```text
mongodb://127.0.0.1:27017/classwork_planner
```

For MongoDB Atlas, copy the connection string from your Atlas cluster, replace its password/database placeholders, and put it in `MONGODB_URI` in `server/.env`. Keep `.env` private; it is excluded from Git.

On startup, the server creates or reuses one development user (`student@example.com`). This lets future class and task records reference a user without implementing authentication yet. It is only a shared development identity, not a secure multi-user setup.

## Project layout

```text
client/   React interface built with Vite
server/   Express API and MongoDB connection
```

The project is being built one phase at a time. At this point, the app only verifies that the browser can reach the server and that the server can connect to MongoDB.
