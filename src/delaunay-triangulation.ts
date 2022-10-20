import vertShaderFile from "./delaunay-triangulation.vert";
import fragShaderFile from "./delaunay-triangulation.frag";


function createVertexShader(gl: WebGLRenderingContext, file: string): WebGLShader {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, file);
  gl.compileShader(vertexShader);
  var success: boolean = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (success) {
    return vertexShader;
  }

  console.log(gl.getShaderInfoLog(vertexShader));
  gl.deleteShader(vertexShader);
}


function createFragmentShader(gl: WebGLRenderingContext, file: string): WebGLShader {
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, file);
  gl.compileShader(fragmentShader);
  var success: boolean = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (success) {
    return fragmentShader;
  }

  console.log(gl.getShaderInfoLog(fragmentShader));
  gl.deleteShader(fragmentShader);
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function pointsToFan(points: number[], desiredEdgePoints: number, radius: number): number[] {
  var fans: number[] = [];
  for (var i = 0; i < points.length; i += 2) {
    var stepSize = ((2 * Math.PI) / desiredEdgePoints);
    for (var d = 0.0; d <= (2 * Math.PI); d += stepSize) {
      fans = fans.concat([points[i], points[i + 1],
                          (Math.sin(d) * radius + points[i]),
                          (Math.cos(d) * radius + points[i + 1]),
                          (Math.sin(d + stepSize) * radius + points[i]),
                          (Math.cos(d + stepSize) * radius + points[i + 1])]);
    }
  }
  return fans;
}

function display(gl: WebGLRenderingContext, lines: number[], points: number[]):void {
  var vertexShader = createVertexShader(gl, vertShaderFile);
  var fragmentShader = createFragmentShader(gl, fragShaderFile);

  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
  var colorUniformLocation = gl.getUniformLocation(program, "vColor");
  var pointUniformLocation = gl.getUniformLocation(program, "point");

  var positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  points = pointsToFan(points, 12, 0.02);

  var buffer = lines.concat(points)

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.094, 0.094, 0.145, 1);  // Catppuccin Mocha Mantle
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var size: number = 2;  // 2 elements per point
  var type = gl.FLOAT;  // The elements are floats
  var normalize: boolean = false;
  var stride: number = 0;
  var offset: number = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  gl.uniform4f(colorUniformLocation, 0.537, 0.706, 0.980, 1);
  gl.uniform1i(pointUniformLocation, 1);

  var primativeType = gl.LINES;
  var offset = 0;
  var count = lines.length / 2;
  console.log(count);
  gl.drawArrays(primativeType, offset, count);

  gl.uniform4f(colorUniformLocation, 0.953, 0.545, 0.659, 1);
  gl.uniform1i(pointUniformLocation, 1);

  var primativeType = gl.TRIANGLES;
  var offset = lines.length / 2;
  var count = points.length / 2;
  gl.drawArrays(primativeType, offset, count);
}

function run(): void {
  const canvas = document.querySelector("canvas");

  const gl = canvas.getContext("webgl");

  if (!gl) {
    // TODO: add something displaying error to user.
  }

  var lines = []
  var points = []

  display(gl, lines, points);

  canvas.onmousedown = function(event: MouseEvent) {
    console.log("offsetX:" + event.offsetX);
    console.log("offsetY:" + event.offsetY);

    var x = (-canvas.width / 2 + event.offsetX) / (canvas.width / 2);
    var y = (canvas.height / 2 - event.offsetY) / (canvas.height / 2);

    console.log("X: " + x);
    console.log("Y: " + y);

    points = points.concat([x, y]);  // TODO: check if the point is already in the list. (edge case, but still.)
    display(gl, lines, points);
  }
}

run()
