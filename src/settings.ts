import dat from "dat.gui";
import { getHashParameter, setHashParameter } from "./utils";

// dat.GUI is a lightweight GUI library that can be used to create a GUI for
// controlling the settings of the app.
//
// See https://github.com/dataarts/dat.gui#readme
const gui = new dat.GUI({ autoPlace: false });

export const DEFAULT_APPEARANCE = "skeleton";
const initialAppearance = getHashParameter("appearance") || DEFAULT_APPEARANCE;

// If true, the page will reload when the appearance changes between one that
// requires WebGL, versus one that uses Canvas. Currently this is disabled, in
// order to test whether this may be responsible for the continual page refresh
// issue.
const reloadPageOnModeChange = Boolean(
  import.meta.env.VITE_RELOAD_ON_CANVAS_MODE_CHANGE
);

// The confidence threshold is the minimum confidence score that a keypoint must
// have in order to be used in the presentation.
export let confidenceThreshold = 0.95;

// #region cameraName
//
// TODO: Replace this with a more general solution for storing all the settings.
// See issue #4 Save configuration information to localStorage

const CAMERA_NAME_KEY = "cameraName";

function getCameraName(): string | null {
  return localStorage[CAMERA_NAME_KEY];
}

export function setCameraName(name: string) {
  settings.cameraName = name;
  localStorage[CAMERA_NAME_KEY] = name;
}
// #endregion

// A minimal specification of a subset of the  `settings` object. This is jsut
// enough to tell the compiler that cameraName, although initialized to null,
// can also be a string.
type Settings = {
  cameraName: string | null;
  [key: string]: any;
};

export const settings: Settings = {
  name: "",
  mirrorVideo: true,
  showSelf: true,
  outlineSelf: false,
  appearance: initialAppearance,
  smoothing: 0.8,
  trail: 5,
  metaballRadius: 0.5,

  // These don't have GUI settings at the moment
  cameraName: getCameraName(),
  width: 880,
  height: 500,
  toroidalMovement: true,
  useWebGL: appearanceRequiresWebGL(initialAppearance),
  // useWebGL: getQueryParameter('webgl') === 'true',

  // Enable the following to draw the image on the canQvas. Currently it is
  // rendered via a <video> element placed behind theQ canvas.
  drawVideoOnCanvas: false,

  // maximum of the length of previousPoses
  posesMaxLength: 10,

  // debugging info
  debugging: false,
  confidenceThreshold: confidenceThreshold,
};

var debuggingInfoFolder: dat.GUI;

export const guiControllers = {
  username: gui.add(settings, "name").name("User Name").listen(),
  mirrorVideo: gui.add(settings, "mirrorVideo").name("Mirror Video"),
  outlineSelf: gui.add(settings, "outlineSelf").name("Outline Self"),
  appearance: gui
    .add(settings, "appearance")
    .options(["skeleton", "kiki", "bouba", "metaballs"]),
};
gui.add(settings, "metaballRadius", 0.25, 2).name("Metaball Radius");
gui.add(settings, "smoothing", 0, 0.95, 0.05);
gui.add(settings, "trail", 0, 10);
gui.add(settings, "debugging").onChange( () => {
  if (settings.debugging) {
    debuggingInfoFolder = gui.addFolder("debugging info");
    debuggingInfoFolder.add(settings, "confidenceThreshold", 0.05, 0.95, 0.05);
  } else {
    gui.removeFolder(debuggingInfoFolder);
  }
})

document.querySelector("#dat-container")!.appendChild(gui.domElement);

guiControllers.appearance.onChange((appearance) => {
  const useWebGL = appearanceRequiresWebGL(appearance);
  if (useWebGL != settings.useWebGL) {
    const url = new URL(window.location.href);
    setHashParameter(url, "appearance", appearance);
    // Add or remove the webgl query parameter from the document URL and reload the page
    // if (useWebGL) {
    //   url.searchParams.set('webgl', useWebGL);
    // } else {
    //   url.searchParams.delete('webgl');
    // }

    // Reload the page when the appearance changes between one that requires
    // WebGL, versus one that uses Canvas
    if (reloadPageOnModeChange) {
      window.location.href = url.href;
      // reload the page
      window.location.reload();
    }
  }
});

function appearanceRequiresWebGL(appearance: string | true): boolean {
  return appearance === "metaballs";
}
