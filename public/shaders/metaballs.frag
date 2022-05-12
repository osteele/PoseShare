// based on : https://thebookofshaders.com/edit.php?log=160414040804
// Author @kynd - 2016
// Title: Distance field metaball
// http://www.kynd.info

#ifdef GL_ES
precision mediump float;
#endif

uniform float w;
uniform float h;
// uniform points;
uniform float mouseX;
uniform float mouseY;
uniform float u_time;

uniform float nose0;
uniform float nose1;
uniform float left_index0;
uniform float left_index1;
uniform float right_index0;
uniform float right_index1;
uniform float left_knee0;
uniform float left_knee1;
uniform float right_knee0;
uniform float right_knee1;
uniform float hip0;
uniform float hip1;


float smoothen(float d1, float d2) {
    float k = mouseX;
    return -log(exp(-k * d1) + exp(-k * d2)) / k;
}

void main() {
    vec2 u_resolution = vec2(w,h);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    vec2 p0 = vec2(nose0, nose1);
    vec2 p1 = vec2(left_index0, left_index1);
    vec2 p2 = vec2(right_index0, right_index1);
    vec2 p3 = vec2(left_knee0, left_knee1);
    vec2 p4 = vec2(right_knee0, right_knee1);
    vec2 p5 = vec2(hip0, hip1);


    // vec2 p0 = vec2(points[0][0], points[0][1]);
    // vec2 p1 = vec2(points[1][0], points[1][1]);
    // vec2 p2 = vec2(points[2][0], points[2][1]);
    // vec2 p3 = vec2(points[3][0], points[3][1]);
    // vec2 p4 = vec2(points[4][0], points[4][1]);
    // vec2 p5 = vec2(points[5][0], points[5][1]);

//     vec2 p0 = vec2(2,3);
//     vec2 p1 = vec2(1,1);
//     vec2 p2 = vec2(1,2);
//     vec2 p3 = vec2(1,3);
//     vec2 p4 = vec2(2,1);
//     vec2 p5 = vec2(2,2);

    float d0 = smoothen(distance(st, p0) * 15., distance(st, p1) * 15.);
    float d1 = smoothen(distance(st, p0) * 15.0, distance(st, p2) * 15.);
    float d2 = smoothen(distance(st, p0) * 15.0, distance(st, p3) * 15.);
    float d3 = smoothen(distance(st, p0) * 15.0, distance(st, p4) * 15.);
    float d4 = smoothen(distance(st, p0) * 15.0, distance(st, p5) * 15.);

    float d5 = smoothen(distance(st, p1) * 15.0, distance(st, p2) * 15.);
    float d6 = smoothen(distance(st, p1) * 15.0, distance(st, p3) * 15.);
    float d7 = smoothen(distance(st, p1) * 15.0, distance(st, p4) * 15.);
    float d8 = smoothen(distance(st, p1) * 15.0, distance(st, p5) * 15.);

    float d9 = smoothen(distance(st, p2) * 15.0, distance(st, p3) * 15.);
    float d10 = smoothen(distance(st, p2) * 15.0, distance(st, p4) * 15.);
    float d11 = smoothen(distance(st, p2) * 15.0, distance(st, p5) * 15.);

    float d12 = smoothen(distance(st, p3) * 15.0, distance(st, p4) * 15.);
    float d13 = smoothen(distance(st, p3) * 15.0, distance(st, p5) * 15.);

    float d14 = smoothen(distance(st, p4) * 15.0, distance(st, p5) * 15.);

	float ae = 1. / u_resolution.y;

    vec3 color0 = vec3(smoothstep(mouseY, 0.520+ae, d0));
    vec3 color1 = vec3(smoothstep(mouseY, 0.520+ae, d1));
    vec3 color2 = vec3(smoothstep(mouseY, 0.520+ae, d2));
    vec3 color3 = vec3(smoothstep(mouseY, 0.520+ae, d3));
    vec3 color4 = vec3(smoothstep(mouseY, 0.520+ae, d4));
    vec3 color5 = vec3(smoothstep(mouseY, 0.520+ae, d5));
    vec3 color6 = vec3(smoothstep(mouseY, 0.520+ae, d6));
    vec3 color7 = vec3(smoothstep(mouseY, 0.520+ae, d7));
    vec3 color8 = vec3(smoothstep(mouseY, 0.520+ae, d8));
    vec3 color9 = vec3(smoothstep(mouseY, 0.520+ae, d9));
    vec3 color10 = vec3(smoothstep(mouseY, 0.520+ae, d10));
    vec3 color11 = vec3(smoothstep(mouseY, 0.520+ae, d11));
    vec3 color12 = vec3(smoothstep(mouseY, 0.520+ae, d12));
    vec3 color13 = vec3(smoothstep(mouseY, 0.520+ae, d13));
    vec3 color14 = vec3(smoothstep(mouseY, 0.520+ae, d14));


    gl_FragColor = vec4(color0+color1+color2+color3+color4+color5+color6+color7+color8+color9+color10+color11+color12+color13+color14, 1.0);
}
