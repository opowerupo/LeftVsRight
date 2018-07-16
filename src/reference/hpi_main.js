// JavaScript Document
var mainImage; // the DOM element
var ImageView; // ^the js class for
var cluePanel; // the DOM element
var CluesView; // ^the js class for

var zoomState = "out";

var curMousePos;

//see ActivityCommon.js

function setupWrapper() {
	activityWrapper = document.getElementById("ActivityWrapper");
	activityHdrBar = document.getElementById("ActivityHdrBar");
	introScreen = document.createElement("div");
	$(introScreen).attr("id", "IntroScreen");
	activityWrapper.appendChild(introScreen);
	mainImage = document.getElementById("MainImage");
	cluePanel = document.getElementById("CluePanel");
	counter = document.getElementById("Counter");
	hintBtn = document.getElementById("HintBtn");
	zoomBtn = document.getElementById("ZoomBtn");
	sfxBtn = document.createElement("div");
	$(sfxBtn).attr("id", "SFXBtn");
	activityWrapper.appendChild(sfxBtn);
}

function loadGlobalData() {
	//DEV NOTE: assetPath may be set in the serving page's javascript, as in the drupal-based config
	if (this.assetPath == undefined) {
		var tmpArry = window.location.pathname.split("/");
		var useContext = ""
		for (var i = 0; i < tmpArry.length - 1; i++) {
			useContext += tmpArry[i] + "/";
		}
		assetPath = useContext;
	}

	//DEV NOTE: instanceID may be set in the serving page's javascript, as in the drupal-based config
	if (this.instanceID == undefined) {
		instanceID = Utility.GetQueryString()["instance_id"];
	}
	instance_root = assetPath + "_instances/" + instanceID + "/";
	//Utility.Log('instance_root: ' + instance_root);

	var GameBase = "hpi_global.xml";
	switch (this.language) {
		case "french":
			{
				GameBase = "hpi_global_fr.xml";
				break;
			}
		case "spanish":
			{
				GameBase = "hpi_global_esp.xml";
				break;
			}
		case "chinese-simplified":
			{
				GameBase = "hpi_global_zh-hans.xml";
				break;
			}
		case "chinese-traditional":
			{
				GameBase = "hpi_global_zh-hant.xml";
				break;
			}
	}

	$("body").addClass(this.language);

	GlobalData.GetXml(game_base_path + "HPI/" + GameBase, function() {
		images_root = game_base_path + 'HPI/' + GlobalData.images_dir;
		audio_root = game_base_path + 'HPI/' + GlobalData.audio_dir;
		GlobalData.audio_dir = audio_root;
		i_images_root = instance_root + GlobalData.images_dir;
		i_audio_root = instance_root + GlobalData.audio_dir;
		i_data_root = instance_root + "xml/";
		setupAudio();

		activityWidth = GlobalData.activityWidth;
		activityHeight = GlobalData.activityHeight;

		/*Mobilize Cloud
		$(activityWrapper).css("width", activityWidth);
        $(activityWrapper).css("height", activityHeight);
        */

		Utility.FadeIn(activityWrapper);
		Utility.FadeIn(activityHdrBar);

		countDir = GlobalData.timer.count_dir;

		loadInstanceData();
		/**/
	});
}

function loadInstanceData() {
	instanceXMLPath = i_data_root + instanceID + ".xml";
	//instanceJSONPath = instanceAssetURI ? instanceAssetURI : '/389.json';
	InstanceData.GetXml(instanceXMLPath, function() {
		var useMaxTime = (maxTime) ? maxTime : InstanceData.num_seconds;
		numSecondsPerRound = (timedPlay()) ? useMaxTime : untimedMaxSeconds;
		//in hpi there are no 'rounds' fewer than the total num of hidden objects, at least not for v1.0
		numItemsTotal = InstanceData.hiddenObjects.length;

		displayW = GlobalData.hpi_mainImg.width;
		displayH = GlobalData.hpi_mainImg.height;

		IntroScreenView.CreateNew(introScreen);

	});
}

