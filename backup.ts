function showLine(point1: paper.Point, point2: paper.Point): void {
    new paper.Path.Line({
        from: point1, 
        to: point2,
        strokeColor: '#f38ba8'
    });
}