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

class BufferInfo {
  public type: number;
  public offset: number;
  public count: number;

  public red: number;
  public green: number;
  public blue: number;
  public alpha: number;

  constructor(type: number, offset: number, count: number,
              red: number, green: number, blue: number, alpha: number) {
    this.type = type;
    this.offset = offset;
    this.count = count;

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
}

function display(gl: WebGLRenderingContext,
                 lines: number[],
                 points: number[],

                 highlightedTriangle: Triangle = null,
                 highlightedLine: Point[] = [],
                 highlightedPoint: Point = null,

                 badTriangles: Triangle[] = [],
                 polygon: Point[][] = [],

                 circle_center: Point = null,
                 circle_radius: number = 0,
                 goodCircle: boolean = true
                ):void {
  // Setup shaders and basic program
  let vertexShader = createVertexShader(gl, vertShaderFile);
  let fragmentShader = createFragmentShader(gl, fragShaderFile);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
  let colorUniformLocation = gl.getUniformLocation(program, "vColor");
  let pointUniformLocation = gl.getUniformLocation(program, "point");

  // Create buffer
  let positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let buffer = []
  let bufferInfo: BufferInfo[] = [];
  let nextOffset: number = 0;

  // Add Bad Triangles to Buffer
  if (badTriangles.length != 0) {
    let btBuffer: number[] = [];
    for (let triangle of badTriangles) {
      btBuffer.push(triangle.p1.x, triangle.p1.y,
                    triangle.p2.x, triangle.p2.y,
                    triangle.p3.x, triangle.p3.y);
    }
    buffer = buffer.concat(btBuffer);
    bufferInfo.push(new BufferInfo(gl.TRIANGLES,
                                  nextOffset,
                                  btBuffer.length / 2,
                                  //0.796, 0.651, 0.969, 0.15));
                                  0.980, 0.702, 0.529, 0.1));
    nextOffset += btBuffer.length / 2;
  }

  // Circle Buffer
  let circle_lines: number[] = [];

  let circle_fill: number[] = [];

  if (circle_center != null) {
    let circle_rast: number = 64;
    if (circle_radius > 1024) {
      circle_rast = circle_radius * Math.PI / 64;
    }

    let stepSize = ((2 * Math.PI) / circle_rast);
    for (let d = 0.0; d <= (2 * Math.PI); d += stepSize) {
      let e1: number = Math.sin(d) * circle_radius + circle_center.x;
      let e2: number = Math.cos(d) * circle_radius + circle_center.y;
      let e3: number = Math.sin(d + stepSize) * circle_radius + circle_center.x;
      let e4: number = Math.cos(d + stepSize) * circle_radius + circle_center.y;
      circle_lines.push(e1, e2, e3, e4);

      circle_fill.push(circle_center.x, circle_center.y, e1, e2, e3, e4);
    }

    buffer = buffer.concat(circle_fill);
    buffer = buffer.concat(circle_lines);
    if (goodCircle) {
      bufferInfo.push(new BufferInfo(gl.TRIANGLES,
                                     nextOffset,
                                     circle_fill.length / 2,
                                     0.651, 0.890, 0.631, 0.33));
      bufferInfo.push(new BufferInfo(gl.LINES,
                                     nextOffset + circle_fill.length / 2,
                                     circle_lines.length / 2,
                                     0.651, 0.890, 0.631, 1));
    }
    else {
      bufferInfo.push(new BufferInfo(gl.TRIANGLES,
                                     nextOffset,
                                     circle_fill.length / 2,
                                     0.980, 0.702, 0.529, 0.33));
      bufferInfo.push(new BufferInfo(gl.LINES,
                                     nextOffset + circle_fill.length / 2,
                                     circle_lines.length / 2,
                                     0.980, 0.702, 0.529, 1));
    }
    nextOffset += (circle_lines.length / 2) + (circle_fill.length / 2);
  }

  // Lines Buffer
  buffer = buffer.concat(lines);
  bufferInfo.push(new BufferInfo(gl.LINES,
                                 nextOffset,
                                 lines.length / 2,
                                 0.537, 0.706, 0.980, 1));
  nextOffset += lines.length / 2;
  
  // Highlight Triangle Buffer
  if (highlightedTriangle != null) {
    console.log("TRIANGLE");
    let htBuffer = getLinesFromTriangles([highlightedTriangle]);
    buffer = buffer.concat(htBuffer);
    bufferInfo.push(new BufferInfo(gl.LINES,
                                  nextOffset,
                                  htBuffer.length / 2,
                                  0.976, 0.886, 0.686, 1));
    nextOffset += htBuffer.length / 2;
  }

  // Polygon Buffer
  if (polygon.length != 0) {
    let pgBuffer: number[] = [];
    for (let edge of polygon) {
      pgBuffer.push(edge[0].x, edge[0].y,
                    edge[1].x, edge[1].y);
    }
    buffer = buffer.concat(pgBuffer);
    bufferInfo.push(new BufferInfo(gl.LINES,
                                  nextOffset,
                                  pgBuffer.length / 2,
                                  0.651, 0.890, 0.631, 1));
                                  //0.922, 0.627, 0.675, 1));
    nextOffset += pgBuffer.length / 2;
  }
  
  // Highlight Line Buffer
  if (highlightedLine.length != 0) {
    let hlBuffer: number[] = [];
    hlBuffer.push(highlightedLine[0].x, highlightedLine[0].y,
                  highlightedLine[1].x, highlightedLine[1].y);
    buffer = buffer.concat(hlBuffer);
    bufferInfo.push(new BufferInfo(gl.LINES,
                                   nextOffset,
                                   hlBuffer.length / 2,
                                   0.953, 0.545, 0.659, 1)); // TODO: Find a better color
    nextOffset += hlBuffer.length / 2;
  }

  // Points Buffer
  let pointsBuffer = pointsToFan(points, 12, 0.02);
  buffer = buffer.concat(pointsBuffer);
  bufferInfo.push(new BufferInfo(gl.TRIANGLES,
                                 nextOffset,
                                 pointsBuffer.length / 2,
                                 0.953, 0.545, 0.659, 1));
  nextOffset += pointsBuffer.length / 2;

  // Highlight Point Buffer
  if (highlightedPoint != null) {
    let hpBuffer: number[] = pointsToFan([highlightedPoint.x, highlightedPoint.y], 12, 0.02);
    buffer = buffer.concat(hpBuffer);
    bufferInfo.push(new BufferInfo(gl.TRIANGLES,
                                   nextOffset,
                                   hpBuffer.length / 2,
                                   0.976, 0.886, 0.686, 1));
    nextOffset += hpBuffer.length / 2;
  }
  
  // Buffer Stuff
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0.094, 0.094, 0.145, 1);  // Catppuccin Mocha Mantle
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  // More Buffer Stuff
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let size: number = 2;  // 2 elements per point
  let type = gl.FLOAT;  // The elements are floats
  let normalize: boolean = false;
  let stride: number = 0;
  let offset: number = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  // I forgot why this exists honestly
  gl.uniform1i(pointUniformLocation, 1);

