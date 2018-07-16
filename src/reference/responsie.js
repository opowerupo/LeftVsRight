var Responsive = {};
Responsive.selectedObjectIndex = null;
Responsive.MobileCluesLoadIndex = 0;
Responsive.MobileClues = new Array();
Responsive.hotspotsData; //local ref
Responsive.cluePanelData; //local ref

Responsive.Setup = function() {
	Responsive.Scale();

	$(window).resize(function() {
		Responsive.Scale();
	});
}

Responsive.Scale = function() {
	Responsive.ScaleClueNameClips();
	Responsive.ScaleCluePicClips();
	Responsive.GetNewScale();
	Responsive.ScaleHotspots();
	Responsive.ScaleHotspotWrapper();
	Responsive.ScaleSpotMask();
	Responsive.ZoomOut();
}

Responsive.ScaleClueNameClips = function() {
	$("#CP_NameClips").css("margin-top", -($(CluesView.overlayDiv).height() + 24) + "px");
}

Responsive.ScaleCluePicClips = function() {
	$("#CP_PicClips").css("margin-top", -$(CluesView.overlayDiv).height());
}


Responsive.ZoomOut = function() {
	var zoomBtn = document.getElementById("ZoomBtn");
	if ($(zoomBtn).hasClass("zoomedIn")) {
		onZoomToggle("out");
		ImageView.canvasCtx.clearRect(0, 0, displayW, displayH);
		ImageView.canvasCtx.drawImage(ImageView.img_bw, 0, 0, 459, 510);
		for (var h = 0; h < ImageView.hotspotClips.length; h++) {
			ImageView.PositionHotspot(ImageView.hotspotsData[h]);
		}

		ImageView.CheckSpotMaskPos();
		allowDragMain(false);
	}
}

Responsive.ScaleSpotMask = function() {
	ImageView.CheckSpotMaskPos();
	$("#SpotMask").width($("#MainImageCanvas").width()).height($("#MainImageCanvas").height());
}

Responsive.GetNewScale = function() {
	var availH = $("#MainImageCanvas").height();
	var availW = $("#MainImageCanvas").width();
	var hScale = availH / ImageView.img_bw.height;
	var wScale = availW / ImageView.img_bw.width;
	defaultScale = (wScale <= hScale) ? wScale : hScale;
	ImageView.curScale = defaultScale;

	displayW = ImageView.img_bw.width * defaultScale;
	displayH = ImageView.img_bw.height * defaultScale;
}

Responsive.ScaleHotspotWrapper = function() {
	$("#Hotspots").width($("#MainImageCanvas").width());
	$("#Hotspots").height($("#MainImageCanvas").height());
}

Responsive.ScaleHotspots = function() {
	for (h = 0; h < ImageView.hotspotsData.length; h++) {
		ImageView.PositionHotspot(ImageView.hotspotsData[h]);
	}
}

Responsive.SetupMobileClues = function(hotspotsData, cluePanelData) {
	var MobileClue;
	Responsive.hotspotsData = hotspotsData;
	Responsive.cluePanelData = cluePanelData;

	var oData;

	for (var i = 0; i < hotspotsData.length; i++) {
		oData = hotspotsData[i];
		MobileClue = Responsive.CreateMobileClue();
		$(MobileClue).attr("oIndex", oData.hoIndex);
		$(MobileClue).attr("found", false);

		Responsive.MobileClues[oData.hoIndex] = MobileClue;

		$("#CluePanelMobile .slides").append(MobileClue);
	}

	Responsive.LoadMobileClue();
}

