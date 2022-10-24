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

class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public cmult(c: number): Point {
    return new Point(this.x * c, this.y * c);
  }

  public add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  public sub(other: Point): Point {
    return this.add(other.cmult(-1));
  }

  public equals(other: Point): boolean {
    return this.x == other.x && this.y == other.y;
  }

  public mag(): number {
    return Math.sqrt((this.x ** 2) + (this.y ** 2));
  }

  public crossMag(other: Point):number {
    return Math.abs((this.x * other.x) + (this.y * other.y));
  }

  public dot(other: Point): number {
    return (this.x * other.x) + (this.y * other.y);
  }

  public pair(): number[] {
    return [this.x, this.y];
  }
}

class Triangle {
  public p1: Point;
  public p2: Point;
  public p3: Point;

  constructor(p1: Point, p2: Point, p3: Point) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  public equals(other: Triangle): boolean {
    return ((this.p1 == other.p1 && this.p2 == other.p2 && this.p3 == other.p3) ||
            (this.p1 == other.p1 && this.p2 == other.p3 && this.p3 == other.p2) ||
            (this.p1 == other.p2 && this.p2 == other.p1 && this.p3 == other.p3) ||
            (this.p1 == other.p2 && this.p2 == other.p3 && this.p3 == other.p1) ||
            (this.p1 == other.p3 && this.p2 == other.p1 && this.p3 == other.p2) ||
            (this.p1 == other.p3 && this.p2 == other.p2 && this.p3 == other.p1));
  }
  
  public hasCommmonVertex(other): boolean {
    return (this.p1 == other.p1 || this.p2 == other.p1 || this.p3 == other.p1 ||
            this.p1 == other.p2 || this.p2 == other.p2 || this.p3 == other.p2 ||
            this.p1 == other.p3 || this.p2 == other.p3 || this.p3 == other.p3);
  }

  // TODO: get edges if we need

  public getCircumradius(): number {
    var num: number = (this.p1.sub(this.p2).mag() *
                       this.p2.sub(this.p3).mag() * 
                       this.p3.sub(this.p1).mag());
    var denom: number = 2 * this.p1.sub(this.p2).crossMag(this.p2.sub(this.p3));
    return num / denom;
  }

  public getCircumcenter(): Point {
    var denom: number = 2 * (this.p1.sub(this.p2).crossMag(this.p2.sub(this.p3)) ** 2);
    var alpha: number = ((this.p2.sub(this.p3).mag() ** 2) * this.p1.sub(this.p3).dot(this.p1.sub(this.p2))) / denom;
    var beta: number = ((this.p1.sub(this.p3).mag() ** 2) * this.p2.sub(this.p3).dot(this.p2.sub(this.p1))) / denom;
    var gamma: number = ((this.p1.sub(this.p2).mag() ** 2) * this.p3.sub(this.p1).dot(this.p3.sub(this.p2))) / denom;
    return this.p1.cmult(alpha).add(this.p2.cmult(beta)).add(this.p3.cmult(gamma));
  }

  public inCircumscribe(point: Point): boolean {
    return this.getCircumcenter().sub(point).mag() < this.getCircumradius();
  }
}

function triangulation(gl: WebGLRenderingContext, points: number[], step: boolean = false) {
  var pointsList: Point[] = [];
  var triangles: Triangle[] = [];
  
  if (points.length < 2) {
    return triangles;
  }

  var minX: number = points[0];
  var maxX: number = minX;
  var minY: number = points[1];
  var maxY: number = minY;

  for (var i: number = 0; i < points.length; i += 2) {
    if (points[i] < minX) {
      minX = points[i];
    }
    if (points[i] > maxX) {
      maxX = points[i];
    }
    if (points[i + 1] < minY) {
      minY = points[i + 1];
    }
    if (points[i + 1] > maxY) {
      maxY = points[i + 1];
    }

    pointsList.push(new Point(points[i], points[i + 1]));
  }

  var width: number = maxX - minX;
  var height: number = maxY - minY;
  var point1: Point = new Point(minX - 2 - Math.floor(width / 2), minY - Math.floor(height / 10) - 1);
  var point2: Point = new Point(maxX + 2 + Math.floor(width / 2), minY - Math.floor(height / 10) - 1);
  var point3: Point = new Point(Math.floor((minX + maxX) / 2), maxY + 1 + height + Math.floor(height / 2));
  var superTriangle: Triangle = new Triangle(point1, point2, point3);

  triangles.push(superTriangle)

  var center: Point = superTriangle.getCircumcenter();
  var radius: number = superTriangle.getCircumradius();

  
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
