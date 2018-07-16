var ImageView = {};
ImageView.imgBWLoaded = false;
ImageView.imgColLoaded = false;
ImageView.canvas;
ImageView.canvasCtx;
ImageView.hotspotClips;
ImageView.numHotsLoaded = 0;

ImageView.gIllo; //local ref
ImageView.iIllo_bw; //local ref
ImageView.iIllo_col; //local ref
ImageView.hotspotsData; //local ref
ImageView.hotspotsDiv;
ImageView.hotspotsDiv_oWidth;
ImageView.hotspotsDiv_oHeight;
ImageView.groundHotspot;
ImageView.container; //local ref
ImageView.img_bw;

ImageView.spotMask; // div
ImageView.spotMaskCanv;
ImageView.spotMaskCanvCtx;
ImageView.spotMaskImg;

ImageView.zoomInterval;
ImageView.maxScale;
ImageView.curScale;
ImageView.zooming = false;

ImageView.dragInterval;
ImageView.dragging = false;
ImageView.startDrag_xPosImg;
ImageView.startDrag_yPosImg;
ImageView.cur_xPosImg = 0;
ImageView.cur_yPosImg = 0;
ImageView.useScaleInc = .1;

ImageView.revealWaitInterval;

ImageView.CreateNew = function(gIllo, iIllo_bw, iIllo_col, hotspotsData, container) {

	ImageView.gIllo = gIllo; //local ref
	ImageView.iIllo_bw = iIllo_bw; //local ref
	ImageView.iIllo_col = iIllo_col; //local ref
	ImageView.hotspotsData = hotspotsData; //local ref
	ImageView.container = container; //local ref

	ImageView.maxScale = gIllo.maxScale;

	ImageView.img_bw = new Image();
	ImageView.img_bw.crossOrigin = "anonymous";
	ImageView.img_bw.src = iIllo_bw;

	ImageView.img_bw.onload = function() {
		ImageView.imgBWLoaded = true;
		//Utility.Log("ImageView.imgBWLoaded: "+ImageView.imgBWLoaded);

		var usePadding = gIllo.padding;
		var availH = activityHeight - usePadding;
		var availW = activityWidth - usePadding;
		var hScale = availH / ImageView.img_bw.height;
		var wScale = availW / ImageView.img_bw.width;
		defaultScale = (wScale <= hScale) ? wScale : hScale;
		ImageView.curScale = defaultScale;
		// now update the displayW accordingly
		displayW = ImageView.img_bw.width * defaultScale;
		displayH = ImageView.img_bw.height * defaultScale;

		ImageView.canvas = document.createElement("canvas");
		ImageView.canvas.setAttribute("id", "MainImageCanvas");

		/*Mobilize Cloud
		$(ImageView.canvas).css("position", "absolute");
        */
		ImageView.canvas.width = displayW;
		ImageView.canvas.height = displayH;

		ImageView.canvasCtx = ImageView.canvas.getContext('2d');
		ImageView.canvasCtx.drawImage(ImageView.img_bw, 0, 0, displayW, displayH);
		container.appendChild(ImageView.canvas);

		$(ImageView.canvas).mouseup(function(evt) {
			//sfx_incorrect.play();
		});

		if ($(mainImage).hasClass("mainImage_col")) {
			$(mainImage).removeClass("mainImage_col");
		}
		$(mainImage).addClass("mainImage_bw");

		onMainImageLoaded();
	};

};

ImageView.ResetCurImgPos = function() {
	ImageView.cur_xPosImg = 0;
	ImageView.cur_yPosImg = 0;
}