  // Draw everything
  for (let info of bufferInfo) {
    gl.uniform4f(colorUniformLocation, info.red, info.green, info.blue, info.alpha);
    gl.drawArrays(info.type, info.offset, info.count);
  }
}

class Point {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
	  this.z = z;
  }

  public cmult(c: number): Point {
    return new Point(this.x * c, this.y * c, this.z * c);
  }

  public add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  public sub(other: Point): Point {
    return this.add(other.cmult(-1));
  }

  public equals(other: Point): boolean {
    return this.x == other.x && this.y == other.y && this.z == other.z;
  }

  public mag(): number {
    return Math.sqrt((this.x ** 2) + (this.y ** 2) + (this.z ** 2));
  }

//  public crossMag(other: Point):number {
//    return Math.abs((this.x * other.y) - (this.y * other.x));
// }

  public cross(other: Point):Point {
    return new Point((this.y * other.z) - (this.z * other.y), (this.x * other.z) - (this.z * other.x), (this.x * other.y) - (this.y * other.x));
  }

  public dot(other: Point): number {
    return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
  }
  
  //Returns point as a pair
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
    let denom: number = 2 * this.p1.sub(this.p2).cross(this.p2.sub(this.p3)).mag();
    return num / denom;
  }

  public getCircumcenter(): Point {
    let denom: number = 2 * (this.p1.sub(this.p2).cross(this.p2.sub(this.p3)).mag() ** 2);
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

function getLinesFromTriangles(triangleList: Triangle[]): number[] {
  let lines: number[] = [];
  for (let triangle of triangleList) {
    for (let edge of triangle.getEdges()) {
      lines.push(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
    }
  }
  return lines;
}

async function highlightAndWait(lineNumber: string, button: HTMLElement, timeout: number = 0): Promise<void> {
  let line: HTMLElement = document.getElementById(lineNumber);
  line.style.outline = "solid";
  line.style.outlineWidth = "4px";
  line.style.outlineColor = "#96CDFB";
  await waitForButtonPress(button, timeout);

  line.style.outline = "2px solid transparent";
  line.style.outlineOffset = "2px";
}

async function waitForButtonPress(button: HTMLElement, timeout: number = 0): Promise<void> {
  let stop: (value: unknown) => void;

  button.addEventListener("click", function () {
    stop(0);
  });

  document.addEventListener("cancelStep", function () {
    stop(0);
  });
  document.addEventListener("playPause", function () {
    if (timeout == 0) {
      stop(0);
    }
    else {
      stop(1);
    }
  });

  let promise = new Promise((resolve) => {
    if (timeout != 0) {
      setTimeout(resolve, timeout);
    }
    stop = resolve;
  });

  let badExecution: boolean = false;

  await promise.then((result) => {
    badExecution = result == 1;
  });

  if (badExecution) {
    await waitForButtonPress(button);
  }
}

async function triangulation(gl: WebGLRenderingContext,
                             points: number[],
                             step: boolean = false,
                             play: boolean = false,
                             nextButton: HTMLElement = new HTMLElement(),
                             speedSlider: HTMLInputElement = new HTMLInputElement()
                            ): Promise<Triangle[]> {
  document.addEventListener("cancelStep", function () {
    step = false;
  });
  document.addEventListener("playPause", function () {
    play = !play;
    console.log("PLAYING")
  });

  let pointsList: Point[] = [];
  let triangles: Triangle[] = [];

  if (step) {
    display(gl, [], points);
    let timeout = 0;
    if (play) {
      timeout = 1700 - speedSlider.valueAsNumber;
      console.log("value: " + speedSlider.valueAsNumber);
    }
    await highlightAndWait("line02", nextButton, timeout);
    if (!step) {
      return [];
    }
  }
  
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

    pointsList.push(new Point(points[i], points[i + 1], 0));
  }

  let width: number = maxX - minX;
  let height: number = maxY - minY;
//  let point1: Point = new Point(minX - 2 - Math.floor(width / 2), minY - Math.floor(height / 10) - 1, 0);
//  let point2: Point = new Point(maxX + 2 + Math.floor(width / 2), minY - Math.floor(height / 10) - 1, 0);
//  let point3: Point = new Point(Math.floor((minX + maxX) / 2), maxY + 1 + height + Math.floor(height / 2), 0);

  let point1: Point = new Point(minX - (1000000), minY - (1000000), 0);
  let point2: Point = new Point(maxX + (1000000), minY - (1000000), 0);
  let point3: Point = new Point(Math.floor((minX + maxX) / 2), maxY + (1000000), 0);
  let superTriangle: Triangle = new Triangle(point1, point2, point3);

  triangles.push(superTriangle);

  if (step) {
    display(gl, getLinesFromTriangles(triangles), points);
    let timeout = 0;
    if (play) {
      timeout = 1700 - speedSlider.valueAsNumber;
    }
    await highlightAndWait("line03", nextButton, timeout);
    if (!step) {
      return [];
    }
  }

  let displayPoints: number[] = [];

  for (let point of pointsList) {
    displayPoints.push(point.x, point.y);

    if (step) {
      display(gl, getLinesFromTriangles(triangles), displayPoints, null, [], point);
      let timeout = 0;
      if (play) {
        timeout = 1700 - speedSlider.valueAsNumber;
      }
      await highlightAndWait("line04", nextButton, timeout);
      if (!step) {
        return [];
      }
    }
    let bad: Triangle[] = [];
    if (step) {
      display(gl, getLinesFromTriangles(triangles), displayPoints, null, [], point);
      let timeout = 0;
      if (play) {
        timeout = 1700 - speedSlider.valueAsNumber;
      }
      await highlightAndWait("line05", nextButton, timeout);
      if (!step) {
        return [];
      }
    }
    for (let triangle of triangles) {
      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints, triangle, [], point, bad);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line06", nextButton, timeout);
        if (!step) {
          return [];
        }
      }

      let inCircumscribe: boolean = triangle.inCircumscribe(point)

      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints,
                triangle, [], point,
                bad, [],
                triangle.getCircumcenter(), triangle.getCircumradius(), !inCircumscribe);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line07", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
      if (inCircumscribe) {
        
        bad.push(triangle);
        if (step) {
          display(gl, getLinesFromTriangles(triangles), displayPoints, triangle, [], point, bad);
          let timeout = 0;
          if (play) {
            timeout = 1700 - speedSlider.valueAsNumber;
          }
          await highlightAndWait("line08", nextButton, timeout);
          if (!step) {
            return [];
          }
        }
      }
    }

    let polygon: Point[][] = [];
    if (step) {
      display(gl, getLinesFromTriangles(triangles), displayPoints, null, [], point, bad, polygon);
      let timeout = 0;
      if (play) {
        timeout = 1700 - speedSlider.valueAsNumber;
      }
      await highlightAndWait("line09", nextButton, timeout);
      if (!step) {
        return [];
      }
    }

    for (let triangle1 of bad) {
      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints, triangle1, [], point, bad, polygon);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line10", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
      for (let triangle1Edge of triangle1.getEdges()) {
        if (step) {
          display(gl, getLinesFromTriangles(triangles), displayPoints, triangle1, triangle1Edge, point, bad, polygon);
          let timeout = 0;
          if (play) {
            timeout = 1700 - speedSlider.valueAsNumber;
          }
          await highlightAndWait("line11", nextButton, timeout);
          if (!step) {
            return [];
          }
        }
        let isContained: boolean = false;
        for (let triangle2 of bad) {
          if (!triangle1.equals(triangle2) && triangle2.hasEdge(triangle1Edge[0], triangle1Edge[1])) {
            isContained = true;
          }
        }
        if (step) {
          display(gl, getLinesFromTriangles(triangles), displayPoints, triangle1, triangle1Edge, point, bad, polygon);
          let timeout = 0;
          if (play) {
            timeout = 1700 - speedSlider.valueAsNumber;
          }
          await highlightAndWait("line12", nextButton, timeout);
          if (!step) {
            return [];
          }
        }
        if (!isContained) {
          polygon.push(triangle1Edge);
          if (step) {
            display(gl, getLinesFromTriangles(triangles), displayPoints, triangle1, [], point, bad, polygon);
            let timeout = 0;
            if (play) {
              timeout = 1700 - speedSlider.valueAsNumber;
            }
            await highlightAndWait("line13", nextButton, timeout);
            if (!step) {
              return [];
            }
          }
        }
      }
    }
    let badDisplay: Triangle[] = bad.concat();
    for (let triangle of bad) {
      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints, triangle, [], point, badDisplay, polygon);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line14", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
      const index: number = getTriangleIndex(triangles, triangle);
      if (index > -1) {
        triangles.splice(index, 1);
      } 
      else {
        console.log("Unable to remove triangle from array!")
      }
      if (step) {
        const index: number = getTriangleIndex(badDisplay, triangle);

        if (index > -1) {
          badDisplay.splice(index, 1);
        } 
        else {
          console.log("Unable to remove triangle from array!")
        }

        display(gl, getLinesFromTriangles(triangles), displayPoints, null, [], point, badDisplay, polygon);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line15", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
    }

    for (let edge of polygon) {
      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints, null, edge, point, [], polygon);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line16", nextButton, timeout);
        if (!step) {
          return [];
        }
      }

      let newTriangle = new Triangle(edge[0], edge[1], point);

      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints, newTriangle, edge, point, [], polygon);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line17", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
      triangles.push(newTriangle);
      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints, null, [], point, [], polygon);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line18", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
    }
  }
  
  let lines: number[] = [];

  let i: number = 0;
  while (i < triangles.length) {
    let triangle: Triangle = triangles[i];
    if (step) {
      display(gl, getLinesFromTriangles(triangles), displayPoints, triangle);
      let timeout = 0;
      if (play) {
        timeout = 1700 - speedSlider.valueAsNumber;
      }
      await highlightAndWait("line19", nextButton, timeout);
      if (!step) {
        return [];
      }
    }
    if (step) {
      display(gl, getLinesFromTriangles(triangles), displayPoints, triangle);
      let timeout = 0;
      if (play) {
        timeout = 1700 - speedSlider.valueAsNumber;
      }
      await highlightAndWait("line20", nextButton, timeout);
      if (!step) {
        return [];
      }
    }
    if (triangle.hasCommmonVertex(superTriangle)) {
      const index: number = getTriangleIndex(triangles, triangle);
      if (index > -1) {
        triangles.splice(index, 1);
      } 
      else {
        console.log("Unable to remove triangle from array!");
      }
      if (step) {
        display(gl, getLinesFromTriangles(triangles), displayPoints);
        let timeout = 0;
        if (play) {
          timeout = 1700 - speedSlider.valueAsNumber;
        }
        await highlightAndWait("line21", nextButton, timeout);
        if (!step) {
          return [];
        }
      }
    }
    else {
      for (let edge of triangle.getEdges()) {
        lines.push(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
      }
      i++;
    }
  }

  if (step) {
    display(gl, getLinesFromTriangles(triangles), displayPoints);
    let timeout = 0;
    if (play) {
      timeout = 1700 - speedSlider.valueAsNumber;
    }
    await highlightAndWait("line22", nextButton, timeout);
    if (!step) {
      return [];
    }
  }

  display(gl, lines, points)
}

