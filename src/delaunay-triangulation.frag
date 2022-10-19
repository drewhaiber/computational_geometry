precision mediump float;
uniform vec4 vColor;
uniform int point;

void main() {
  //vec4 red = vec4(0.953, 0.545, 0.659, 1); // Catppuccin Mocha Red
  //vec4 blue = vec4(0.537, 0.706, 0.980, 1);  // Catppuccin Mocha Blue

  gl_FragColor = vColor;
}