ImageView.StartDrag = function(evt) {
	var xOff = $(ImageView.canvas).offset().left;
	var yOff = $(ImageView.canvas).offset().top;
	if (!ImageView.dragging) {
		ImageView.startDrag_xPosImg = curMousePos[0] - xOff - ImageView.cur_xPosImg;
		ImageView.startDrag_yPosImg = curMousePos[1] - yOff - ImageView.cur_yPosImg;
		ImageView.dragInterval = setInterval(ImageView.SetDragPos, 50);
		dLog = new Array();
		//ImageView.dragging = true;
	}
}
ImageView.StopDrag = function() {
	clearInterval(ImageView.dragInterval);
	ImageView.dragging = false;
	//Utility.Log("ImageView.cur_xPosImg: "+ImageView.cur_xPosImg+", ImageView.cur_yPosImg: "+ImageView.cur_yPosImg);
	//Utility.Log("ImageView.startDrag_xPosImg: "+ImageView.startDrag_xPosImg+", ImageView.cur_xPosImg: "+ImageView.cur_xPosImg);
}
ImageView.SetDragPos = function() {
	if (curMousePos == undefined) return;
	ImageView.canvasCtx.clearRect(0, 0, displayW, displayH);
	var useWidth = ImageView.img_bw.width * ImageView.curScale;
	var useHeight = ImageView.img_bw.height * ImageView.curScale;

	var xOff = $(ImageView.canvas).offset().left;
	var yOff = $(ImageView.canvas).offset().top;
	var xPosInImg = curMousePos[0] - xOff - ImageView.startDrag_xPosImg;
	var yPosInImg = curMousePos[1] - yOff - ImageView.startDrag_yPosImg;

	if (xPosInImg > 0) {
		xPosInImg = 0;
	}
	if (yPosInImg > 0) {
		yPosInImg = 0;
	}
	var maxWidth = (useWidth - displayW);
	var maxHeight = (useHeight - displayH);
	if (xPosInImg < -maxWidth) {
		xPosInImg = -maxWidth;
	}
	if (yPosInImg < -maxHeight) {
		yPosInImg = -maxHeight;
	}
	ImageView.cur_xPosImg = xPosInImg;
	ImageView.cur_yPosImg = yPosInImg;

	if (useWidth > 459) {
		ImageView.canvasCtx.drawImage(ImageView.img_bw, xPosInImg, yPosInImg, useWidth, useHeight);
	} else {
		ImageView.canvasCtx.drawImage(ImageView.img_bw, xPosInImg, yPosInImg, 459, 510);
	}


	for (var h = 0; h < ImageView.hotspotClips.length; h++) {
		ImageView.PositionHotspot(ImageView.hotspotsData[h]);
	} /**/

	ImageView.CheckSpotMaskPos();
}



ImageView.StartZoom = function(dir) {
	if (!ImageView.zooming) {
		ImageView.zoomInterval = setInterval(ImageView["Zoom_" + dir], 50);
		ImageView.zooming = true;
	}
}
ImageView.Zoom_in = function() {
	if (ImageView.curScale < ImageView.maxScale) {
		ImageView.canvasCtx.clearRect(0, 0, displayW, displayH);
		//ImageView.curScale += .1;
		if ((ImageView.curScale + ImageView.useScaleInc) > ImageView.maxScale) {
			ImageView.curScale = ImageView.maxScale;
		} else {
			ImageView.curScale += ImageView.useScaleInc;
		}

		var useWidth = ImageView.img_bw.width * ImageView.curScale;
		var useHeight = ImageView.img_bw.height * ImageView.curScale;


		ImageView.canvasCtx.drawImage(ImageView.img_bw, 0, 0, useWidth, useHeight);

		//useWidth = ImageView.hotspotsDiv_oWidth*ImageView.curScale;
		//useHeight = ImageView.hotspotsDiv_oHeight*ImageView.curScale;
		/*$(ImageView.hotspotsDiv).transform({
			scale:[ImageView.curScale,ImageView.curScale]
		});*/
		for (var h = 0; h < ImageView.hotspotClips.length; h++) {
			ImageView.PositionHotspot(ImageView.hotspotsData[h]);
		}

		ImageView.CheckSpotMaskPos();
	} else {
		clearInterval(ImageView.zoomInterval);
		//Utility.Log("ImageView.curScale: "+ImageView.curScale);
		//Utility.Log($(hotspotsDiv).css("width"));
		ImageView.zooming = false;
	}
}
ImageView.Zoom_out = function() {
	//Utility.Log('ImageView.curScale: '+ImageView.curScale+' defaultScale: '+defaultScale);

	if (ImageView.curScale > defaultScale) {
		ImageView.canvasCtx.clearRect(0, 0, displayW, displayH);
		//ImageView.curScale -= .1;
		if ((ImageView.curScale - ImageView.useScaleInc) < defaultScale) {
			ImageView.curScale = defaultScale;
		} else {
			ImageView.curScale -= ImageView.useScaleInc;
		}

		var useWidth = ImageView.img_bw.width * ImageView.curScale;
		var useHeight = ImageView.img_bw.height * ImageView.curScale;

		ImageView.canvasCtx.drawImage(ImageView.img_bw, 0, 0, useWidth, useHeight);



		for (var h = 0; h < ImageView.hotspotClips.length; h++) {
			ImageView.PositionHotspot(ImageView.hotspotsData[h]);
		}

		ImageView.CheckSpotMaskPos();

	} else {
		clearInterval(ImageView.zoomInterval);
		//Utility.Log("ImageView.curScale: "+ImageView.curScale);
		ImageView.zooming = false;
	}
}