function showAndHideButton(show: HTMLElement, hide: HTMLElement): void {
  show.style.display = 'block';
  hide.style.display = 'none';
}

function run(): void {
  const canvas = document.querySelector("canvas");

  const gl = canvas.getContext("webgl", {premultipliedAlpha: false});

  if (!gl) {
    // TODO: add something displaying error to user.
  }

  let lines = []
  let points = []

  display(gl, lines, points);

  const triangulateButton = document.getElementById("triangulate");
  const stepButton = document.getElementById("step");
  const nextButton = document.getElementById("next");
  const clear = document.getElementById("clear");
  const playButton = document.getElementById("play");
  const pauseButton = document.getElementById("pause");
  const speedSlider = document.getElementById("speedSlider") as HTMLInputElement;

  let stepping: boolean = false;
  let cancelStep = new Event("cancelStep");
  let playPause = new Event("playPause");

  canvas.onmousedown = function(event: MouseEvent) {
    stepping = false;
    document.dispatchEvent(cancelStep);

    console.log("offsetX:" + event.offsetX);
    console.log("offsetY:" + event.offsetY);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    let x = (-canvas.width / 2 + event.offsetX) / (canvas.width / 2);
    let y = (canvas.height / 2 - event.offsetY) / (canvas.height / 2);

    console.log("X: " + x);
    console.log("Y: " + y);

    points = points.concat([x, y]);  // TODO: check if the point is already in the list. (edge case, but still.)
    display(gl, lines, points);
  }

  triangulateButton.addEventListener("click", function() {
    stepping = false;
    document.dispatchEvent(cancelStep);

    triangulation(gl, points, false, false, nextButton, speedSlider);
    showAndHideButton(stepButton, nextButton);
    showAndHideButton(playButton, pauseButton);
  });

  stepButton.addEventListener("click", async function() {
    stepping = true;

    showAndHideButton(nextButton, stepButton);

    await triangulation(gl, points, true, false, nextButton, speedSlider);

    showAndHideButton(stepButton, nextButton);
    showAndHideButton(playButton, pauseButton);
    stepping = false;
  });

  clear.addEventListener("click", function() {
    stepping = false;
    document.dispatchEvent(cancelStep);

    lines = [];
    points = [];
    display(gl, lines, points);
    showAndHideButton(stepButton, nextButton);
    showAndHideButton(playButton, pauseButton);
  });

  playButton.addEventListener("click", async function() {
    if (stepping) {
      document.dispatchEvent(playPause);

      showAndHideButton(pauseButton, playButton);
    }
    else {
      stepping = true;
      showAndHideButton(nextButton, stepButton);
      showAndHideButton(pauseButton, playButton);

      await triangulation(gl, points, true, true, nextButton, speedSlider);

      showAndHideButton(stepButton, nextButton);
      showAndHideButton(playButton, pauseButton);
      stepping = false;
    }
  });

  pauseButton.addEventListener("click", function() {
    showAndHideButton(playButton, pauseButton);
    document.dispatchEvent(playPause);
  });
}



run()
