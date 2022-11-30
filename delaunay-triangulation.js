var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import vertShaderFile from "./delaunay-triangulation.vert";
import fragShaderFile from "./delaunay-triangulation.frag";
function createVertexShader(gl, file) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, file);
    gl.compileShader(vertexShader);
    let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (success) {
        return vertexShader;
    }
    console.log(gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
}
function createFragmentShader(gl, file) {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, file);
    gl.compileShader(fragmentShader);
    let success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (success) {
        return fragmentShader;
    }
    console.log(gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(fragmentShader);
}
function createProgram(gl, vertexShader, fragmentShader) {
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
function pointsToFan(points, desiredEdgePoints, radius) {
    let fans = [];
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
    constructor(type, offset, count, red, green, blue, alpha) {
        this.type = type;
        this.offset = offset;
        this.count = count;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}
function display(gl, lines, points, highlightedTriangle = null, highlightedLine = [], highlightedPoint = null, badTriangles = [], polygon = [], circle_center = null, circle_radius = 0, goodCircle = true) {
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
    let buffer = [];
    let bufferInfo = [];
    let nextOffset = 0;
    // Add Bad Triangles to Buffer
    let btBuffer = [];
    for (let triangle of badTriangles) {
        let edges = triangle.getEdges();
        btBuffer.push(edges[0][0].x, edges[0][0].y, edges[0][1].x, edges[0][1].y, edges[1][0].x, edges[1][0].y, edges[1][1].x, edges[1][1].y, edges[2][0].x, edges[2][0].y, edges[2][1].x, edges[2][1].y);
    }
    buffer = buffer.concat(btBuffer);
    bufferInfo.push(new BufferInfo(gl.TRIANGLES, nextOffset, btBuffer.length / 2, 0.796, 0.651, 0.969, 0.33));
    nextOffset += btBuffer.length / 2;
    // Circle Buffer
    let circle_lines = [];
    let circle_fill = [];
    if (circle_center != null) {
        let circle_rast = 64;
        if (circle_radius > 64) {
            circle_rast = circle_radius * Math.PI / 8;
        }
        let stepSize = ((2 * Math.PI) / circle_rast);
        for (let d = 0.0; d <= (2 * Math.PI); d += stepSize) {
            let e1 = Math.sin(d) * circle_radius + circle_center.x;
            let e2 = Math.cos(d) * circle_radius + circle_center.y;
            let e3 = Math.sin(d + stepSize) * circle_radius + circle_center.x;
            let e4 = Math.cos(d + stepSize) * circle_radius + circle_center.y;
            circle_lines.push(e1, e2, e3, e4);
            circle_fill.push(circle_center.x, circle_center.y, e1, e2, e3, e4);
        }
        buffer = buffer.concat(circle_lines);
        buffer = buffer.concat(circle_fill);
        if (goodCircle) {
            bufferInfo.push(new BufferInfo(gl.LINES, nextOffset, circle_lines.length / 2, 0.651, 0.890, 0.631, 0.33));
            bufferInfo.push(new BufferInfo(gl.TRIANGLES, nextOffset + circle_lines.length / 2, circle_fill.length / 2, 0.651, 0.890, 0.631, 0.33));
        }
        else {
            bufferInfo.push(new BufferInfo(gl.LINES, nextOffset, circle_lines.length / 2, 0.980, 0.702, 0.529, 0.33));
            bufferInfo.push(new BufferInfo(gl.TRIANGLES, nextOffset + circle_lines.length / 2, circle_fill.length / 2, 0.980, 0.702, 0.529, 0.33));
        }
        nextOffset += (circle_lines.length / 2) + (circle_fill.length / 2);
    }
    // Lines Buffer
    buffer = buffer.concat(lines);
    bufferInfo.push(new BufferInfo(gl.LINES, nextOffset, lines.length / 2, 0.537, 0.706, 0.980, 1));
    nextOffset += lines.length / 2;
    // Polygon Buffer
    let pgBuffer = [];
    for (let edge of polygon) {
        pgBuffer.push(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
    }
    buffer = buffer.concat(pgBuffer);
    bufferInfo.push(new BufferInfo(gl.LINES, nextOffset, pgBuffer.length / 2, 0.922, 0.627, 0.675, 1));
    nextOffset += pgBuffer.length / 2;
    // Highlight Triangle Buffer
    if (highlightedTriangle != null) {
        let edges = highlightedTriangle.getEdges();
        let htBuffer = [edges[0][0].x, edges[0][0].y,
            edges[0][1].x, edges[0][1].y,
            edges[1][0].x, edges[1][0].y,
            edges[1][1].x, edges[1][1].y,
            edges[2][0].x, edges[2][0].y,
            edges[2][1].x, edges[2][1].y];
        buffer = buffer.concat(htBuffer);
        bufferInfo.push(new BufferInfo(gl.TRIANGLES, nextOffset, htBuffer.length / 2, 0.976, 0.886, 0.686, 1));
        nextOffset += htBuffer.length / 2;
    }
    // Highlight Line Buffer
    if (highlightedLine != null) {
        let hlBuffer = [];
        hlBuffer.push(highlightedLine[0].x, highlightedLine[0].y, highlightedLine[1].x, highlightedLine[1].y);
        buffer = buffer.concat(hlBuffer);
        bufferInfo.push(new BufferInfo(gl.LINES, nextOffset, hlBuffer.length / 2, 1, 0, 0, 1)); // TODO: Find a better color
        nextOffset += hlBuffer.length / 2;
    }
    // Points Buffer
    let pointsBuffer = pointsToFan(points, 12, 0.02);
    buffer = buffer.concat(pointsBuffer);
    bufferInfo.push(new BufferInfo(gl.TRIANGLES, nextOffset, pointsBuffer.length / 2, 0.953, 0.545, 0.659, 1));
    nextOffset += pointsBuffer.length / 2;
    // Highlight Point Buffer
    if (highlightedPoint != null) {
        let hpBuffer = pointsToFan([highlightedPoint.x, highlightedPoint.y], 12, 0.02);
        buffer = buffer.concat(hpBuffer);
        bufferInfo.push(new BufferInfo(gl.TRIANGLES, nextOffset, hpBuffer.length / 2, 0.706, 0.745, 0.996, 1));
        nextOffset += hpBuffer.length / 2;
    }
    // Buffer Stuff
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0.094, 0.094, 0.145, 1); // Catppuccin Mocha Mantle
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    // More Buffer Stuff
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let size = 2; // 2 elements per point
    let type = gl.FLOAT; // The elements are floats
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    // I forgot why this exists honestly
    gl.uniform1i(pointUniformLocation, 1);
    // Draw everything
    for (let info of bufferInfo) {
        gl.uniform4f(colorUniformLocation, info.red, info.green, info.blue, info.alpha);
        gl.drawArrays(info.type, info.offset, info.count);
    }
    ////////// OLD STUFF /////////////
    // Draw the circle if it exists
    // if (circle_center != null) {
    //   if (goodCircle) {
    //     gl.uniform4f(colorUniformLocation, 0.651, 0.890, 0.631, 0.33);
    //   }
    //   else {
    //     gl.uniform4f(colorUniformLocation, 0.980, 0.702, 0.529, 0.33);
    //   }
    //   gl.uniform1i(pointUniformLocation, 1);
    //   let primativeType = gl.TRIANGLES;
    //   offset = (lines.length / 2) + (points.length / 2) + (circle_lines.length / 2);
    //   let count = circle_fill.length / 2;
    //   console.log(count);
    //   gl.drawArrays(primativeType, offset, count);
    //   if (goodCircle) {
    //     gl.uniform4f(colorUniformLocation, 0.651, 0.890, 0.631, 1);
    //   }
    //   else {
    //     gl.uniform4f(colorUniformLocation, 0.980, 0.702, 0.529, 1);
    //   }
    //   gl.uniform1i(pointUniformLocation, 1);
    //   primativeType = gl.LINES;
    //   offset = (lines.length / 2) + (points.length / 2);
    //   count = circle_lines.length / 2;
    //   console.log(count);
    //   gl.drawArrays(primativeType, offset, count);
    // }
    // // Draw lines
    // gl.uniform4f(colorUniformLocation, 0.537, 0.706, 0.980, 1);
    // gl.uniform1i(pointUniformLocation, 1);
    // let primativeType = gl.LINES;
    // offset = 0;
    // let count = lines.length / 2;
    // console.log(count);
    // gl.drawArrays(primativeType, offset, count);
    // // Draw the points
    // gl.uniform4f(colorUniformLocation, 0.953, 0.545, 0.659, 1);
    // gl.uniform1i(pointUniformLocation, 1);
    // primativeType = gl.TRIANGLES;
    // offset = lines.length / 2;
    // count = points.length / 2;
    // gl.drawArrays(primativeType, offset, count);
}
class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    cmult(c) {
        return new Point(this.x * c, this.y * c, this.z * c);
    }
    add(other) {
        return new Point(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    sub(other) {
        return this.add(other.cmult(-1));
    }
    equals(other) {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    }
    mag() {
        return Math.sqrt((Math.pow(this.x, 2)) + (Math.pow(this.y, 2)) + (Math.pow(this.z, 2)));
    }
    //  public crossMag(other: Point):number {
    //    return Math.abs((this.x * other.y) - (this.y * other.x));
    // }
    cross(other) {
        return new Point((this.y * other.z) - (this.z * other.y), (this.x * other.z) - (this.z * other.x), (this.x * other.y) - (this.y * other.x));
    }
    dot(other) {
        return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
    }
    //Returns point as a pair
    pair() {
        return [this.x, this.y];
    }
}
class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
    equals(other) {
        return ((this.p1.equals(other.p1) && this.p2.equals(other.p2) && this.p3.equals(other.p3)) ||
            (this.p1.equals(other.p1) && this.p2.equals(other.p3) && this.p3.equals(other.p2)) ||
            (this.p1.equals(other.p2) && this.p2.equals(other.p1) && this.p3.equals(other.p3)) ||
            (this.p1.equals(other.p2) && this.p2.equals(other.p3) && this.p3.equals(other.p1)) ||
            (this.p1.equals(other.p3) && this.p2.equals(other.p1) && this.p3.equals(other.p2)) ||
            (this.p1.equals(other.p3) && this.p2.equals(other.p2) && this.p3.equals(other.p1)));
    }
    hasCommmonVertex(other) {
        return (this.p1.equals(other.p1) || this.p2.equals(other.p1) || this.p3.equals(other.p1) ||
            this.p1.equals(other.p2) || this.p2.equals(other.p2) || this.p3.equals(other.p2) ||
            this.p1.equals(other.p3) || this.p2.equals(other.p3) || this.p3.equals(other.p3));
    }
    getEdges() {
        return [[this.p1, this.p2], [this.p2, this.p3], [this.p3, this.p1]];
    }
    getCircumradius() {
        let num = (this.p1.sub(this.p2).mag() *
            this.p2.sub(this.p3).mag() *
            this.p3.sub(this.p1).mag());
        let denom = 2 * this.p1.sub(this.p2).cross(this.p2.sub(this.p3)).mag();
        return num / denom;
    }
    getCircumcenter() {
        let denom = 2 * (Math.pow(this.p1.sub(this.p2).cross(this.p2.sub(this.p3)).mag(), 2));
        let alpha = ((Math.pow(this.p2.sub(this.p3).mag(), 2)) * this.p1.sub(this.p3).dot(this.p1.sub(this.p2))) / denom;
        let beta = ((Math.pow(this.p1.sub(this.p3).mag(), 2)) * this.p2.sub(this.p3).dot(this.p2.sub(this.p1))) / denom;
        let gamma = ((Math.pow(this.p1.sub(this.p2).mag(), 2)) * this.p3.sub(this.p1).dot(this.p3.sub(this.p2))) / denom;
        return this.p1.cmult(alpha).add(this.p2.cmult(beta)).add(this.p3.cmult(gamma));
    }
    inCircumscribe(point) {
        return this.getCircumcenter().sub(point).mag() < this.getCircumradius();
    }
    hasEdge(endPoint1, endPoint2) {
        return ((this.p1.equals(endPoint1) || this.p2.equals(endPoint1) || this.p3.equals(endPoint1)) &&
            (this.p1.equals(endPoint2) || this.p2.equals(endPoint2) || this.p3.equals(endPoint2)) &&
            !endPoint1.equals(endPoint2));
    }
}
function getTriangleIndex(triangleList, triangle) {
    for (let i = 0; i < triangleList.length; i++) {
        if (triangleList[i].equals(triangle)) {
            return i;
        }
    }
    return -1;
}
function getLinesFromTriangles(triangleList) {
    let lines = [];
    for (let triangle of triangleList) {
        for (let edge of triangle.getEdges()) {
            lines.push(edge[0].x, edge[0].y, edge[1].x, edge[1].y);
        }
    }
    return lines;
}
function highlightAndWait(lineNumber, button, timeout = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        let line = document.getElementById(lineNumber);
        line.style.outline = "solid";
        line.style.outlineWidth = "4px";
        line.style.outlineColor = "#96CDFB";
        yield waitForButtonPress(button, timeout);
        line.style.outline = "2px solid transparent";
        line.style.outlineOffset = "2px";
    });
}
function waitForButtonPress(button, timeout = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        let stop;
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
        let badExecution = false;
        yield promise.then((result) => {
            badExecution = result == 1;
        });
        if (badExecution) {
            yield waitForButtonPress(button);
        }
    });
}
function triangulation(gl, points, step = false, play = false, nextButton = new HTMLElement(), speedSlider = new HTMLInputElement()) {
    return __awaiter(this, void 0, void 0, function* () {
        document.addEventListener("cancelStep", function () {
            step = false;
        });
        document.addEventListener("playPause", function () {
            play = !play;
            console.log("PLAYING");
        });
        let pointsList = [];
        let triangles = [];
        if (step) {
            display(gl, [], points);
            let timeout = 0;
            if (play) {
                timeout = 1700 - speedSlider.valueAsNumber;
                console.log("value: " + speedSlider.valueAsNumber);
            }
            yield highlightAndWait("line02", nextButton, timeout);
            if (!step) {
                return [];
            }
        }
        if (points.length < 2) {
            return triangles;
        }
        let minX = points[0];
        let maxX = minX;
        let minY = points[1];
        let maxY = minY;
        for (let i = 0; i < points.length; i += 2) {
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
        let width = maxX - minX;
        let height = maxY - minY;
        //  let point1: Point = new Point(minX - 2 - Math.floor(width / 2), minY - Math.floor(height / 10) - 1, 0);
        //  let point2: Point = new Point(maxX + 2 + Math.floor(width / 2), minY - Math.floor(height / 10) - 1, 0);
        //  let point3: Point = new Point(Math.floor((minX + maxX) / 2), maxY + 1 + height + Math.floor(height / 2), 0);
        let point1 = new Point(minX - (1000000), minY - (1000000), 0);
        let point2 = new Point(maxX + (1000000), minY - (1000000), 0);
        let point3 = new Point(Math.floor((minX + maxX) / 2), maxY + (1000000), 0);
        let superTriangle = new Triangle(point1, point2, point3);
        triangles.push(superTriangle);
        if (step) {
            display(gl, getLinesFromTriangles(triangles), points);
            let timeout = 0;
            if (play) {
                timeout = 1700 - speedSlider.valueAsNumber;
            }
            yield highlightAndWait("line03", nextButton, timeout);
            if (!step) {
                return [];
            }
        }
        let displayPoints = [];
        for (let point of pointsList) {
            displayPoints.push(point.x, point.y);
            if (step) {
                display(gl, getLinesFromTriangles(triangles), displayPoints);
                let timeout = 0;
                if (play) {
                    timeout = 1700 - speedSlider.valueAsNumber;
                }
                yield highlightAndWait("line04", nextButton, timeout);
                if (!step) {
                    return [];
                }
            }
            let bad = [];
            if (step) {
                display(gl, getLinesFromTriangles(triangles), displayPoints);
                let timeout = 0;
                if (play) {
                    timeout = 1700 - speedSlider.valueAsNumber;
                }
                yield highlightAndWait("line05", nextButton, timeout);
                if (!step) {
                    return [];
                }
            }
            for (let triangle of triangles) {
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line06", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
                let inCircumscribe = triangle.inCircumscribe(point);
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints, null, [], null, bad, [], triangle.getCircumcenter(), triangle.getCircumradius(), !inCircumscribe);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line07", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
                if (inCircumscribe) {
                    bad.push(triangle);
                    if (step) {
                        display(gl, getLinesFromTriangles(triangles), displayPoints);
                        let timeout = 0;
                        if (play) {
                            timeout = 1700 - speedSlider.valueAsNumber;
                        }
                        yield highlightAndWait("line08", nextButton, timeout);
                        if (!step) {
                            return [];
                        }
                    }
                }
            }
            let polygon = [];
            if (step) {
                display(gl, getLinesFromTriangles(triangles), displayPoints);
                let timeout = 0;
                if (play) {
                    timeout = 1700 - speedSlider.valueAsNumber;
                }
                yield highlightAndWait("line09", nextButton, timeout);
                if (!step) {
                    return [];
                }
            }
            for (let triangle1 of bad) {
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line10", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
                for (let triangle1Edge of triangle1.getEdges()) {
                    if (step) {
                        display(gl, getLinesFromTriangles(triangles), displayPoints);
                        let timeout = 0;
                        if (play) {
                            timeout = 1700 - speedSlider.valueAsNumber;
                        }
                        yield highlightAndWait("line11", nextButton, timeout);
                        if (!step) {
                            return [];
                        }
                    }
                    let isContained = false;
                    for (let triangle2 of bad) {
                        if (!triangle1.equals(triangle2) && triangle2.hasEdge(triangle1Edge[0], triangle1Edge[1])) {
                            isContained = true;
                        }
                    }
                    if (step) {
                        display(gl, getLinesFromTriangles(triangles), displayPoints);
                        let timeout = 0;
                        if (play) {
                            timeout = 1700 - speedSlider.valueAsNumber;
                        }
                        yield highlightAndWait("line12", nextButton, timeout);
                        if (!step) {
                            return [];
                        }
                    }
                    if (!isContained) {
                        polygon.push(triangle1Edge);
                        if (step) {
                            display(gl, getLinesFromTriangles(triangles), displayPoints);
                            let timeout = 0;
                            if (play) {
                                timeout = 1700 - speedSlider.valueAsNumber;
                            }
                            yield highlightAndWait("line13", nextButton, timeout);
                            if (!step) {
                                return [];
                            }
                        }
                    }
                }
            }
            for (let triangle of bad) {
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line14", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
                const index = getTriangleIndex(triangles, triangle);
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
                    yield highlightAndWait("line15", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
            }
            for (let edge of polygon) {
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line16", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line17", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
                triangles.push(new Triangle(edge[0], edge[1], point));
                if (step) {
                    display(gl, getLinesFromTriangles(triangles), displayPoints);
                    let timeout = 0;
                    if (play) {
                        timeout = 1700 - speedSlider.valueAsNumber;
                    }
                    yield highlightAndWait("line18", nextButton, timeout);
                    if (!step) {
                        return [];
                    }
                }
            }
        }
        let lines = [];
        let i = 0;
        while (i < triangles.length) {
            let triangle = triangles[i];
            if (step) {
                display(gl, getLinesFromTriangles(triangles), displayPoints);
                let timeout = 0;
                if (play) {
                    timeout = 1700 - speedSlider.valueAsNumber;
                }
                yield highlightAndWait("line19", nextButton, timeout);
                if (!step) {
                    return [];
                }
            }
            if (step) {
                display(gl, getLinesFromTriangles(triangles), displayPoints);
                let timeout = 0;
                if (play) {
                    timeout = 1700 - speedSlider.valueAsNumber;
                }
                yield highlightAndWait("line20", nextButton, timeout);
                if (!step) {
                    return [];
                }
            }
            if (triangle.hasCommmonVertex(superTriangle)) {
                const index = getTriangleIndex(triangles, triangle);
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
                    yield highlightAndWait("line21", nextButton, timeout);
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
            yield highlightAndWait("line22", nextButton, timeout);
            if (!step) {
                return [];
            }
        }
        display(gl, lines, points);
    });
}
function showAndHideButton(show, hide) {
    show.style.display = 'block';
    hide.style.display = 'none';
}
function run() {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) {
        // TODO: add something displaying error to user.
    }
    let lines = [];
    let points = [];
    display(gl, lines, points);
    const triangulateButton = document.getElementById("triangulate");
    const stepButton = document.getElementById("step");
    const nextButton = document.getElementById("next");
    const clear = document.getElementById("clear");
    const playButton = document.getElementById("play");
    const pauseButton = document.getElementById("pause");
    const speedSlider = document.getElementById("speedSlider");
    let stepping = false;
    let cancelStep = new Event("cancelStep");
    let playPause = new Event("playPause");
    canvas.onmousedown = function (event) {
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
        points = points.concat([x, y]); // TODO: check if the point is already in the list. (edge case, but still.)
        display(gl, lines, points);
    };
    triangulateButton.addEventListener("click", function () {
        stepping = false;
        document.dispatchEvent(cancelStep);
        triangulation(gl, points, false, false, nextButton, speedSlider);
        showAndHideButton(stepButton, nextButton);
        showAndHideButton(playButton, pauseButton);
    });
    stepButton.addEventListener("click", function () {
        return __awaiter(this, void 0, void 0, function* () {
            stepping = true;
            showAndHideButton(nextButton, stepButton);
            yield triangulation(gl, points, true, false, nextButton, speedSlider);
            showAndHideButton(stepButton, nextButton);
            showAndHideButton(playButton, pauseButton);
            stepping = false;
        });
    });
    clear.addEventListener("click", function () {
        stepping = false;
        document.dispatchEvent(cancelStep);
        lines = [];
        points = [];
        display(gl, lines, points);
        showAndHideButton(stepButton, nextButton);
        showAndHideButton(playButton, pauseButton);
    });
    playButton.addEventListener("click", function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (stepping) {
                document.dispatchEvent(playPause);
                showAndHideButton(pauseButton, playButton);
            }
            else {
                stepping = true;
                showAndHideButton(nextButton, stepButton);
                showAndHideButton(pauseButton, playButton);
                yield triangulation(gl, points, true, true, nextButton, speedSlider);
                showAndHideButton(stepButton, nextButton);
                showAndHideButton(playButton, pauseButton);
                stepping = false;
            }
        });
    });
    pauseButton.addEventListener("click", function () {
        showAndHideButton(playButton, pauseButton);
        document.dispatchEvent(playPause);
    });
}
run();
