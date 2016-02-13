function lerpHSB(from, to, amt) {
	var h = hue(from)         * (1 - amt) + hue(to)         * amt;
	var s = saturation(from)  * (1 - amt) + saturation(to)  * amt;
	var b = brightness(from)  * (1 - amt) + brightness(to)  * amt;
	return color(h, s, b);
}

var w, columns, rows, board;
var alive, born, died, none;

var limits;

var lerper = 0;
var lerpinc = 0.04;

function setup() {
	createCanvas(windowWidth, windowHeight);
	noStroke();
	frameRate(30);

	limits = {
		lonelylimit:  round(random(0, 2)),
		lonelyaction: round(random(0, 2))
	}

  var cmin = 20, cmax = 60;
  if (windowWidth > windowHeight) w = windowWidth / round(random(cmin, cmax));
  else w = windowHeight / round(random(cmin, cmax));
  columns = ceil(windowWidth/w);
  rows = ceil(windowHeight/w);
  board = Array(columns);

  colorMode(HSB, 100);
  var seed = random(40, 80);
  var div = 100/12;
  var change = random(div/2, div);
  var sat = random(30, 50);
  var br = random(60,80);
  alive = color(seed, sat, br);
  born = color(seed + change, sat, br);
  died = color(seed - change, sat, br);
  nothing = color(seed + change/2, sat, br);

  for (var i = 0; i < columns; i++){
    board[i] = Array(rows);
  }
  
  init();
  display();
}

function draw() {
  if (lerper < 1) {
    lerper += lerpinc;
    display();
  }
}

function display() {          
  for (var x = 0; x < columns; x++) {
    for (var y = 0; y < rows; y++) {
      var cell = board[x][y];
      if ((cell.state) && (cell.prev)) {
        cell.setColor(alive);
        var newcolor = lerpHSB(cell.prevc, alive, lerper);
        fill(newcolor);
        rect(x*w, y*w, w, w);
      } 
      else if ((board[x][y].state)) {
        cell.setColor(born);
        var newcolor = lerpHSB(cell.prevc, born, lerper);
        fill(newcolor);
        rect(x*w, y*w, w, w);
      } else if ((board[x][y].prev) && !(board[x][y].state)) {
        cell.setColor(died);
        var newcolor = lerpHSB(cell.prevc, died, lerper);
        fill(newcolor);
        rect(x*w, y*w, w, w);
      }  else {
        cell.setColor(nothing);
        var newcolor = lerpHSB(cell.prevc, nothing, lerper);
        fill(newcolor);
        rect(x*w, y*w, w, w);
      }         
    }
  }
}

function Cell(state) { 
  this.state = state;
  this.prev = state;
  this.c = nothing;
  this.prevc = nothing;
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

function keyPressed() {
  if (keyCode == LEFT_ARROW || keyCode == UP_ARROW 
      || keyCode == DOWN_ARROW || keyCode == RIGHT_ARROW) {
      generate();

  }
}