function onIntroScreenViewRemoved() {
	if (introScreen) activityWrapper.removeChild(introScreen); //anim complete
	setupTimer();
	//Utility.Log('InstanceData.showQuit: '+InstanceData.showQuit);
	if (InstanceData.showQuit === true) {
		setupQuit(); // consult the instance data is loaded to inform display (or not) of quit
	}
	//startRound(); <-- scene may not be loaded yet... wait!

	Utility.FadeIn(activityHdrBar);
	Utility.InitLoadingAnim(activityWrapper);

	ImageView.CreateNew(GlobalData.hpi_mainImg, InstanceData.hpi_illo_bw, InstanceData.hpi_illo_col, InstanceData.hiddenObjects, mainImage);
}

function setupTimer() {
	countDir = GlobalData.timer.count_dir;

	if (beatTheClock) {
		var timer_time = document.getElementById("Timer_time");
		clearTimerDisplay();
		showTimer(true);
	}
}

function clearTimerDisplay() {
	if (!beatTheClock) return;
	var timer_time = document.getElementById("Timer_time");
	timer_time.innerHTML = "00:00"; //(Utility.True(timedPlay())) ? "00:00":"";
}

function onMainImageLoaded() {
	var useX = GlobalData.hpi_mainImg.x;
	/*var useY =  activityHeight-(displayH+parseInt($(counter).css("height")));
	//halve the difference, giving more padding to the bottom for gravity's sake
	/useY = useY/2.2;
	*/
	var activityHdrBar = document.getElementById("ActivityHdrBar"); //<< Because we are using relative positioning, and the default Y pos of the main image will be the height of the header element, the top margin for the mainImage element will almost certainly need to be a negative (offset) value.
	//useY = useY-parseInt($(activityHdrBar).css("height"));


	/*Mobilize Cloud
    $(mainImage).css("margin-left", useX + "px");
	$(mainImage).css("width", displayW+"px");
	$(mainImage).css("height", displayH+"px");
    */

	setupCounter();

	//var useY =  parseInt($(mainImage).css("margin-top"));
	//$(cluePanel).css("margin-top", useY+"px");
	/*Mobilize Cloud
	$(cluePanel).css("width", (activityWidth-GlobalData.hpi_cluePanel.x+"px"));
	$(cluePanel).css("height", displayH+"px");
    */
	CluesView.CreateNew(InstanceData.hiddenObjects, GlobalData.hpi_cluePanel);
	Responsive.SetupMobileClues(InstanceData.hiddenObjects, GlobalData.hpi_cluePanel);


	ImageView.CreateHotspots();
}

function onMainImageAndHotsLoaded() {
	Utility.RemoveLoadingAnim();
	setupHint();
	setupZoom();
	ImageView.CreateSpotMask();
	startRound();
	Responsive.Setup();
}

function startRound() {
	resetRound();

	startTime = new Date();
	Utility.UpdateGameTime();
	endTime = (startTime.getTime() + (numSecondsPerRound * 1000));
	gameTimer = setInterval(Utility.UpdateGameTime, 1000);

	enableInteractivity(true);
}

function setupCounter() {
	var useX = GlobalData.hpi_mainImg.x + (displayW - counter.offsetWidth) / 2;
	//$(counter).css("margin-left", useX+"px");
	$(counter).animate({
		opacity: 1,
	}, 100, function() { //anim complete
	});

	updateCounter();
}

function updateCounter() {
	counter.innerHTML = '<span class="ctr_found">' + GlobalData.counter.found_txt + ' </span><span class="ctr_numFound">' + numItemsFound.toString() + '</span><span class="ctr_of"> ' + GlobalData.counter.of_txt + ' </span><span class="ctr_total">' + numItemsTotal.toString() + '</span>';
}

