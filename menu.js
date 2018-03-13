/* creates a menu based on h1, h2 headers in document, 
	creates anchors and menu element adds in after title element in html 
	can just take out menu.js if no menu needed */
var Menu = {
	setup: function() {
		// Menu.menu = document.createElement("div");
		// Menu.menu.id = "menu";

		Menu.menu = document.getElementById("menu");

		const headers = document.querySelectorAll("h1, h2");
		const contents = document.createElement("p");
		contents.innerHTML = "<em>Contents</em>";
		Menu.menu.appendChild(contents);
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
			// this *should* work because only using strong in md schedule
			if (headers[i].nextElementSibling)
				if (headers[i].nextElementSibling.children[0])
					if (headers[i].nextElementSibling.children[0].tagName == "STRONG")
						subtitle = ": " + headers[i].nextElementSibling.textContent;
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

		const homeLinks = document.getElementById("home-links");
		if (homeLinks) {
			const home = document.createElement("p");
			home.innerHTML = "<em>Home</em>";
			const homeLinksClone = homeLinks.cloneNode(true);
			Menu.menu.appendChild(document.createElement('br'));
			Menu.menu.appendChild(home);
			Menu.menu.appendChild(homeLinksClone);
		}
		
		Menu.title;
		const container = document.getElementById("container");
		if (location.hash) {
			Menu.title = document.getElementById(location.hash.replace("#", ""));
			Menu.title.scrollIntoView();
		} else {
			Menu.title = document.getElementById('title') || container.firstElementChild.nextElementSibling;
		}
		
		container.insertBefore(Menu.menu, container.firstElementChild.nextElementSibling);
		Menu.setPosition();
	},
	setPosition: function() {
		//Menu.menu.style.left = Menu.title.getBoundingClientRect().left + Menu.title.getBoundingClientRect().width + 40 +"px";
		//Menu.menu.style.top = 0; // title.getBoundingClientRect().top + "px";
	}
}
window.addEventListener('load', Menu.setup);
window.addEventListener('resize', Menu.setPosition);