ImageView.CreateSpotMask = function() {
	var spotMask = ImageView.spotMask = document.createElement("div");
	$(spotMask).attr("id", "SpotMask");
	ImageView.container.appendChild(spotMask);
	$(spotMask).css("width", displayW + "px");
	$(spotMask).css("height", displayH + "px");
	$(spotMask).css("top", parseInt($(mainImage).css("padding-top")));
	$(spotMask).css("left", parseInt($(mainImage).css("padding-left")));

	spotMaskCanv = document.createElement("canvas");
	spotMaskCanvCtx = spotMaskCanv.getContext('2d');

	$(spotMaskCanv).css("position", "absolute");
	spotMask.appendChild(spotMaskCanv);

	ImageView.PositionSpotMask(null, ImageView.curScale);
}
ImageView.AddSpotMask = function() {
	//Utility.Log("ImageView.AddSpotMask()");
	var spotMask = ImageView.spotMask; //local ref
	$(spotMask).css("z-index", "190");
	Utility.FadeIn(spotMask);

	ImageView.enableSpotmask(true);
}
ImageView.enableSpotmask = function(enableIt) {
	var spotMask = ImageView.spotMask; //local ref
	if (enableIt) {
		$(spotMask).mouseup(function(evt) {
			ImageView.InterpretHitEvent(evt);
		})
	} else {
		$(spotMask).unbind('mouseup');
	}
}

ImageView.FadeoutSpotMask = function() {
	//Utility.Log("ImageView.FadeoutSpotMask()");
	if (ImageView.spotMask) {
		$(ImageView.spotMask).animate({
			opacity: .1
		}, 500, function() {
			$(ImageView.spotMask).css("z-index", -1);
		}); /* */
	}
}

ImageView.CreateHotspots = function() {
	ImageView.hotspotClips = new Array();
	hotspotsDiv = ImageView.hotspotsDiv = document.createElement("div");
	$(hotspotsDiv).attr("id", "Hotspots");
	ImageView.container.appendChild(hotspotsDiv);

	/*Mobilize Cloud
    $(hotspotsDiv).css("width", displayW + "px");
	$(hotspotsDiv).css("height", displayH+"px");
    */

	//ImageView.groundHotspot;
	var hotspotsCanv = document.createElement("canvas");
	var hotspotsCanvCtx = hotspotsCanv.getContext('2d');
	hotspotsCanv.width = displayW;
	hotspotsCanv.height = displayH;
	$(hotspotsCanv).css("position", "absolute");
	$(hotspotsCanv).css("left", 0 + "px"); //
	$(hotspotsCanv).css("top", 0 + "px"); //
	hotspotsDiv.appendChild(hotspotsCanv);
	$(hotspotsCanv).mouseup(function(evt) {
		ImageView.InterpretHitEvent(evt);
	});

	ImageView.LoadHotspotAsset(hotspotsDiv);
}

ImageView.EnableInteractivity = function(enableIt) {
	ImageView.enabled = enableIt;
}

ImageView.UseDifferentAssetsForHotspotReveal = function(hDataObj) {
	if (hDataObj.x_reveal != "") {
		return true;
	}
	return false;
}

ImageView.LoadHotspotAsset_Revealed = function(hDataObj) {
	var hotspotsData = ImageView.hotspotsData; //local ref
	var hotspotImg = new Image();
	var hotspotCanv = hDataObj.hotspotCanv; //local ref;
	var hotspotCanvCtx;
	var useHotWidth;
	var useHotHeight;

	hotspotImg.crossOrigin = "anonymous";
	hotspotImg.src = hDataObj.img_col;
	hotspotImg.onload = function() {
		if ($(hotspotCanv).hasClass("hiddenObject_unfound")) {
			$(hotspotCanv).removeClass("hiddenObject_unfound");
		}
		$(hotspotCanv).addClass("hiddenObject_trans");

		hDataObj.hotspotImg = hotspotImg;
		ImageView.PositionHotspot(hDataObj);

	}
	/**/
}

