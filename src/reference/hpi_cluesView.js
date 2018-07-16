// JavaScript Document
var CluesView = {};
CluesView.allObjectsCreated = false;
CluesView.selectedObjectIndex = null;
CluesView.picClips = new Array();
CluesView.nameClips = new Array();
CluesView.picClipsDiv;
CluesView.nameClipsDiv;
CluesView.overlayDiv;
CluesView.picsVisible = false;
CluesView.namesVisible = true;
CluesView.overlayVisible = false;
CluesView.toggleContainer;
CluesView.startTxt;

CluesView.hotspotsData; //local ref
CluesView.cluePanelData; //local ref

CluesView.overlayPicImg;
CluesView.overlayPicCanv;
CluesView.overlayPicCanvCtx;


CluesView.CreateNew = function(hotspotsData, cluePanelData) {
	CluesView.hotspotsData = hotspotsData;
	CluesView.cluePanelData = cluePanelData;

	CluesView.SetupToggle();
	CluesView.SetupOverlay();
	CluesView_pics.BuildPanel();
	CluesView_names.BuildPanel();

	Utility.FadeIn(cluePanel);
}

//********************************************************************************************
CluesView.SetupToggle = function() {
	var cluePanelData = CluesView.cluePanelData; //local ref
	var toggleContainer = CluesView.toggleContainer = document.getElementById("CP_Toggle");

	toggleContainer.innerHTML = '<fieldset class="checkboxes">';
	toggleContainer.innerHTML += '<label class="label_check" for="CB_Names"><input type="checkbox" checked name="CB_Names" id="CB_Names" value="1" onClick="CluesView.HandleCheckbox(this);" />' + cluePanelData.names_selector_txt + '</label>';
	toggleContainer.innerHTML += '<label class="label_check" for="CB_Pics"><input type="checkbox" checked name="CB_Pics" id="CB_Pics" value="1" onClick="CluesView.HandleCheckbox(this);" />' + cluePanelData.pics_selector_txt + '</label>';
	toggleContainer.innerHTML += '</fieldset>';

	Utility.Fix_iPadLabels();
	CluesView.SetupLabels();
	//******************************************

	// ... and start text...
	var startTxt = CluesView.startTxt = document.getElementById("CP_StartTxt");
	startTxt.innerHTML = cluePanelData.instr_txt;
}

CluesView.SetupLabels = function() {
	if ($('.label_check input').length) {
		$('.label_check').each(function() {
			$(this).removeClass('c_on');
		});
		$('.label_check input:checked').each(function() {
			$(this).parent('label').addClass('c_on');
		});
	};
};

CluesView.HandleCheckbox = function(element) {
	//alert("element: "+element);
	var cbID = $(element).attr("id").split("_")[1];
	CluesView["OnClue" + cbID + "Btn"]();
	CluesView.SetupLabels();
}

CluesView.OnClueNamesBtn = function() {
	CluesView.ShowNames();
	CluesView.HideStartTxt();
}
CluesView.OnCluePicsBtn = function() {
	CluesView.ShowPics();
	CluesView.HideStartTxt();
}


CluesView.HideStartTxt = function() {
	if ($(cluePanel).css("background-image") != "none") {
		$(CluesView.startTxt).animate({
			opacity: 0,
		}, 100, function() {
			cluePanel.removeChild(this); //anim complete
		});
		$(cluePanel).css("background-image", "none");
	}
}

//********************************************************************************************
var CluesView_pics = {};
CluesView_pics.startX = 0; // REFACTOR
CluesView_pics.startY = 0; // REFACTOR
CluesView_pics.spacingY = 0; // REFACTOR
CluesView_pics.rowsMax;
CluesView_pics.colsMax;
CluesView_pics.picsLoadIndex = 0;