Responsive.LoadMobileClue = function() {
	var hotspotsData = Responsive.hotspotsData; //local ref
	var cluePanelData = Responsive.cluePanelData; //local ref
	var MobileClue = Responsive.MobileClues[Responsive.MobileCluesLoadIndex];
	var oData = hotspotsData[$(MobileClue).attr("oIndex")];

	var MobileClueImage = new Image();
	MobileClueImage.crossOrigin = 'anonymous';
	MobileClueImage.src = oData.img_bw;
	MobileClueImage.onload = function() {
		var imageWrap = document.createElement("div");
		$(imageWrap).addClass("MobileClueImgWrap");
		var imageCanv = document.createElement("canvas");
		var useScale_x = cluePanelData.picClipImgMobileWidth / MobileClueImage.width;
		var useScale_y = cluePanelData.picClipImgMobileHeight / MobileClueImage.height;
		var useScale = (useScale_x > useScale_y) ? useScale_y : useScale_x;
		if (useScale > 1) useScale = 1;
		var useWidth = MobileClueImage.width * useScale;
		var useHeight = MobileClueImage.height * useScale;

		imageCanv.width = useWidth;
		imageCanv.height = useHeight;
		imageCanv.setAttribute("style", "max-width: " + useWidth + "px;");

		Utility.Rotate(imageCanv, oData.rotation); //**the problem is, later we rotate the imageCanv and when we do, our widths/heights of the rotated canvas' new bounding box are off from the orig widths/heights, so several of the images (esp those rotated along 45% increments) no longer fit properly in the thumb boxes

		var imageCanvCtx = imageCanv.getContext('2d');

		var radians = oData.rotation * (Math.PI / 180);

		imageCanvCtx.drawImage(MobileClueImage, 0, 0, useWidth, useHeight);
		$(imageWrap).html(imageCanv)
		MobileClue.appendChild(imageWrap);


		var MobileClueLabel = document.createElement("label");
		$(MobileClueLabel).addClass('MobileClueLabel');
		MobileClueLabel.innerHTML = oData.word_txt;
		MobileClue.appendChild(MobileClueLabel);


		$(MobileClue).click(function(evt) {
			Responsive.OnObjectClick($(this).attr("oIndex"));
			CluesView.OnObjectClick($(this).attr("oIndex"));
		}); /**/

		Responsive.MobileCluesLoadIndex++;
		if (Responsive.MobileCluesLoadIndex < hotspotsData.length) {
			Responsive.LoadMobileClue();
		} else {
			//alert("done loading clue panel pics");
		}
	}
}

Responsive.OnObjectClick = function(ind) {
	if (Responsive.selectedObjectIndex != null) {
		Responsive.UnhiliteObject(Responsive.selectedObjectIndex);
		if (Responsive.selectedObjectIndex == ind) {
			Responsive.selectedObjectIndex = null;
			return;
		}
		/**/
	}
	Responsive.selectedObjectIndex = ind;
	Responsive.HiliteObject();

	if (cur_targetItemInd != Responsive.selectedObjectIndex) {
		resetHint_item();
	}

	cur_targetItemInd = Responsive.selectedObjectIndex;
}

Responsive.CreateMobileClue = function() {
	var MobileClue = document.createElement("li");
	$(MobileClue).addClass('MobileClue');
	return MobileClue;
}

Responsive.RegisterItemFound = function(ind) {
	Responsive.DimClueClipsByInd(ind);
	Responsive.DisableObject(ind);
	if (ind == Responsive.selectedObjectIndex) {
		Responsive.UnhiliteObject();
		Responsive.selectedObjectIndex = null;
	}

	CluesView.HideOverlay();
}

Responsive.DimClueClipsByInd = function(ind) {
	var MobileClue = Responsive.MobileClues[ind];
	$(MobileClue).attr("found", true).addClass("Checked");
}

Responsive.DisableObject = function(ind) {
	$(Responsive.MobileClues[ind]).unbind('mouseup');
	$(Responsive.MobileClues[ind]).css("cursor", "default");
}

Responsive.UnhiliteObject = function(oIndex) {
	var selectedObjectIndex = Responsive.selectedObjectIndex;
	var MobileClue = Responsive.MobileClues[selectedObjectIndex];
	if ($(MobileClue).hasClass("Highlight")) {
		$(MobileClue).removeClass("Highlight");
	}
}
Responsive.HiliteObject = function() {
	var selectedObjectIndex = Responsive.selectedObjectIndex;
	var MobileClue = Responsive.MobileClues[selectedObjectIndex];
	if (!$(MobileClue).hasClass("Highlight")) {
		$(MobileClue).addClass("Highlight");
	}
}