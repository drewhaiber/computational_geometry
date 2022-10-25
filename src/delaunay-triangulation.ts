import vertShaderFile from "./delaunay-triangulation.vert";
import fragShaderFile from "./delaunay-triangulation.frag";


function createVertexShader(gl: WebGLRenderingContext, file: string): WebGLShader {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, file);
  gl.compileShader(vertexShader);
  let success: boolean = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
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
  let success: boolean = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (success) {
    return fragmentShader;
  }

  console.log(gl.getShaderInfoLog(fragmentShader));
  gl.deleteShader(fragmentShader);
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function pointsToFan(points: number[], desiredEdgePoints: number, radius: number): number[] {
  let fans: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    let stepSize = ((2 * Math.PI) / desiredEdgePoints);
    for (let d = 0.0; d <= (2 * Math.PI); d += stepSize) {
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
  let vertexShader = createVertexShader(gl, vertShaderFile);
  let fragmentShader = createFragmentShader(gl, fragShaderFile);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
  let colorUniformLocation = gl.getUniformLocation(program, "vColor");
  let pointUniformLocation = gl.getUniformLocation(program, "point");

  let positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  points = pointsToFan(points, 12, 0.02);

  let buffer = lines.concat(points)

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.094, 0.094, 0.145, 1);  // Catppuccin Mocha Mantle
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let size: number = 2;  // 2 elements per point
  let type = gl.FLOAT;  // The elements are floats
  let normalize: boolean = false;
  let stride: number = 0;
  let offset: number = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  gl.uniform4f(colorUniformLocation, 0.537, 0.706, 0.980, 1);
  gl.uniform1i(pointUniformLocation, 1);

  let primativeType = gl.LINES;
  offset = 0;
  let count = lines.length / 2;
  console.log(count);
  gl.drawArrays(primativeType, offset, count);

  gl.uniform4f(colorUniformLocation, 0.953, 0.545, 0.659, 1);
  gl.uniform1i(pointUniformLocation, 1);

  primativeType = gl.TRIANGLES;
  offset = lines.length / 2;
  count = points.length / 2;
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
    return Math.abs((this.x * other.y) - (this.y * other.x));
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
    return ((this.p1.equals(other.p1) && this.p2.equals(other.p2) && this.p3.equals(other.p3)) ||
            (this.p1.equals(other.p1) && this.p2.equals(other.p3) && this.p3.equals(other.p2)) ||
            (this.p1.equals(other.p2) && this.p2.equals(other.p1) && this.p3.equals(other.p3)) ||
            (this.p1.equals(other.p2) && this.p2.equals(other.p3) && this.p3.equals(other.p1)) ||
            (this.p1.equals(other.p3) && this.p2.equals(other.p1) && this.p3.equals(other.p2)) ||
            (this.p1.equals(other.p3) && this.p2.equals(other.p2) && this.p3.equals(other.p1)));
  }
  
  public hasCommmonVertex(other: Triangle): boolean {
    return (this.p1.equals(other.p1) || this.p2.equals(other.p1) || this.p3.equals(other.p1) ||
            this.p1.equals(other.p2) || this.p2.equals(other.p2) || this.p3.equals(other.p2) ||
            this.p1.equals(other.p3) || this.p2.equals(other.p3) || this.p3.equals(other.p3));
  }

  public getEdges(): Point[][] {
    return [[this.p1, this.p2], [this.p2, this.p3], [this.p3, this.p1]];
  }

  public getCircumradius(): number {
    let num: number = (this.p1.sub(this.p2).mag() *
                       this.p2.sub(this.p3).mag() * 
                       this.p3.sub(this.p1).mag());
    let denom: number = 2 * this.p1.sub(this.p2).crossMag(this.p2.sub(this.p3));
    return num / denom;
  }

  public getCircumcenter(): Point {
    let denom: number = 2 * (this.p1.sub(this.p2).crossMag(this.p2.sub(this.p3)) ** 2);
    let alpha: number = ((this.p2.sub(this.p3).mag() ** 2) * this.p1.sub(this.p3).dot(this.p1.sub(this.p2))) / denom;
    let beta: number = ((this.p1.sub(this.p3).mag() ** 2) * this.p2.sub(this.p3).dot(this.p2.sub(this.p1))) / denom;
    let gamma: number = ((this.p1.sub(this.p2).mag() ** 2) * this.p3.sub(this.p1).dot(this.p3.sub(this.p2))) / denom;
    return this.p1.cmult(alpha).add(this.p2.cmult(beta)).add(this.p3.cmult(gamma));
  }

  public inCircumscribe(point: Point): boolean {
    return this.getCircumcenter().sub(point).mag() < this.getCircumradius();
  }

  public hasEdge(endPoint1: Point, endPoint2: Point): boolean {
    return ((this.p1.equals(endPoint1) || this.p2.equals(endPoint1) || this.p3.equals(endPoint1)) &&
            (this.p1.equals(endPoint2) || this.p2.equals(endPoint2) || this.p3.equals(endPoint2)) &&
            !endPoint1.equals(endPoint2));
  }
}

