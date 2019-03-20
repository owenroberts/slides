/* creates a menu based on h1, h2 headers in document, 
	creates anchors and menu element adds in after title element in html 
	can just take out menu.js if no menu needed */
var Menu = {
	setup: function() {
		Menu.menu = document.getElementById("page-menu");

		const headers = document.querySelectorAll("h1, h2");
		
		for (let i = 0; i < headers.length; i++) {
			const slideNumber = headers[i].parentNode.dataset.number;
			const title = headers[i].innerText.toLowerCase().replace(/ /g, '-');
 			headers[i].setAttribute("id", title);
			const div = document.createElement('div');
			div.classList.add('item');
			const a = document.createElement('a');
			div.appendChild(a);
			a.href = "#" + title;
			let subtitle = "";
			a.innerText = headers[i].innerText + subtitle;
			Menu.menu .appendChild(div);

			a.addEventListener('click', function(ev) {
				if (typeof S !== 'undefined') {
					if (S.isSlides) {
						S.currentSlide = slideNumber;
						S.scrollToSlide();
					}
				}
				menuList.style.display = 'none';
			});

			if (headers[i].tagName == "H1") {
				div.style.fontWeight = "bold";
			} else {
				const anchor = document.createElement('a');
				anchor.innerText = "§";
				anchor.href = location.href.split("#")[0] + "#" + title;
				headers[i].appendChild(anchor);
			}
		}
	}
}
window.addEventListener('load', Menu.setup);

