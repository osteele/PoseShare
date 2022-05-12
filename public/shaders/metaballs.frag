// based on : https://thebookofshaders.com/edit.php?log=160414040804
// Author @kynd - 2016
// Title: Distance field metaball
// http://www.kynd.info

#ifdef GL_ES
precision mediump float;
#endif

uniform float w;
uniform float h;
uniform float millis;
uniform float mouseX;
uniform float mouseY;
uniform float hue;
uniform float sat;

// TODO: replace this by an array
uniform float nose_x;
uniform float nose_y;
uniform float leftShoulder_x;
uniform float leftShoulder_y;
uniform float rightShoulder_x;
uniform float rightShoulder_y;
uniform float leftElbow_x;
uniform float leftElbow_y;
uniform float rightElbow_x;
uniform float rightElbow_y;
uniform float leftWrist_x;
uniform float leftWrist_y;
uniform float rightWrist_x;
uniform float rightWrist_y;
uniform float leftKnee_x;
uniform float leftKnee_y;
uniform float rightKnee_x;
uniform float rightKnee_y;
uniform float leftHip_x;
uniform float leftHip_y;
uniform float rightHip_x;
uniform float rightHip_y;
uniform float leftAnkle_x;
uniform float leftAnkle_y;
uniform float rightAnkle_x;
uniform float rightAnkle_y;
uniform float hip0;
uniform float hip1;

float contributionConfidenceWeight(vec2 pt) {
  return (pt.x == -1.0 && pt.y == -1.0) ? 0.0 : 1.0;
}

float contribution(vec2 pt, vec2 st) {
  if(pt.x == -1.0 && pt.y == -1.0) {
    return 0.0;
  }
  return 1.0 / dot(pt - st, pt - st) / 2.0;
}

float smoothen(float d1, float d2) {
  float k = mouseX;
  return -log(exp(-k * d1) + exp(-k * d2)) / k;
}

// C code to convert hsv to rgb
// https://www.rapidtables.com/convert/color/hsv-to-rgb.html
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 u_resolution = vec2(w, h);
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  vec2 nose = vec2(nose_x, nose_y);
  vec2 leftShoulder = vec2(leftShoulder_x, leftShoulder_y);
  vec2 rightShoulder = vec2(rightShoulder_x, rightShoulder_y);
  vec2 leftElbow = vec2(leftElbow_x, leftElbow_y);
  vec2 rightElbow = vec2(rightElbow_x, rightElbow_y);
  vec2 leftWrist = vec2(leftWrist_x, leftWrist_y);
  vec2 rightWrist = vec2(rightWrist_x, rightWrist_y);
  vec2 leftHip = vec2(leftHip_x, leftHip_y);
  vec2 rightHip = vec2(rightHip_x, rightHip_y);
  vec2 leftKnee = vec2(leftKnee_x, leftKnee_y);
  vec2 rightKnee = vec2(rightKnee_x, rightKnee_y);
  vec2 leftAnkle = vec2(leftAnkle_x, leftAnkle_y);
  vec2 rightAnkle = vec2(rightAnkle_x, rightAnkle_y);
  vec2 hip = vec2(hip0, hip1);

  float v = 0.0;
  v += contribution(nose, st) / 3.0;
  v += contribution(leftShoulder, st);
  v += contribution(rightShoulder, st);
  v += contribution(leftElbow, st);
  v += contribution(rightElbow, st);
  v += contribution(leftWrist, st);
  v += contribution(rightWrist, st);
  v += contribution(leftHip, st);
  v += contribution(rightHip, st);
  v += contribution(leftKnee, st);
  v += contribution(rightKnee, st);
  v += contribution(leftAnkle, st);
  v += contribution(rightAnkle, st);
  // v += contribution(hip, st);
  v /= contributionConfidenceWeight(nose) +
    contributionConfidenceWeight(leftShoulder) + contributionConfidenceWeight(rightShoulder) +
    contributionConfidenceWeight(leftElbow) + contributionConfidenceWeight(rightElbow) +
    contributionConfidenceWeight(leftWrist) + contributionConfidenceWeight(rightWrist) +
    contributionConfidenceWeight(leftHip) + contributionConfidenceWeight(rightHip) +
    contributionConfidenceWeight(leftAnkle) + contributionConfidenceWeight(rightAnkle) +
    contributionConfidenceWeight(leftKnee) + contributionConfidenceWeight(rightKnee);
  v /= 2.0;

  float threshold = 0.9;
  if(v > threshold) {
    float opacity = v >= 1.0 ? 1.0 : (v - 0.9) * 10.0;
    float sat2 = 0.75 + 0.2 * cos(15.0 * st.y + millis / 200.0);
    gl_FragColor = vec4(hsv2rgb(vec3(hue, sat2, 1.0)), 0.75 * opacity);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
