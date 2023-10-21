# Server

This is the server code for the PoseShare app. It handles the WebSocket connections, tracks connected clients, and broadcasts pose data between clients.

## Features

- Uses Socket.IO for realtime WebSocket communication
- Keeps track of connected "performers" and their data like name, position, etc.
- Broadcasts performer data to all clients when performers connect, disconnect, or send pose data
- Reads room configuration from `rooms.json`
- Sends each client their assigned room data 
- Simple logging of connected clients

## Structure

- `server.ts` - Main entry point, creates HTTP server, attaches Socket.IO, sets up routes
- `performers.ts` - Tracks connected performers and handles the "performers" event
- `rooms.ts` - Reads room config from `rooms.json` 
- `types.ts` - Type definitions

## Running Locally

The server requires Node.js v16+.
The server will start on port 3000.
See the main [README](../README.md) for more info.

## Deployment

The server is deployable to any Node.js hosting platform. Good options are Vercel, Netlify, or Heroku.

Make sure to configure the environment variables for production:

- `PORT` - Port for the server to listen on
- `NODE_ENV` - Set to `production`