function enableInteractivity(enableIt) {
	if (enableIt) {
		$(hintBtn).mouseup(function(evt) {
			onHintBtn();
		});
		$(zoomBtn).mouseup(function(evt) {
			onZoomToggle("in");
		});
		$(sfxBtn).mouseup(function(evt) {
			onSFXToggle();
		});

	} else {
		$(hintBtn).unbind('mouseup');
		$(sfxBtn).unbind('mouseup');

		ImageView.StopDrag();
		$(zoomBtn).unbind('mouseup');
		allowDragMain(false)
	}

	ImageView.EnableInteractivity(enableIt);
}

function setupHint() {
	positionHdrBtn(hintBtn);
	hintBtn.innerHTML = "<img src='/game-engines/HPI/images/HPI_hintMagnify.png'/><span class='HintText'>" + GlobalData.header_btns.hint_txt + "</span>";

	Utility.FadeIn(hintBtn);
}

function setupZoom() {
	positionHdrBtn(zoomBtn);
	$(zoomBtn).addClass("zoomedOut");

	ImageView.ResetCurImgPos();

	Utility.FadeIn(zoomBtn);
}

function positionHdrBtn(btnID) {
	return; //defer to css...
	/*
	var useX = activityWidth-(parseInt($(btnID).css("width"))+parseInt($(btnID).css("margin-right")));
	$(btnID).css("top", "0px");
	$(btnID).css("left", useX+"px");
	*/
}

function getRandomUnfoundHO() {
	var unfoundHOs = new Array();
	var hotspot;
	for (var h = 0; h < ImageView.hotspotClips.length; h++) {
		hotspot = ImageView.hotspotClips[h]
		if (!Utility.True($(hotspot).attr("found"))) {
			unfoundHOs.push(hotspot);
		}
	}

	if (unfoundHOs.length) {
		unfoundHOs = Utility.Shuffle(unfoundHOs);
		return parseInt($(unfoundHOs[0]).attr("ind"));
	}
	return null;
}

function onHintBtn() {
	if (cur_targetItemInd == null) {
		cur_targetItemInd = getRandomUnfoundHO();
		if (cur_targetItemInd == null) return;
	}

	var useMinScale = defaultScale - .22;
	var useMaxScale = ImageView.maxScale + .3;
	var scaleDiff = (useMaxScale - useMinScale) / (maxHintCount - 1);
	var scalePts = [useMaxScale, Number(useMaxScale - scaleDiff), useMinScale];
	//var curScale:Number = ImageView.container_mc.scaleX;

	var useX;
	var useY;

	var hs = ImageView.hotspotsData[cur_targetItemInd];
	//Utility.Log(parseInt(cur_targetItemInd));// failures on parsing '08' to 8 and '09' to 9, though other leading zero iIDs parsed correctly...: http://stackoverflow.com/questions/850341/workarounds-for-javascript-parseint-octal-bug
	//Utility.Log(" hs.iID: "+hs.iID+" , hs.img: "+hs.img);
	//Utility.Log(" hs.x: "+hs.x+" , hs.y: "+hs.y);
	//Utility.Log("hintCount: "+hintCount);
	if (hintCount == 0) {
		ImageView.AddSpotMask();
	}

	if (hintCount < maxHintCount) {
		hintScale = scalePts[hintCount];
		hintCount++;
	} else {
		hintScale = (ImageView.spotMask.scaleX == scalePts[maxHintCount - 1]) ? scalePts[maxHintCount - 1] - .05 : scalePts[maxHintCount - 1];
	}

	ImageView.PositionSpotMask(hs, hintScale);
}

function resetHint_item() {
	hintCount = 0;
	ImageView.FadeoutSpotMask();
	cur_targetItemInd = (CluesView.selectedObjectIndex != null) ? CluesView.selectedObjectIndex : null;
}

function resetHint_round() {
	hintCount_round = 0;
}


function onZoomToggle(dir) {
	if (zoomState == "in") {
		// If zoomed in, now zoom out
		if ($(zoomBtn).hasClass("zoomedIn")) {
			$(zoomBtn).removeClass("zoomedIn")
		}
		$(zoomBtn).addClass("zoomedOut");
		zoomState = "out";

		ImageView.StartZoom("out");
		allowDragMain(false);
	} else {
		// If zoomed out, now zoom in
		if ($(zoomBtn).hasClass("zoomedOut")) {
			$(zoomBtn).removeClass("zoomedOut")
		}
		$(zoomBtn).addClass("zoomedIn");
		zoomState = "in";

		ImageView.StartZoom("in");
		allowDragMain(true);
	}
}

