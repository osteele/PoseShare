# Source

This is the source code for the Pose Share web app.

## Overview

Pose Share allows multiple users to share their poses in a virtual space using webcam video and machine learning pose detection.

The frontend code in this src folder handles:

- Webcam video capture and playback
- Initializing and running the BlazePose pose detection model
- Drawing the detected poses on the canvas 
- Networking via Socket.IO to sync poses between clients
- A gallery view showing all participants
- User interface controls

The app is built with:

- [p5.js](https://p5js.org/) - For canvas rendering and webcam capture
- [BlazePose](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection) - For pose detection
- [Socket.IO](https://socket.io/) - For networking and syncing poses between clients
- [dat.GUI](https://github.com/dataarts/dat.gui) - For the settings UI

## Key Files

- `blazePose.ts` 
  - Initializes the BlazePose model using `@tensorflow-models/pose-detection`
  - Configures the model based on settings
  - Runs pose detection on the webcam video stream
  - Emits "pose" events with the detected poses

- `camera.ts`
  - Uses p5.js to capture video from the webcam
  - Manages selecting/switching between different cameras
  - Mirrors and draws the video onto the canvas
  - Exposes the video stream to other modules

- `drawPose.ts`
  - Draws the detected keypoints and skeleton onto the canvas 
  - Supports different visualization modes like skeleton, metaballs etc.
  - Handles color, trails, outlines etc based on settings

- `gallery.ts`
  - Renders a gallery view showing all participants using SVG
  - Displays each participant on a grid according to their position
  - Shows pose keypoints and skeleton for each person
  
- `metaballs.ts`
  - Implements the metaballs visualization for poses
  - Uses a shader to draw the pose as a continuous organic shape

- `performers.ts`
  - Stores the list of participants and their latest pose
  - Syncs poses received over the network
  - Handles fading out old poses into trails
  - Emits updated performers list
  
- `settings.ts`
  - Defines app settings with dat.GUI controls
  - Saves settings to localStorage
  - Emits events on setting changes
  
- `socket.ts`
  - Establishes Socket.IO connection
  - Joins room and syncs data like poses and performers
  - Emits socket events with local user's pose
  
- `sketch.ts`
  - The main p5 sketch file
  - Sets up canvas, webcam capture, BlazePose
  - Draws the scene with poses
  - Hooks up UI and event handlers

## Additional Files

- `dashboard.ts` - Initializes and updates the dashboard widget

- `env.d.ts` - TypeScript ambient type declarations for environment variables

- `htmlLog.ts` - Logs messages to the HTML log element

- `p5.d.ts` - Additional TypeScript declarations for p5.js

- `pose-utils.ts` - Utility functions for poses like smoothing

- `poseOffset.ts` - Handles moving poses with arrow keys

- `room.ts` - Stores info about the virtual room

- `skeleton.ts` - Generates the skeleton lines from keypoints

- `style.css` - Stylesheet for the app 

- `tsconfig.json` - TypeScript config

- `types.ts` - Type declarations for app types

- `username.ts` - Gets/sets local username

- `utils.ts` - General utility functions

- `shaders/` - GLSL shaders
  - `metaballs.frag` - Fragment shader for metaballs
  - `metaballs.vert` - Vertex shader for metaballs

## Import flows

Description of how the imports flow between files:

- `sketch.ts`
  - Imports ← `camera.ts`
  - Imports ← `blazePose.ts`
  - Imports ← `performers.ts`
  - Imports ← `settings.ts`
  - Imports ← `socket.ts`

- `blazePose.ts`
  - Imports ← `pose-utils.ts`
  - Imports → `sketch.ts`

- `camera.ts`
  - Imports ← `settings.ts` 
  - Exports → `sketch.ts`

- `performers.ts`
  - Imports ← `blazePose.ts`
  - Imports ← `pose-utils.ts` 
  - Imports ← `settings.ts`
  - Exports → `sketch.ts`

- `settings.ts`
  - Exports → `sketch.ts`
  - Exports → `camera.ts` 
  - Exports → `performers.ts`

- `socket.ts`
  - Imports ← `performers.ts`
  - Imports ← `blazePose.ts`
  - Exports → `sketch.ts`

- `pose-utils.ts`
  - Exports → `blazePose.ts`
  - Exports → `performers.ts`

So the main flow is:

`sketch.ts` ← `camera.ts`, `blazePose.ts`, `performers.ts`, `settings.ts`, `socket.ts`

With utility modules like `pose-utils.ts` flowing into some of those.


## Usage

The source files are written in TypeScript and need to be compiled to JavaScript before running.

See the main [README](../README.md) for more info.


## Dev possibilities

- Global mutable state - Several modules like `performers.ts`, `settings.ts`, and `poseOffset.ts` use global variables to store state. This makes the code harder to reason about.

- Library imports aliased to namespace imports - Imports like `import * as d3 from 'd3'` can make it unclear where specific members come from.

- HTML DOM access - Some modules directly access the DOM elements like `document.getElementById` rather than passing them as parameters.

- Type casts - There are several `foo as SomeType` casts to work around incomplete types. Ideal to improve the types.

- Comments documenting type limitations - Related to above, some comments explain insufficient types like the BlazePose keypoints.

- Inconsistent naming conventions - Some files use camelCase, others use underscore_case. 

- Spread object copies - Perform shallow copies via `{...obj}` instead of more explicit clones.

- Circular imports - `performers.ts` and `blazePose.ts` have a circular import relationship.

- Global error handling - Some modules just log errors globally rather than passing them to callers.

<!-- - HTML element style - Inline styles used in some places rather than CSS classes.

- Client-side username storage - Username is stored in LocalStorage rather than handled on server.

- Splash screen logic - Initial "live reload" splash screen logic is overly complex.

- Lack of build tooling - No bundler, minifier, linter configured out of the box. -->
