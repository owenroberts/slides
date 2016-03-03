//http://www.html5canvastutorials.com/tutorials/html5-canvas-lines/
var lines = [];
var c = document.querySelector('#canvas');
var w = c.width;
var h = c.height;
var ctx = c.getContext('2d');
var numRange  = 2;
var diffRange = 1;

var drawOn = false;

var moves = 0;

var addLine = function(mx, my) {
	
	var newpoint = new Point(event.offsetX, event.offsetY);
	
	if (moves > 0) {
		lines.push({
			start: newpoint,
			num: numRange,
			diff: getRandom(diffRange/2,diffRange)
		});
		lines[lines.length - 2].end = newpoint;
	} else {
		lines.push({
			start: newpoint,
			num: numRange,
			diff: getRandom(diffRange/2,diffRange)
		});
	}
	moves++;
}


c.addEventListener('mousemove', function(event) {
	if (drawOn) addLine(event.offsetX, event.offsetY);
});

c.addEventListener('mousedown', function(event) {
	if (event.which == 1) drawOn = true;
	addLine(event.offsetX, event.offsetY);
});

c.addEventListener('mouseup', function(event) {
	if (event.which == 1) drawOn = false;
	if (moves%2==1)  lines.splice(-1,1);
	moves = 0;
});

var fps = 10;
var interval = 1000/fps;
var timer = Date.now();


function drawLines() {
	requestAnimationFrame(drawLines);
	if (Date.now() > timer + interval) {
		timer = Date.now();
		ctx.canvas.width = ctx.canvas.width;
		for (var h = 0; h < lines.length; h++) {
			var line = lines[h];
			if (line.end) {
				var v = new Vector(line.end, line.start);
				v.divide(line.num);

				ctx.lineWidth = 4;
				ctx.lineCap = 'round';
				ctx.beginPath();

				for (var i = 0; i < line.num; i++) {

					var p = new Point(line.start.x + v.x * i, line.start.y + v.y * i);

					ctx.moveTo( p.x + getRandom(-line.diff, line.diff), p.y + getRandom(-line.diff, line.diff) );

					ctx.lineTo( p.x + v.x + getRandom(-line.diff, line.diff), p.y + v.y + getRandom(-line.diff, line.diff) );
					
				}
	      		ctx.stroke();
			}
			
		}
	}
}
requestAnimationFrame(drawLines);