CluesView_pics.BuildPanel = function() {
	var picClip;
	var hotspotsData = CluesView.hotspotsData; //local ref
	var cluePanelData = CluesView.cluePanelData; //local ref
	var oData;

	CluesView_pics.rowsMax = cluePanelData.maxRows;
	CluesView_pics.colsMax = cluePanelData.maxCols;

	var picClipsDiv = CluesView.picClipsDiv = document.createElement("div");
	cluePanel.appendChild(picClipsDiv);
	$(picClipsDiv).attr("id", "CP_PicClips");
	$(picClipsDiv).css("margin-top", -$(CluesView.overlayDiv).height());

	var useX = CluesView_pics.startX;
	var useY = CluesView_pics.startY;
	var colNum = 1;
	var rowNum = 1;

	for (var i = 0; i < hotspotsData.length; i++) {
		oData = hotspotsData[i];
		picClip = CluesView_pics.PicClip();
		$(picClip).attr("oIndex", oData.hoIndex);
		$(picClip).css("width", cluePanelData.picClipTotalWidth);
		$(picClip).css("height", cluePanelData.picClipTotalHeight);
		$(picClip).css("margin-left", useX);
		$(picClip).css("margin-top", useY);
		$(picClip).css("background-position", ((cluePanelData.picClipTotalWidth - cluePanelData.picClipImgWidth) / 2) + "px " + "0px");

		if (colNum == CluesView_pics.colsMax) {
			rowNum++;
			useY -= (CluesView_pics.spacingY); //*rowNum);
			colNum = 1;
		} else {
			colNum++;
		}

		$(picClip).attr("found", false);

		CluesView.picClips[oData.hoIndex] = picClip;
		picClipsDiv.appendChild(picClip);

		/**/
	}

	CluesView_pics.LoadClipPicImage();


	/*
	var picClip:*;
	var oData:Object;

	picClips = new Array();
	picClips_mc = new MovieClip();
	picClips_mc.alpha = 0;
	picClips_mc.visible = false;
	this.addChild(picClips_mc);


	var testClip:*;
	var objectsData_multiMixed = new Array();
	var objectsData_reserved = new Array();
	for (i=0; i<objectsData.length; i++){
		oData = objectsData[i];
		testClip = new ClueItem_Pic();
		testClip.lbl.text = oData.word_txt;
		testClip.lbl.setTextFormat(lblsTextFormat);
		//trace("testClip.lbl.numLines: " + testClip.lbl.numLines);
		if ((testClip.lbl.numLines == 1) && (objectsData_reserved.length<pics_rowsMax)){
			//trace("	"+oData.word_txt + " is a single line & objectsData_reserved.length = "+objectsData_reserved.length);
			objectsData_reserved.push(oData);
		}else{
			//trace("	"+oData.word_txt + " is a multi line &/or objectsData_reserved.length = "+objectsData_reserved.length);
			objectsData_multiMixed.push(oData);
		}
	}
	objectsData_multiMixed = parent_ref.utils.shuffle(objectsData_multiMixed);
	objectsData = objectsData_multiMixed.concat(objectsData_reserved);
	//trace("objectsData.length: "+objectsData);
	*/
}