ImageView.LoadHotspotAsset = function(container) {
	//Utility.Log("ImageView.LoadHotspotAsset");
	var hotspotsData = ImageView.hotspotsData; //local ref
	var hotspotImg = new Image();
	var hotspotCanv;
	var hotspotCanvCtx;
	var useHotWidth;
	var useHotHeight;
	var hDataObj = hotspotsData[ImageView.numHotsLoaded];

	hotspotImg.crossOrigin = "anonymous";
	hotspotImg.src = (ImageView.UseDifferentAssetsForHotspotReveal(hDataObj)) ? hDataObj.img_bw : hDataObj.img_col;
	hotspotImg.onload = function() {
		hotspotsData[ImageView.numHotsLoaded].hotspotImg = hotspotImg;
		hotspotCanv = document.createElement("canvas");
		ImageView.hotspotClips[ImageView.numHotsLoaded] = hotspotCanv;
		hotspotsData[ImageView.numHotsLoaded].hotspotCanv = hotspotCanv;
		hotspotCanvCtx = hotspotCanv.getContext('2d');
		hotspotsData[ImageView.numHotsLoaded].hotspotCanvCtx = hotspotCanvCtx;

		ImageView.PositionHotspot(hotspotsData[ImageView.numHotsLoaded]);
		container.appendChild(hotspotCanv);

		if ($(hotspotCanv).hasClass("hiddenObject_found")) {
			$(hotspotCanv).removeClass("hiddenObject_found");
		}
		$(hotspotCanv).addClass("hiddenObject_unfound");

		$(hotspotCanv).attr("ind", ImageView.numHotsLoaded.toString());

		$(hotspotCanv).attr("found", false);
		$(hotspotCanv).attr("hotspotImg", hotspotImg);
		hotspotsData[ImageView.numHotsLoaded].responsive_width = hotspotImg.width;
		hotspotsData[ImageView.numHotsLoaded].responsive_height = hotspotImg.height;
		$(hotspotCanv).mouseup(function(evt) {
			ImageView.InterpretHitEvent(evt);
		});


		ImageView.numHotsLoaded++;
		if (ImageView.numHotsLoaded < hotspotsData.length) {
			ImageView.LoadHotspotAsset(container);
		} else {

			ImageView.hotspotsDiv_oWidth = parseInt($(ImageView.hotspotsDiv).offsetWidth);
			ImageView.hotspotsDiv_oHeight = parseInt($(ImageView.hotspotsDiv).offsetHeight);
			//Utility.Log("ImageView.curScale: "+ImageView.curScale);
			onMainImageAndHotsLoaded();
		}
	}
	/**/
}

ImageView.InterpretHitEvent = function(evt) {
	if (ImageView.enabled == false) return;
	if (ImageView.dragging) return;

	var hs;
	var h;
	for (h = 0; h < ImageView.hotspotsData.length; h++) {
		hs = ImageView.hotspotsData[h];
		if (!Utility.True($(ImageView.hotspotClips[hs.hoIndex]).attr("found"))) {
			var useWidth = hs.hotspotImg.width * ImageView.curScale;
			var useHeight = hs.hotspotImg.height * ImageView.curScale;

			var xOff = $(ImageView.canvas).offset().left;
			var yOff = $(ImageView.canvas).offset().top;

			var leftBound = (hs.x * ImageView.curScale);
			var topBound = (hs.y * ImageView.curScale);
			var rightBound = (leftBound + (useWidth));
			var bottomBound = (topBound + (useHeight));

			var evtX;
			var evtY;
			if (ImageView.curScale != defaultScale) {
				curMousePos = Utility.GetMousePosition(evt);
				evtX = ImageView.startDrag_xPosImg;
				evtY = ImageView.startDrag_yPosImg;
			} else {
				evtX = Utility.GetMousePosition(evt)[0] - xOff; // - ImageView.startDrag_xPosImg;
				evtY = Utility.GetMousePosition(evt)[1] - yOff; // - ImageView.startDrag_yPosImg;
			}

			if ((evtX >= leftBound) && (evtX <= rightBound) && (evtY >= topBound) && (evtY <= bottomBound) && (ImageView.ConfirmValidHit(Utility.GetMousePosition(evt)[0], Utility.GetMousePosition(evt)[1], hs))) {
				ImageView.ShowHotspotAsFound(hs);
				var hotspotCanv = hs.hotspotCanv;
				registerItemFound($(hotspotCanv));
				ImageView.enableSpotmask(false);
				return;
			}
		}
	}
	ImageView.DoIncorrectHit();

}

