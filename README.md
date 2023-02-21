# PoseShare

Share pose detection data between multiple browser clients connected to the same
server.

This code supports of the Movement Practices choreography project.

The client and server are written in Typescript. They use the
[Socket.IO](https://socket.io) library to communicate.

## Setup

Install npm.

Run `yarn install`.

## Usage

1. Run `yarn start`.
2. Use a web browser to visit <http://localhost:3000>.

## Development

### Client development

Set up and start the server as above.

The server will restart when source files are changed.

The browser page needs to be manually reloaded.

### Server development

Additional development documentation is in this repository's `docs/` directory,
and the [project wiki](https://github.com/osteele/PoseShare/wiki/).

### Directory Organization

Subdirectories:

- `common/` — source files that are shared between the client and server
- `config/` — configuration files for the client and server
- `public/` — static files that are served by the embedded web server
- `server/` — TypeScript source code for the http (web and API) server
- `src/` — TypeScript source code for client

Top-level files:

- `index.html` — static file that is served by the embedded web server
- `nodemon.json` — [Nodemon](https://nodemon.io) configuration file
- `package.json` — an npm
  [package](https://docs.npmjs.com/cli/v6/configuring-npm/package-json), that
  specifies library dependencies, build tools, and the build and development
  commands.

The client source directory is named `src` instead of `client`, so that it will
work with the default configuration of Vite.

## License

Copyright 2022 by Oliver Steele. Available under the MIT License.
