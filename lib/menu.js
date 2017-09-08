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
			a.href = "#"+title;
			a.innerText = headers[i].innerText;
			menuList.appendChild(link);
			if (headers[i].tagName == "H1") {
				link.style.fontWeight = "bold";
			}
		}
		Menu.setPosition();
	},
	setPosition: function() {
		const menu = document.getElementById('menu');
		const title = document.getElementById('title');
		menu.style.left = title.getBoundingClientRect().left + title.getBoundingClientRect().width + 40 +"px";
		menu.style.top = title.getBoundingClientRect().top + "px";
	}
}
$(window).on('load', function() {
	Menu.setup();
});
$(window).on('resize', function() {
	Menu.setPosition();
});