var dev = true;
var Slides = {
	iSlides: false,
	start: true,
	slides: $('.slide'),
	totalSlides: 0,
	setup: function() {
		var container = $('#container');
		if (!container.hasClass("noslides")) {
			var slidesBtn = $('<button>').attr('id', 'slidesBtn').text('Slides');
			$(slidesBtn).on('click', Slides.setSlides);
			var outlineBtn = $('<button>').attr('id', 'outlineBtn').text('Outline');
			$(container).append(slidesBtn);
			$(container).append(outlineBtn);
		}
		var jslocation = $('script[src*="slides2.js"]').attr('src');
		jslocation = jslocation.replace('slides2.js','');
		var start = true;
		var slideNumber = 0;
		var scrolling = false;
		var noscroll = false;
	
		var h = window.innerHeight;

		Slides.totalSlides = Slides.slides.length;
	
		// var drawings = [];
		// var loadedDrawings = [];
		// $('div[data-src*="json"]').each(function() {
		// 	var parent = this.parentNode;
		// 	var filename = this.dataset.src;
		// 	$.getJSON(filename, function(data) {
		// 		loadDrawing(parent, data);
		// 	});
		// });
	},
	setSlides: function() {
		if (!Slides.iSlides || Slides.start) {
			h = window.innerHeight;
			start = false;
			isslides = true;
			$(container).addClass('slides');
			$(container).removeClass('outline');
			$('#defaultCanvas0').show();
			noscroll = false;
			Slides.slides.each(function() {
				var elemheight = $(this).height();
				var firstchild = $(this).children()[0];
				if (elemheight > h) { $(this).addClass("long"); }
				else {
					$(this).css({height:h});
					if ( !this.className.includes("nomargin") ) 
						$(firstchild).css({marginTop:(h-elemheight)/4});
				}	
			});
			updateDrawingWidth();
			scrollToSlide();
			$('.mag').remove();
		}
	}
}

/* events */

/* launch slides */
$(document).ready( function() {
	if (window.mobilecheck()) {
		document.getElementById("container").className = "outline";
		var checkExist = setInterval(function() {
			if ($('#defaultCanvas0').length) {
				$('#defaultCanvas0').remove();
				clearInterval(checkExist);
			}
		}, 50);
	} else {
		Slides.setup();
	}
});