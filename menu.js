/* creates a menu based on h1, h2 headers in document, 
	creates anchors and menu element adds in after title element in html 
	can just take out menu.js if no menu needed */
var Menu = {
	setup: function() {

		Menu.menu = document.getElementById("menu");

		const headers = document.querySelectorAll("h1, h2");
		const menuList = document.createElement("ul");
		Menu.menu.appendChild(menuList);
		
		for (let i = 0; i < headers.length; i++) {
			const title = headers[i].innerText.toLowerCase().replace(/ /g, '-');
 			headers[i].setAttribute("id", title);
			const link = document.createElement('li');
			const a = document.createElement('a');
			link.appendChild(a);
			a.href = "#" + title;
			let subtitle = "";
			a.innerText = headers[i].innerText + subtitle;
			menuList.appendChild(link);
			if (headers[i].tagName == "H1") {
				link.style.fontWeight = "bold";
			} else {
				const anchor = document.createElement('a');
				anchor.innerText = "§";
				anchor.href = location.href.split("#")[0] + "#" + title;
				headers[i].appendChild(anchor);
			}
		}

	},
	setPosition: function() {
		//Menu.menu.style.left = Menu.title.getBoundingClientRect().left + Menu.title.getBoundingClientRect().width + 40 +"px";
		//Menu.menu.style.top = 0; // title.getBoundingClientRect().top + "px";
	}
}
window.addEventListener('load', Menu.setup);
window.addEventListener('resize', Menu.setPosition);