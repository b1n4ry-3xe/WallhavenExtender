(function WallhavenExtenderExtension() {
	function InsertLinks() {
		var pages = $(".thumb-listing-page");

		// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61)
		if (!pages.length) {
			pages = $(".thumb-listing");
		}

		pages.each(function(i) {
			// don't add the links to the same thumbnails more than once
			if ($(this).data("wee-download-added") === true)
				return true;

			$(this).find(".thumb-info").each(function(i) {
				var wallID = $(this).parent("figure").data("wallpaper-id");
				var wallRes = $(this).children(".wall-res").eq(0).text();
				var wallFavs = $(this).children(".wall-favs").eq(0).text();

				$(this).append($("<a class='wee-download-link'></a>")
					.prop({
						href: WallpaperURL(wallID) + ".jpg",
						download: "wallhaven-" + wallID + ".jpg",
						title: "Download"
					})
					.css({
						right: "30px",
						position: "absolute"
					})
					.click(function(e) {
						// stop the click if we need to validate the file type
						if (!ValidateFileType($(this), wallID)) {
							e.preventDefault();
						}
					})
					.tipsy({delayIn:500,delayOut:500,fade:!0})
					.append("<i class='fa fa-download'></i>")
				);


				$(this).append($("<a></a>")
					.prop({
						href: WallpaperURL(wallID) + ".jpg",
						title: "Popout",
					})
					.attr({
						"data-lightbox": "wee-image",
						"data-title": wallRes + " - Favorites: " + wallFavs
					})
					.css({
						right: "50px",
						position: "absolute"
					})
					.click(function(e) {
						// if we need to validate the file type then block the click event
						if (!ValidateFileType($(this), wallID)) {
							e.preventDefault();
						}

						//document.body.scrollTop = 300;
					})
					.tipsy({delayIn:500,delayOut:500,fade:!0})
					.append("<i class='fa fa-expand'></i>")
				);
			});

			var downloadAll = $("<a href='#'></a>")
				.prop({
					title: "Download page"
				})
				.css({
					marginLeft: "10px"
				})
				.click(function(e) {
					// find each individual download link that we created and click them
					$(this).parents(".thumb-listing-page").eq(0).find(".wee-download-link").each(function() {
						this.click();
					});
					
					e.preventDefault();
				})
				.tipsy({delayIn:500,delayOut:500,fade:!0})
				.append("<i class='fa fa-download'></i>");

			$(this).children("header").eq(0).append(downloadAll);

			// mark this page so it isn't processed again
			$(this).data("wee-download-added", true);
		})
	}



	function ValidateFileType(anchor, id) {
		// don't check more than once
		if (typeof anchor.data("wee-has-type") !== "undefined") 
			return true;

		// check if the file exists as a jpg
		$.ajax({
			method: "HEAD",
			// use alpha. instead of wallpapers. to avoid any cross-origin business
			url: "http://alpha.wallhaven.cc/wallpapers/full/wallhaven-" + id + ".jpg",
			success: function() {
				// jpg
			},
			error: function() {
				// png
				anchor.prop("href", WallpaperURL(id) + ".png");
			},
			complete: function() {
				anchor.data("wee-has-type", true);
				// simulate a real click (not a jquery click)
				anchor[0].click();
			}
		});	

		return false;
	}

	function WallpaperURL(id) {
		return "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-" + id;
	}

	$(document).ajaxComplete(function(event, xhr, settings) { 
		//console.log(event);
		//console.log(xhr);
		//console.log(settings);

		if (settings.url.startsWith("http://wallpapers.wallhaven.cc/wallpapers/full/")) {

		}

		if (!settings.url.startsWith("http://alpha.wallhaven.cc/search"))
			return;

		window.postMessage({ 
			type: "from_inject", 
			id: "page_loaded",
		}, '*');

		InsertLinks();
	});

	InsertLinks();

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message" || event.data.type == "from_inject")
			return;

		console.log("inject.js got message: ", event);
		
		if (event.data.type == "from_content") {
			if (event.data.id == "lightbox") {
				console.log(event.data.data);
			}
		}
	});
})();