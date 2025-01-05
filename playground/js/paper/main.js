const p = /** @type {paper.PaperScope} */ window.paper;
var {Path,Point} = p
p.setup('myCanvas');
var path = new Path();
path.strokeColor = 'white';
var start = new Point(100, 100);
path.moveTo(start);
path.lineTo(start.add([ 200, -50 ]));

p.view.onFrame = function(event) {
    path.rotate(0.5)
    path.position=p.view.bounds.center
}