CluesView_pics.LoadClipPicImage = function() {
	var hotspotsData = CluesView.hotspotsData; //local ref
	var cluePanelData = CluesView.cluePanelData; //local ref
	var picClip = CluesView.picClips[CluesView_pics.picsLoadIndex];
	var oData = hotspotsData[$(picClip).attr("oIndex")];
	var picImage;
	var imageCanv;
	var imageCanvCtx;
	var useWidth;
	var useHeight;
	var useScale_x;
	var useScale_y;
	var useScale;
	var useOffsetX;
	var useOffsetY;
	var picClipLabel;

	picImage = new Image();
	picImage.crossOrigin = 'anonymous';
	picImage.src = oData.img_bw;
	picImage.onload = function() {
		imageCanv = document.createElement("canvas");
		//Utility.Rotate(picImage, oData.rotation);  //**this doesn't work, and rotating the imageCanv here is the same as rotating it after the scaling operation.
		useScale_x = cluePanelData.picClipImgWidth / picImage.width - .05;
		useScale_y = cluePanelData.picClipImgHeight / picImage.height - .05;
		//Utility.Log(oData.word_txt + " useScale_x: "+useScale_x+", useScale_y: "+useScale_y);
		useScale = (useScale_x > useScale_y) ? useScale_y : useScale_x;
		if (useScale > 1) useScale = 1;
		useWidth = picImage.width * useScale;
		useHeight = picImage.height * useScale;
		//Utility.Log("	picImage.width: "+picImage.width+", picImage.height: "+picImage.height);

		//$(imageCanv).addClass("cp");
		imageCanv.width = useWidth;
		imageCanv.height = useHeight;
		//console.log("imageCanv.width: "+imageCanv.width+", imageCanv.height: "+imageCanv.height);
		//console.log("	cluePanelData.picClipImgWidth: "+cluePanelData.picClipImgWidth);
		//console.log("	useWidth: "+useWidth);
		//console.log("	(cluePanelData.picClipImgWidth - useWidth)/2: "+(cluePanelData.picClipImgWidth - useWidth)/2);
		useOffsetX = 0; //(cluePanelData.picClipImgWidth - useWidth)/2;
		useOffsetY = (cluePanelData.picClipImgHeight - useHeight) / 2;
		$(imageCanv).css("margin-left", useOffsetX + "px");
		$(imageCanv).css("margin-top", useOffsetY + "px");
		Utility.Rotate(imageCanv, oData.rotation); //**the problem is, later we rotate the imageCanv and when we do, our widths/heights of the rotated canvas' new bounding box are off from the orig widths/heights, so several of the images (esp those rotated along 45% increments) no longer fit properly in the thumb boxes

		imageCanvCtx = imageCanv.getContext('2d');

		var radians = oData.rotation * (Math.PI / 180);
		//Utility.Log("		radians: "+radians);
		//imageCanvCtx.rotate(radians);	// using this requires repositioning/offsetting the drawing in the canvas.  can't retain 0,0 coords

		imageCanvCtx.drawImage(picImage, 0, 0, useWidth, useHeight);
		picClip.appendChild(imageCanv);


		picClipLabel = document.createElement("label");
		$(picClipLabel).addClass('CP_picLabel');
		$(picClipLabel).css("width", cluePanelData.picClipTotalWidth);
		//useOffsetY =  $(picClip).position().top + parseInt($(cluePanel).css("margin-top"));
		useOffsetY = (cluePanelData.picClipImgHeight);
		$(picClipLabel).css("top", useOffsetY + "px");
		picClipLabel.innerHTML = oData.word_txt;
		picClip.appendChild(picClipLabel);


		$(picClip).mouseup(function(evt) {
			CluesView.OnObjectClick($(this).attr("oIndex"));
			Responsive.OnObjectClick($(this).attr("oIndex"));
		}); /**/

		CluesView_pics.picsLoadIndex++;
		if (CluesView_pics.picsLoadIndex < hotspotsData.length) {
			CluesView_pics.LoadClipPicImage();
		} else {
			CluesView.OnCluePicsBtn();
		}
	}
}

CluesView_pics.PicClip = function() {
	var picClipDiv = document.createElement("div");
	$(picClipDiv).addClass('CP_picClip');
	return picClipDiv;
}

//********************************************************************************************
var CluesView_names = {};
CluesView_names.startX = 0; // REFACTOR
CluesView_names.startY = 0; // REFACTOR
CluesView_names.spacingY = 0; // REFACTOR

CluesView_names.BuildPanel = function() {
	var nameClip;
	var nameClipLabel;
	var hotspotsData = CluesView.hotspotsData; //local ref
	var cluePanelData = CluesView.cluePanelData; //local ref
	var oData;

	var nameClipsDiv = CluesView.nameClipsDiv = document.createElement("div");
	cluePanel.appendChild(nameClipsDiv);
	$(nameClipsDiv).css("margin-top", -($(CluesView.overlayDiv).height() + 24) + "px");
	/*if (isIE){
		$(nameClipsDiv).css("margin-top", -(parseInt($(CluesView.picClipsDiv).css("height"))) );
	}*/
	$(nameClipsDiv).attr("id", "CP_NameClips");

	for (var i = 0; i < hotspotsData.length; i++) {
		oData = hotspotsData[i];
		nameClip = CluesView_names.NameClip();
		$(nameClip).attr("oIndex", oData.hoIndex);
		$(nameClip).css("height", cluePanelData.nameClipHeight);
		$(nameClip).css("margin-left", cluePanelData.nameClipMarginLeft);
		$(nameClip).attr("found", false);

		CluesView.nameClips[oData.hoIndex] = nameClip;
		nameClipsDiv.appendChild(nameClip);

		$(nameClip).mouseup(function(evt) {
			CluesView.OnObjectClick($(this).attr("oIndex"));
		});

		nameClipLabel = document.createElement("label");
		$(nameClipLabel).addClass('CP_nameLabel');
		nameClipLabel.innerHTML = oData.word_txt;
		nameClip.appendChild(nameClipLabel);

		/**/
	}

}

