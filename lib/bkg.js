var BKG = function( p ) {
	function lerpHSB(from, to, amt) {
		var h = p.hue(from)         * (1 - amt) + p.hue(to)         * amt;
		var s = p.saturation(from)  * (1 - amt) + p.saturation(to)  * amt;
		var b = p.brightness(from)  * (1 - amt) + p.brightness(to)  * amt;
		return p.color(h, s, b);
	}

	var w, columns, rows, board;
	p.alive; 
	p.born; 
	p.died; 
	p.nothing;
	var canvas;

	var limits;

	var lerper = 0;
	var lerpinc = 0.04;

	p.looping = true;

	p.setup = function() {
		canvas = p.createCanvas(p.windowWidth, p.windowHeight);
		p.noStroke();
		p.frameRate(30);

		limits = {
			lonelylimit:  p.round(p.random(0, 2)),
			lonelyaction: p.round(p.random(0, 2))
		}

		p.colorMode(p.HSB, 100);
		var seed = p.random(40, 80);
		var div = 100/12;
		var change = p.random(div/2, div);
		var sat = p.random(30, 50);
		var br = p.random(60,80);
		p.alive = p.color(seed, sat, br);
		p.born = p.color(seed + change, sat, br);
		p.died = p.color(seed - change, sat, br);
		p.nothing = p.color(seed + change/2, sat, br);


		var oppSeed = (seed + 25) % 100;
		var plusBr = p.random(10,20);
		var plusSat = p.random(10, 40);
		p.aliveOpp = p.color(oppSeed, sat + plusSat, br + plusBr);
		p.bornOpp = p.color(oppSeed + change, sat + plusSat, br + plusBr);
		p.diedOpp = p.color(oppSeed - change, sat + plusSat, br + plusBr);
		p.nothingOpp = p.color(oppSeed + change/2, sat + plusSat, br + plusBr);

		setupSize();
		init();
		display();
	}

	function setupSize() {
		var cmin = 20, cmax = 60;
		if (p.windowWidth > p.windowHeight) w = p.windowWidth / p.round(p.random(cmin, cmax));
		else w = p.windowHeight / p.round(p.random(cmin, cmax));
		columns = p.ceil(p.windowWidth/w);
		rows = p.ceil(p.windowHeight/w);
		board = Array(columns);
		for (var i = 0; i < columns; i++){
			board[i] = Array(rows);
		}
	}

	p.draw = function() {
		if (lerper < 1) {
			lerper += lerpinc;
			display();
		}
	}

	p.toggle = function() {
		if (p.looping) {
			p.noLoop();
			p.canvas.style.display = "none";
		} else {
			p.loop();
			p.canvas.style.display = "block";
		}
		p.looping = !p.looping;
	}

	function display() {          
		for (var x = 0; x < columns; x++) {
			for (var y = 0; y < rows; y++) {
				var cell = board[x][y];
				if ((cell.state) && (cell.prev)) {
					cell.setColor(p.alive);
					var newcolor = lerpHSB(cell.prevc, p.alive, lerper);
					p.fill(newcolor);
					p.rect(x*w, y*w, w, w);
				} 
				else if ((board[x][y].state)) {
					cell.setColor(p.born);
					var newcolor = lerpHSB(cell.prevc, p.born, lerper);
					p.fill(newcolor);
					p.rect(x*w, y*w, w, w);
				} else if ((board[x][y].prev) && !(board[x][y].state)) {
					cell.setColor(p.died);
					var newcolor = lerpHSB(cell.prevc, p.died, lerper);
					p.fill(newcolor);
					p.rect(x*w, y*w, w, w);
				}  else {
					cell.setColor(p.nothing);
					var newcolor = lerpHSB(cell.prevc, p.nothing, lerper);
					p.fill(newcolor);
					p.rect(x*w, y*w, w, w);
				}         
			}
		}
	}

	function Cell(state) { 
		this.state = state;
		this.prev = state;
		this.c = p.nothing;
		this.prevc = p.nothing;
		this.savePrevious = function() { this.prev = this.state; this.prevc = this.c };
		this.setColor = function(_c) { this.c = _c; };
		this.newState = function(num) { this.state = num; };      
	}

	function init() {
		for (var x = 0; x < columns; x++) {
			for (var y = 0; y < rows; y++) {
			  board[x][y] = new Cell(Math.round(Math.random()));
			}
		}
	}

	function generate() {
		lerper = 0;
		for (var i = 0; i < columns; i++){
			for (var j = 0; j < rows; j++){
				board[i][j].savePrevious();
			}
		}
		
		for (var x = 1; x < columns - 1; x++) {
			for (var y = 1; y < rows - 1; y++) {
				var n = 0;
				for (var i = -1; i <= 1; i++) {
					for (var j = -1; j <= 1; j++) {
					  n += board[x+i][y+j].prev;
					}
				}
				n -= board[x][y].prev; 
				//lonely 
				if ((board[x][y].state == 1) && (n < limits.lonelylimit)) {
					board[x][y].newState(limits.lonelyaction);
				} 
				//overpopulated
				else if ((board[x][y].state == 1) && (n > 3)) {
					board[x][y].newState(0);
				} 
				//just right
				else if ((board[x][y].state == 0) && (n == 3)) {
					board[x][y].newState(1);
				} 
			}
		}
	}

	p.keyPressed = function() {
		if (p.keyCode == p.LEFT_ARROW || p.keyCode == p.UP_ARROW 
			|| p.keyCode == p.DOWN_ARROW || p.keyCode == p.RIGHT_ARROW) {
			generate();

		}
	}
	p.windowResized = function() {
		canvas.elt.style.width = p.windowWidth + "px";
		canvas.elt.style.height = p.windowHeight + "px";
		setupSize();
		init();
		display();
	}
}