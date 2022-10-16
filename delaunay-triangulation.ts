import * as paper from 'paper';

/*
List of Paper.js Documentation:

Points: http://paperjs.org/reference/point/
Circles: http://paperjs.org/reference/path/#path-circle-object
Lines: http://paperjs.org/reference/path/#path-line-object
*/

paper.setup('canvas');


function showPoint(point: paper.Point) {
    new paper.Path.Circle({
        center: point,
        radius: 3,
        fillColor: '#89b4fa'
    });
}

function showPoints(points: paper.Point[]) {
    for (var i = 0; i < points.length; i++) {
        showPoint(points[i])
    }
}

function showLine(point1: paper.Point, point2: paper.Point): void {
    new paper.Path.Line({
        from: point1, 
        to: point2,
        strokeColor: '#f38ba8'
    });
}

// showPoints([[9, -25], [-8, -15], [-49, -13], [39, 34], [10, -26], [26, 47], [29, -25], [-3, -36], [-44, 14], [-1, -45], [33, 7], [1, 17], [-22, 39], [28, 25], [-49, -7], [-22, 20], [43, -7], [-8, -39], [48, -13], [-8, 37], [-19, -7], [34, 43], [45, 24], [42, 32], [-40, -18], [6, -6], [10, -22], [-13, -10], [47, 40], [-46, -48]])
showPoints([
    new paper.Point(200, 200),
    new paper.Point(400, 200),
    new paper.Point(300, 450)
]);

showLine(new paper.Point(200, 200), new paper.Point(400, 200));

paper.install(window);

declare global {
    var Tool;
}

window.onload = function() {
    globalThis.Tool.onMouseDown = function(event) {
        console.log("trying")
        new paper.Path.Circle({
            center: event.point,
            radius: 3,
            fillColor: '#89b4fa'
        });
    }
}


