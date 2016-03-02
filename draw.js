//http://www.html5canvastutorials.com/tutorials/html5-canvas-lines/
var lines = [];
var c = document.querySelector('#canvas');
var w = c.width;
var h = c.height;
var ctx = c.getContext('2d');
var numRange  = 2;
var diffRange = 0;

var drawOn = false;

var moves = 0;

var addLine = function(mx, my) {
	var newpoint = new Vector(event.offsetX, event.offsetY);
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
				var xdiff = line.start.x - line.end.x;
				var ydiff = line.start.y - line.end.y;
				ctx.lineWidth = 1;
				ctx.lineCap = 'round';
				ctx.beginPath();
				console.log(line.num);
				for (var i = 0; i < line.num; i++) {

					ctx.lineTo(
						line.start.x + ( xdiff / line.num * i ), //+ Math.random() * line.diff,  
						line.start.y + ( ydiff / line.num * i )  //+ Math.random() * line.diff
					);

					ctx.lineTo(
						line.start.x + ( xdiff / line.num * i ), //+ Math.random() * line.diff,  
						line.start.y + ( ydiff / line.num * i )  //+ Math.random() * line.diff
					);
					
				}
	      		ctx.stroke();
			}
			
		}
	}
}
requestAnimationFrame(drawLines);