CluesView_names.NameClip = function() {
	var nameClipDiv = document.createElement("div");
	$(nameClipDiv).addClass('CP_nameClip');
	return nameClipDiv;
}

CluesView.ShowPics = function() {
	var useAlpha;
	if (CluesView.picsVisible) {
		//hide
		CluesView.FadeFrmHidden(CluesView.picClipsDiv, false);
		CluesView.ShowPicNames(false);
		if (CluesView.namesVisible) {
			CluesView.FadeFrmHidden(CluesView.nameClipsDiv, true);
			CluesView.ShowNameNames(true);
		}
	} else {
		CluesView.FadeFrmHidden(CluesView.picClipsDiv, true);
		if (CluesView.namesVisible) {
			CluesView.ShowPicNames(true);
			CluesView.FadeFrmHidden(CluesView.nameClipsDiv, false);
			CluesView.ShowNameNames(false);
		} else {
			CluesView.ShowPicNames(false);
		}
	}
	CluesView.picsVisible = !CluesView.picsVisible;
}


CluesView.ShowPicNames = function(showThem) {
	var tmpArry;
	var useLabelElement;
	for (var i = 0; i < CluesView.picClips.length; i++) {
		tmpArry = CluesView.picClips[i].getElementsByTagName("label");
		useLabelElement = tmpArry[0];
		if (showThem) {
			CluesView.FadeFrmHidden(useLabelElement, true);
		} else {
			CluesView.FadeFrmHidden(useLabelElement, false);
		}
	}
}
CluesView.ShowNameNames = function(showThem) {
	var tmpArry;
	var useLabelElement;
	for (var i = 0; i < CluesView.nameClips.length; i++) {
		tmpArry = CluesView.nameClips[i].getElementsByTagName("label");
		useLabelElement = tmpArry[0];
		if (showThem) {
			CluesView.FadeFrmHidden(useLabelElement, true);
		} else {
			CluesView.FadeFrmHidden(useLabelElement, false);
		}
	}
}

CluesView.ShowNames = function() {
	if (CluesView.namesVisible) {
		//hide names
		if (CluesView.picsVisible) {
			CluesView.ShowPicNames(false);
		} else {
			CluesView.FadeFrmHidden(CluesView.nameClipsDiv, false);
			CluesView.ShowNameNames(false);
		}
		//Utility.FadeOut(spotlightClipDiv.lbl);
	} else {
		//show names
		if (CluesView.picsVisible) {
			CluesView.ShowPicNames(true);
		} else {
			CluesView.FadeFrmHidden(CluesView.nameClipsDiv, true);
			CluesView.ShowNameNames(true);
		}
		//Utility.FadeIn(spotlightClipDiv.lbl);
	}
	CluesView.namesVisible = !CluesView.namesVisible;
}

CluesView.FadeFrmHidden = function(element, fadeIn) {
	var useZindex;
	if (fadeIn) {
		useZindex = (element == CluesView.overlayDiv) ? "200" : "190";
		$(element).css("z-index", useZindex);
		$(element).css("visibility", "visible");
		//alert($(element).attr('id') + " commencing fade in, visibility: "+ $(element).css('visibility'));//anim complete
		$(element).stop().animate({
			opacity: 1,
		}, 500, function() {
			$(element).css("z-index", useZindex);
			$(element).css("visibility", "visible");
			//alert($(element).attr('id') + " faded in, visibility: "+ $(element).css('visibility'));//anim complete
		});
	} else {
		$(element).stop().animate({
			opacity: .01,
		}, 500, function() {
			$(element).css("visibility", "hidden"); //anim complete
			$(element).css("z-index", -1);
			//alert("$("+element+").css(\"visibility\"): "+$(element).css("visibility"));
		});
	}
}

//********************************************************************************************
CluesView.RegisterItemFound = function(ind) {
	CluesView.DimClueClipsByInd(ind);
	CluesView.DisableObject(ind);
	if (ind == CluesView.selectedObjectIndex) {
		CluesView.UnhiliteObject();
		CluesView.selectedObjectIndex = null;
	}

	CluesView.HideOverlay();
}

