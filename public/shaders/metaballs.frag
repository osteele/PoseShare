// based on : https://thebookofshaders.com/edit.php?log=160414040804
// Author @kynd - 2016
// Title: Distance field metaball
// http://www.kynd.info

#ifdef GL_ES
precision mediump float;
#endif

uniform float w;
uniform float h;
uniform float mouseX;
uniform float mouseY;
uniform float u_time;

uniform float nose_x;
uniform float nose_y;
uniform float left_index_x;
uniform float left_index_y;
uniform float right_index_x;
uniform float right_index_y;
uniform float left_knee_x;
uniform float left_knee_y;
uniform float right_knee_x;
uniform float right_knee_y;
uniform float hip0;
uniform float hip1;

float contribution(vec2 p0, vec2 st) {
  if(p0.x == -1.0 && p0.y == -1.0) {
    return 0.0;
  }
  return 1.0 / dot(p0 - st, p0 - st);
}

float smoothen(float d1, float d2) {
  float k = mouseX;
  return -log(exp(-k * d1) + exp(-k * d2)) / k;
}

void main() {
  vec2 u_resolution = vec2(w, h);
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  vec2 p0 = vec2(nose_x, nose_y);
  vec2 p1 = vec2(left_index_x, left_index_y);
  vec2 p2 = vec2(right_index_x, right_index_y);
  vec2 p3 = vec2(left_knee_x, left_knee_y);
  vec2 p4 = vec2(right_knee_x, right_knee_y);
  vec2 p5 = vec2(hip0, hip1);

  float v = 0.0;
  v += contribution(p0, st);
  v += contribution(p1, st);
  v += contribution(p2, st);
  v += contribution(p3, st);
  // v += contribution(p4, st);
  // v += contribution(p5, st);
  v /= 10.0;

  if(v > 1.0) {
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
