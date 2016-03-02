Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

var keys = {
	"67":"c",
	"69":"e",
	"73":"i",
	"79":"o",
	"82":"r",
	"83":"s",
	"86":"v",
	"87":"w",
	"88":"x",
	"90":"z",
	"32":"space"
}

// vector stuff
function getDistance(a, b) {
	var xs = 0;
	var ys = 0;
	xs = b.x - a.x;
	xs = xs * xs;
	ys = b.y - a.y;
	ys = ys * ys;
	return Math.sqrt(xs + ys);
}

function Vector(x, y) {
	this.x = x;
	this.y = y;
	this.subtract = function(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
	};
	this.multiply = function(n) {
		this.x *= n;
		this.y *= n;
	};
	this.divide = function(n) {
		this.x /= n;
		this.y /= n;
	};
	this.magnitude = function() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	};
	
	this.normalize = function() {
		var m = this.magnitude();
		if (m != 0 && m != 1) this.divide(m);
	};
}