ImageView.ConfirmValidHit = function(evtX, evtY, hDataObj) {
	var hotspotCanv = hDataObj.hotspotCanv; //local ref
	var hotspotCanvCtx = hDataObj.hotspotCanvCtx; //local ref
	var xPosInImg = evtX - $(hotspotCanv).offset().left;
	var yPosInImg = evtY - $(hotspotCanv).offset().top;
	//Utility.Log("xPosInImg: "+ xPosInImg + ", yPosInImg: "+ yPosInImg);
	var hotspotPixelData = hotspotCanvCtx.getImageData(xPosInImg, yPosInImg, 1, 1); //Get the pixelData of image
	var pixelAlpha = hotspotPixelData.data[3];
	//Utility.Log("pixelAlpha: "+ pixelAlpha);
	hotspotPixelData = null;

	if (pixelAlpha > 3) {
		return true;
	}

	return false;
}

ImageView.ShowHotspotAsFound = function(hs) {
	var hotspotCanv = hs.hotspotCanv; //local ref
	if (ImageView.UseDifferentAssetsForHotspotReveal(hs)) {
		ImageView.LoadHotspotAsset_Revealed(hs);
	} else {
		if ($(hotspotCanv).hasClass("hiddenObject_unfound")) {
			$(hotspotCanv).removeClass("hiddenObject_unfound");
		}
		$(hotspotCanv).addClass("hiddenObject_found");
		$(hotspotCanv).css("z-index", "100");
	}

}

ImageView.DoIncorrectHit = function() {
	triggerPlaySFX(sfx_incorrect);
}

ImageView.CheckSpotMaskPos = function() {
	if (ImageView.spotMask) {
		if ($(ImageView.spotMask).css("opacity") > .1) {
			//Utility.Log('CheckSpotMaskPos()');
			var hs = ImageView.hotspotsData[cur_targetItemInd];
			//Utility.Log("calling PositionSpotMask from CheckSpotMaskPos()");
			ImageView.PositionSpotMask(hs, hintScale);
		}
	}
}

ImageView.PositionSpotMask = function(hDataObj, targetScale) {
	//Utility.Log("targetScale: "+targetScale);
	spotMaskCanv.width = displayW;
	spotMaskCanv.height = displayH;

	// set transparency value
	spotMaskCanvCtx.globalAlpha = 0.75;
	spotMaskCanvCtx.clearRect(0, 0, 800, 800);
	spotMaskCanvCtx.fillStyle = '#000033';
	spotMaskCanvCtx.fillRect(0, 0, spotMaskCanv.width, spotMaskCanv.height);
	spotMaskCanvCtx.globalCompositeOperation = 'destination-out';

	var useScale = (ImageView.curScale != defaultScale) ? (ImageView.curScale - .3) : ImageView.curScale;
	var useSpotSize = 450;
	if (!targetScale) targetScale = 1;
	var useWidth = (useSpotSize * targetScale * useScale); //*ImageView.curScale;
	var useHeight = (useSpotSize * targetScale * useScale); //*ImageView.curScale;

	//hDataObj - the hotspot data object for the target hotspot (hidden object)
	var targetX = (hDataObj == null) ? 0 : ((hDataObj.x * ImageView.curScale) + ((hDataObj.hotspotImg.width * ImageView.curScale) / 2));
	var targetY = (hDataObj == null) ? 0 : ((hDataObj.y * ImageView.curScale) + ((hDataObj.hotspotImg.height * ImageView.curScale) / 2));
	//Utility.Log("targetX: "+targetX + ", targetY: "+targetY);
	var useX = targetX + ImageView.cur_xPosImg;
	var useY = targetY + ImageView.cur_yPosImg;

	spotMaskCanvCtx.globalAlpha = 1;
	var grd = spotMaskCanvCtx.createRadialGradient(useX, useY, useWidth / 2, useX, useY, useWidth);

	grd.addColorStop(0, "rgba(0,0,51,1)");
	grd.addColorStop(1, "transparent");
	spotMaskCanvCtx.fillStyle = grd;
	spotMaskCanvCtx.beginPath();
	spotMaskCanvCtx.arc(useX, useY, useWidth, 0, Math.PI * 2, true);
	spotMaskCanvCtx.fill();
	spotMaskCanvCtx.closePath();

}