CluesView.DimClueClipsByInd = function(ind) {
	var nameClip = CluesView.nameClips[ind];
	$(nameClip).attr("found", true);
	var picClip = CluesView.picClips[ind];
	$(picClip).attr("found", true);
	var useX;
	var useY;
	CluesView.Dim(nameClip);
	var nameClipCheck = document.createElement("div");
	$(nameClipCheck).addClass("CP_checkmark");
	CluesView.nameClipsDiv.appendChild(nameClipCheck);
	useX = ($(nameClip).position().left + parseInt($(nameClip).css("padding-left")) + (parseInt($(nameClipCheck).css("width")) / 2));
	useY = $(nameClip).position().top;
	$(nameClipCheck).css("left", useX + "px");
	$(nameClipCheck).css("top", useY + "px");

	CluesView.Dim(picClip);
	var picClipCheck = document.createElement("div");
	$(picClipCheck).addClass("CP_checkmark");
	CluesView.picClipsDiv.appendChild(picClipCheck);
	var thumbWidth = CluesView.cluePanelData.picClipImgWidth;
	var thumbHeight = CluesView.cluePanelData.picClipImgHeight;
	useX = ($(picClip).position().left + thumbWidth - 2);
	useY = ($(picClip).position().top + thumbHeight - parseInt($(picClipCheck).css("height")) + 2);
	$(picClipCheck).css("left", useX + "px");
	$(picClipCheck).css("top", useY + "px");

}

CluesView.Dim = function(element) {
	//alert("CluesView.Dim element: "+element);
	$(element).animate({
		opacity: .4,
	}, 500, function() { //anim complete .6 opacity originally
	});
}

CluesView.DisableObject = function(ind) {
	$(CluesView.picClips[ind]).unbind('mouseup');
	$(CluesView.picClips[ind]).css("cursor", "default");
	$(CluesView.nameClips[ind]).unbind('mouseup');
	$(CluesView.nameClips[ind]).css("cursor", "default");
}

//********************************************************************************************
CluesView.SetupOverlay = function() {
	var overlayDiv = CluesView.overlayDiv = document.createElement("div");
	cluePanel.appendChild(overlayDiv);
	$(overlayDiv).attr("id", "HintOverlay");
	var useWidth = $(cluePanel).css("width") - parseInt($(overlayDiv).css("margin-right"));
	var useHeight = activityHeight - $(activityHdrBar).height() - $(CluesView.toggleContainer).height() - (parseInt($(overlayDiv).css("padding-top")) * 2); //$(cluePanel).css("height")-parseInt($(overlayDiv).css("margin-right"));
	$(overlayDiv).css("width", useWidth + "px");
	$(overlayDiv).css("height", useHeight + "px");
}

CluesView.ShowOverlay = function() {
	var overlayDiv = CluesView.overlayDiv;
	CluesView.FadeFrmHidden(overlayDiv, true);
}
CluesView.HideOverlay = function() {
	var overlayDiv = CluesView.overlayDiv;
	CluesView.FadeFrmHidden(overlayDiv, false);
}

CluesView.OnObjectClick = function(ind) {
	if (CluesView.selectedObjectIndex != null) {
		CluesView.UnhiliteObject(CluesView.selectedObjectIndex);
		if (CluesView.selectedObjectIndex == ind) {
			CluesView.selectedObjectIndex = null;
			return;
		}
		/**/
	}
	CluesView.selectedObjectIndex = ind;
	CluesView.HiliteObject();

	if (cur_targetItemInd != CluesView.selectedObjectIndex) {
		resetHint_item();
	}

	cur_targetItemInd = CluesView.selectedObjectIndex;
}