function allowDragMain(allowIt) {
	if (allowIt) {
		if (iTouch || android) {
			$(mainImage).bind('touchstart', function(evt) {
				curMousePos = Utility.GetMousePosition(evt);
				$(document).bind('touchmove', function(evt) {
					ImageView.dragging = true;
					curMousePos = Utility.GetMousePosition(evt);
				});
				ImageView.StartDrag(evt);
				$(document).bind('touchend', function(evt) {
					ImageView.StopDrag();
					$(document).unbind('touchstart');
					$(document).unbind('touchmove');
				});

			});
			// prevent elastic scrolling on iOS
			$(mainImage).bind('touchmove', function(event) {
				event.preventDefault();
			}, false); // end body:touchmove


		} else {
			$(mainImage).mousedown(function(evt) {
				curMousePos = Utility.GetMousePosition(evt);
				$(document).mousemove(function(evt) {
					ImageView.dragging = true;
					curMousePos = Utility.GetMousePosition(evt);
				});
				ImageView.StartDrag(evt);
				$(document).mouseup(function(evt) {
					ImageView.StopDrag();
					$(document).unbind('mouseup');
					$(document).unbind('mousemove');
				});
			});
		}

	} else {
		ImageView.ResetCurImgPos();
		if (iTouch || android) {
			$(mainImage).unbind('touchstart');
			$(document).unbind('touchend');
			$(document).unbind('touchmove');
			$(mainImage).unbind('touchmove');
		} else {
			$(mainImage).unbind('mousedown');
			$(document).unbind('mouseup');
			$(document).unbind('mousemove');
		}
	}

}

//注册找到的item
function registerItemFound(hotspotCanv) {
	hotspotCanv.attr("found", true);
	CluesView.RegisterItemFound(hotspotCanv.attr("ind"));
	Responsive.RegisterItemFound(hotspotCanv.attr("ind"));
	triggerPlaySFX(sfx_correct);
	numItemsFound++;
	updateCounter();
	hintCount_round += hintCount;

	if (numItemsFound == numItemsTotal) {
		finishRound();
		celebrateWin();
	}
	resetHint_item();
}

function resetRound() {
	numItemsFound = 0;

	endTime = null;

	resetHint_item();
	resetHint_round();
}

function finishRound() {
	clearInterval(genDelay);
	clearInterval(gameTimer);

	if (zoomState == "in") {
		onZoomToggle("out");
	}

	activityComplete = true;
	enableInteractivity(false);
}

function onTimeUp() {
	//Utility.Log("time up!");
	finishRound();
	triggerPlaySFX(sfx_ding);

	//DEV NOTE determine how to conclude the activity
	if (typeof onCompleteURL !== "undefined" && onCompleteURL) {
		restoreWWUSA(false); //DEV NOTE - ending screen etc per WWUSA
	} else {
		Utility.Log("HPI_Main.js function onTimeUp(): show suitable ending screen, or redirect");
	}
}

function timedPlay() {
	if (beatTheClock) {
		return true;
	}
	return false;
}

function celebrateWin() {
	//Utility.Log("YOU WIN!!!");
	ImageView.LoadMainReveal();

	var useSFX;
	if (Math.random() > .5) {
		useSFX = sfx_win1;
	} else {
		useSFX = sfx_win2;
	}
	triggerPlaySFX(useSFX);

	//DEV NOTE determine how to conclude the activity
	if (typeof onCompleteURL !== "undefined" && onCompleteURL) {
		restoreWWUSA(true); //DEV NOTE - ending screen etc per WWUSA
	} else {
		Utility.Log("HPI_Main.js function celebrateWin(): show suitable ending screen, or redirect");
	}
}

function adjustForResize() {
	positionHdrBtn("hint");
	positionHdrBtn("zoom");
}