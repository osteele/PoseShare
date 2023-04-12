# Development

## Running the server

Install the package: `yarn install`.

Copy `config/rooms-template.json` to `config/rooms.json`. This latter file is
not under version control.

## Environment

Add these to `.env` or `.env.local`:

`VITE_RELOAD_ON_CANVAS_MODE_CHANGE` — if true, the client reloads when the pose
type is changed between one that requires Canvas2D, and one that requires WebGL.
