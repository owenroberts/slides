var Menu = {
	setup: function() {
		const headers = document.querySelectorAll("h1, h2");
		const menuList = document.querySelector("#menu ul");
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
		Menu.setPosition();
	},
	setPosition: function() {
		let title;
		if (location.hash) {
			title = document.getElementById(location.hash.replace("#", ""));
			title.scrollIntoView();
		} else {
			title = document.getElementById('title');
		}
		const menu = document.getElementById('menu');

		menu.style.left = title.getBoundingClientRect().left + title.getBoundingClientRect().width + 40 +"px";
		menu.style.top = 0; // title.getBoundingClientRect().top + "px";
	}
}
window.addEventListener('load', Menu.setup);
window.addEventListener('resize', Menu.setPosition);