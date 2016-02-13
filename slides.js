$(document).ready( function() {

	var container = $('#container');

	var slidesBtn = $('<button>').attr('id', 'slidesBtn');
	var outlineBtn = $('<button>').attr('id', 'outlineBtn');

	var slides = $('.slide');
	var isslides = false;
	var slideNumber = 0;
	var numSlides = slides.length;
	var scrolling = false;
	var noscroll = false;

	var h = window.innerHeight;

	slidesBtn.text('Slides');
	outlineBtn.text('Outline');

	$(container).append(slidesBtn);
	$(container).append(outlineBtn);



	var setSlides = function() {
		if (!isslides) {
			isslides = true;
			$(container).addClass('slides');
			$(container).removeClass('outline');
			$('#defaultCanvas0').show();
			noscroll = false;
	
			slides.each(function() {
				var elemheight = $(this).height();
				//console.log(this, elemheight);
				if (elemheight > h) {
					$(this).addClass("long");
					console.log(this);
				}
				else {
					$(this).css({height:h});
					var firstchild = $(this).children()[0];
					$(firstchild).css({marginTop:(h-elemheight)/4});
				}	
			});
		}
	};
	$(slidesBtn).on('click', setSlides);
	
	var setOutline = function() {
		if (isslides) {
			isslides = false;	
			$(container).removeClass('slides');
			$(container).addClass('outline');
			$('#defaultCanvas0').hide();
			noscroll = true;
			slides.each(function() {
				$(this).css({height:"auto"});
				var firstchild = $(this).children()[0];
				$(firstchild).css({marginTop:"auto"});
			});
		}
	};
	$(outlineBtn).on('click', setOutline);
	setOutline();
	setSlides();

	var setSlideNumber = function() {
		var longslide = $(slides[slideNumber]).attr('class');
		if (longslide.indexOf("long") == -1) {
			slideNumber = 0;
			for ( var i = 0; i < slides.length; i++) {
				if ( $(document).scrollTop() > $(slides[i]).offset().top + h/4) {
					slideNumber++;
				}
			}
			return true;
		} else return false;
	};

	var scrollToSlide = function() {
		if (!noscroll) {
			$('body, html').animate({
				scrollTop: $(slides[slideNumber]).offset().top
			}, 500, function() {
				scrolling = false;
			});
		}
	}
	
	setSlideNumber();
	
	var nextSlide = function() {
		if (slideNumber < numSlides - 1) {
			slideNumber++;
			scrollToSlide();
		}
	};

	var previousSlide = function() {
		if (slideNumber > 0) {
			slideNumber--;
			scrollToSlide();
		}
	};

	$(document).on('keydown', function(ev) {
		var key = ev.which;
		switch (key) {
			case 39: 
			case 40:
				nextSlide();
			break;
			
			case 37:
			case 38:
				previousSlide();
			break;
		}
	});

	$(document).on("wheel", function() {
		var slideOkay = setSlideNumber();
		if (!scrolling && slideOkay) setTimeout(scrollToSlide, 2000);
		scrolling = true;
	});

});