CluesView.UnhiliteObject = function(oIndex) {
	var selectedObjectIndex = CluesView.selectedObjectIndex;
	var picClip = CluesView.picClips[selectedObjectIndex];
	if ($(picClip).hasClass("CP_picClip_hilited")) {
		$(picClip).removeClass("CP_picClip_hilited");

		if (!$(picClip).hasClass("CP_picClip")) {
			$(picClip).addClass("CP_picClip");
		}
	} /**/

	var tmpArry = CluesView.picClips[selectedObjectIndex].getElementsByTagName("label");
	var useLabelElement = tmpArry[0];
	if ($(useLabelElement).hasClass("CP_name_hilited")) {
		$(useLabelElement).removeClass("CP_name_hilited")
	}
	tmpArry = CluesView.nameClips[selectedObjectIndex].getElementsByTagName("label");
	useLabelElement = tmpArry[0];
	if ($(useLabelElement).hasClass("CP_name_hilited")) {
		$(useLabelElement).removeClass("CP_name_hilited")
	}

}
CluesView.HiliteObject = function() {
	var selectedObjectIndex = CluesView.selectedObjectIndex;
	var picClip = CluesView.picClips[selectedObjectIndex];
	if (!$(picClip).hasClass("CP_picClip_hilited")) {
		if ($(picClip).hasClass("CP_picClip")) {
			$(picClip).removeClass("CP_picClip");
		}
		$(picClip).addClass("CP_picClip_hilited");
	} /**/

	var tmpArry = CluesView.picClips[selectedObjectIndex].getElementsByTagName("label");
	var useLabelElement = tmpArry[0];
	if (!$(useLabelElement).hasClass("CP_name_hilited")) {
		$(useLabelElement).addClass("CP_name_hilited")
	}
	tmpArry = CluesView.nameClips[selectedObjectIndex].getElementsByTagName("label");
	useLabelElement = tmpArry[0];
	if (!$(useLabelElement).hasClass("CP_name_hilited")) {
		$(useLabelElement).addClass("CP_name_hilited")
	}

	if (CluesView.picsVisible) {
		CluesView.UpdateOverlay();
	}
}

CluesView.UpdateOverlay = function() {
	var picImage;
	var overlayPicCanv = CluesView.overlayPicCanv;
	var overlayPicCanvCtx = CluesView.overlayPicCanvCtx;
	var oData = CluesView.hotspotsData[CluesView.selectedObjectIndex];
	var overlayDiv = CluesView.overlayDiv;
	var picLabel;

	if (overlayPicCanv) {
		overlayPicCanvCtx.clearRect(0, 0, 3000, 3000);
	} else {
		overlayPicCanv = CluesView.overlayPicCanv = document.createElement("canvas");
		overlayPicCanvCtx = CluesView.overlayPicCanvCtx = overlayPicCanv.getContext('2d');
	}

	picImage = CluesView.overlayPicImg = new Image();
	picImage.crossOrigin = 'anonymous';
	picImage.src = oData.img_bw;

	overlayPicCanv.width = picImage.width;
	overlayPicCanv.height = picImage.height;

	var overlayWidth = $(overlayDiv).width();
	var overlayHeight = $(overlayDiv).height();

	picImage.onload = function() {
		useScale_x = overlayWidth / picImage.width - .05;
		useScale_y = overlayHeight / picImage.height - .05;
		//alert("useScale_x: "+useScale_x+", useScale_y: "+useScale_y);
		useScale = (useScale_x > useScale_y) ? useScale_y : useScale_x;
		if (useScale > 1) useScale = 1;
		useWidth = picImage.width * useScale;
		useHeight = picImage.height * useScale;

		overlayPicCanv.width = useWidth;
		overlayPicCanv.height = useHeight;
		useOffsetX = (overlayWidth - useWidth) / 2;
		useOffsetY = (overlayHeight - useHeight) / 3;
		$(overlayPicCanv).css("margin-left", useOffsetX + "px");
		$(overlayPicCanv).css("margin-top", useOffsetY + "px");
		Utility.Rotate(overlayPicCanv, oData.rotation);

		overlayPicCanvCtx.drawImage(picImage, 0, 0, useWidth, useHeight);
		overlayDiv.appendChild(overlayPicCanv);

		$(overlayDiv).mouseup(function(evt) {
			CluesView.HideOverlay();
		});

		var tmpArry = overlayDiv.getElementsByTagName("label");
		if (tmpArry.length) {
			picLabel = tmpArry[0];
		} else {
			picLabel = document.createElement("label");
			$(picLabel).addClass('CP_overlayLabel');
			$(picLabel).css("width", $(overlayDiv).width());
			useOffsetY = ($(overlayDiv).height() - 30);
			$(picLabel).css("top", useOffsetY + "px");
		}
		picLabel.innerHTML = oData.word_txt; //REVISIT: If change scale code above to use actual size in picture, add the following. +'<br><span class="CP_overlayLabel_sub">'+'(actual size in picture)'+'</span>';//REVISIT TO EXTERNALIZE TEXT
		overlayDiv.appendChild(picLabel);
		var useVis = (CluesView.namesVisible) ? "visible" : "hidden";
		$(picLabel).css("visibility", useVis);
		/**/
	}

	CluesView.ShowOverlay();
}