ImageView.PositionHotspot = function(hDataObj) {
	hotspotCanv = hDataObj.hotspotCanv; //local ref
	hotspotCanvCtx = hDataObj.hotspotCanvCtx; //local ref
	hotspotImg = hDataObj.hotspotImg; //local ref

	var useHotWidth = hotspotImg.width * ImageView.curScale;
	var useHotHeight = hotspotImg.height * ImageView.curScale;

	hotspotCanvCtx.clearRect(0, 0, 200, 200);
	hotspotCanv.width = useHotWidth;
	hotspotCanv.height = useHotHeight;
	hotspotCanvCtx.drawImage(hDataObj.hotspotImg, 0, 0, useHotWidth, useHotHeight);

	var useX = hDataObj.x;
	var useY = hDataObj.y;
	if ((ImageView.UseDifferentAssetsForHotspotReveal(hDataObj)) && (Utility.True($(hotspotCanv).attr("found")))) {
		useX = hDataObj.x_reveal;
		useY = hDataObj.y_reveal;
	}

	$(hotspotCanv).css("left", (useX * ImageView.curScale) + ImageView.cur_xPosImg + "px"); //
	$(hotspotCanv).css("top", (useY * ImageView.curScale) + ImageView.cur_yPosImg + "px"); //

	//have to break this case apart before & after the actual repositioning, so as not to show an awkward visual positioning shift (Chrome).
	if ((ImageView.UseDifferentAssetsForHotspotReveal(hDataObj)) && (Utility.True($(hotspotCanv).attr("found")))) {
		if ($(hotspotCanv).hasClass("hiddenObject_trans")) {
			$(hotspotCanv).removeClass("hiddenObject_trans");
		}
		$(hotspotCanv).addClass("hiddenObject_found");
		$(hotspotCanv).css("z-index", "100");
	}

}

ImageView.LoadMainReveal = function() {
	ImageView.revealWaitInterval = setInterval(ImageView.CheckZoomProg, 50);
}
ImageView.CheckZoomProg = function() {
	if (!ImageView.zooming) {
		clearInterval(ImageView.revealWaitInterval);
		ImageView.LoadMainReveal_contd();
	}
}

ImageView.LoadMainReveal_contd = function() {
	var iIllo_col = ImageView.iIllo_col; //local ref
	var container = ImageView.container; //local ref

	ImageView.img_col = new Image();
	ImageView.img_col.crossOrigin = "anonymous";
	ImageView.img_col.src = iIllo_col;

	ImageView.img_col.onload = function() {
		ImageView.imgColLoaded = true;
		//Utility.Log("ImageView.imgColLoaded: "+ImageView.imgColLoaded);

		ImageView.canvas_reveal = document.createElement("canvas");

		//Mobilize Cloud
		//$(ImageView.canvas_reveal).css("position", "absolute");
		//$(ImageView.canvas_reveal).css("top", $(ImageView.canvas).position().top);
		//if (isIE){
		//	$(ImageView.canvas_reveal).css("left", parseInt($(mainImage).css("padding")));
		//}else{
		//	$(ImageView.canvas_reveal).css("left", $(ImageView.canvas).position().left);
		//}
		ImageView.canvas_reveal.width = displayW;
		ImageView.canvas_reveal.height = displayH;

		ImageView.canvasCtx = ImageView.canvas_reveal.getContext('2d');
		ImageView.canvasCtx.drawImage(ImageView.img_col, 0, 0, displayW, displayH);
		container.appendChild(ImageView.canvas_reveal);

		if ($(mainImage).hasClass("mainImage_bw")) {
			$(mainImage).removeClass("mainImage_bw");
		}
		$(mainImage).addClass("mainImage_col");

		$(ImageView.canvas_reveal).addClass("revealImage_init");
		$(ImageView.canvas_reveal).animate({
			opacity: 1,
		}, 1000, function() { //anim complete
		});
	};
}