function getTriangleIndex(triangleList: Triangle[], triangle: Triangle): number {
  for (let i: number = 0; i < triangleList.length; i++) {
    if (triangleList[i].equals(triangle)) {
      return i;
    }
  }
  return -1;
}

function triangulation(gl: WebGLRenderingContext, points: number[], step: boolean = false) {
  let pointsList: Point[] = [];
  let triangles: Triangle[] = [];
  
  if (points.length < 2) {
    return triangles;
  }

  let minX: number = points[0];
  let maxX: number = minX;
  let minY: number = points[1];
  let maxY: number = minY;

  for (let i: number = 0; i < points.length; i += 2) {
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

  let width: number = maxX - minX;
  let height: number = maxY - minY;
  let point1: Point = new Point(minX - 2 - Math.floor(width / 2), minY - Math.floor(height / 10) - 1);
  let point2: Point = new Point(maxX + 2 + Math.floor(width / 2), minY - Math.floor(height / 10) - 1);
  let point3: Point = new Point(Math.floor((minX + maxX) / 2), maxY + 1 + height + Math.floor(height / 2));
  let superTriangle: Triangle = new Triangle(point1, point2, point3);

  triangles.push(superTriangle);

  let center: Point = superTriangle.getCircumcenter();
  let radius: number = superTriangle.getCircumradius();

  for (let point of pointsList) {
    let bad: Triangle[] = [];
    for (let triangle of triangles) {
      if (triangle.inCircumscribe(point)) {
        bad.push(triangle);
      }
    }

    let polygon: Point[][] = [];

    for (let triangle1 of bad) {
      for (let triangle1Edge of triangle1.getEdges()) {
        
        let isContained: boolean = false;
        for (let triangle2 of bad) {
          if (!triangle1.equals(triangle2) && triangle2.hasEdge(triangle1Edge[0], triangle1Edge[1])) {
            isContained = true;
          }
        }
        if (!isContained) {
          polygon.push(triangle1Edge);
        }
      }
    }

    for (let triangle of bad) {
      const index: number = getTriangleIndex(triangles, triangle);
      if (index > -1) {
        triangles.splice(index, 1);
      } 
      else {
        console.log("Unable to remove triangle from array!")
      }
    }
    for (let edge of polygon) {
      triangles.push(new Triangle(edge[0], edge[1], point));
    }
  }
  
  let lines: number[] = [];

  let i: number = 0;
  while (i < triangles.length) {
    let triangle: Triangle = triangles[i];
    if (triangle.hasCommmonVertex(superTriangle)) {
      const index: number = getTriangleIndex(triangles, triangle);
      if (index > -1) {
        triangles.splice(index, 1);
      } 
      else {
        console.log("Unable to remove triangle from array!");
      }
    }
    else {
      for (let edge of triangle.getEdges()) {
        lines.push(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
      }
      i++;
    }
  }

  display(gl, lines, points)
}

function run(): void {
  const canvas = document.querySelector("canvas");

  const gl = canvas.getContext("webgl");

  if (!gl) {
    // TODO: add something displaying error to user.
  }

  let lines = []
  let points = []

  display(gl, lines, points);

  const triangulateButton = document.getElementById("triangulate");
  const clear = document.getElementById("clear");

  canvas.onmousedown = function(event: MouseEvent) {
    console.log("offsetX:" + event.offsetX);
    console.log("offsetY:" + event.offsetY);

    let x = (-canvas.width / 2 + event.offsetX) / (canvas.width / 2);
    let y = (canvas.height / 2 - event.offsetY) / (canvas.height / 2);

    console.log("X: " + x);
    console.log("Y: " + y);

    points = points.concat([x, y]);  // TODO: check if the point is already in the list. (edge case, but still.)
    display(gl, lines, points);
  }

  triangulateButton.addEventListener("click", function() {
    triangulation(gl, points);
  });

  clear.addEventListener("click", function() {
    lines = [];
    points = [];
    display(gl, lines, points);
  });
}



run()
