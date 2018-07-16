/**
 * Created by wh_mac on 18/6/21.
 */
var Utility={};
Utility.timestampUsed;
Utility.timestampRemaining;

Utility.GetXml = function(sFilePath, callback){
  //SET CRITICAL PARAMETERS HERE TO MITIGATE REDUNDANCY IN THE ERROR HANDLING
  var useASync = false;
  var useEndpoint = sFilePath;
  var useOperation = 'GET';
  var useDatatype = (jQuery.browser.msie) ? 'text' : 'xml';
  var useSuccessFunction = callback;
  $.ajax({
    async: useASync,
    type: useOperation,
    url: useEndpoint,
    dataType: useDatatype,
    success: function(data){
      oData=Utility.GetSupportableFormat(data);
      return useSuccessFunction(oData);
    },
    error: function(xhr, status, error) {
      // jQuery.ajax() regards 302 redirect as an error condition
      // CAS SSO's "gateway" feature redirects browser to SSO site on fresh
      // session start.. a second ajax call is not redirected.
      //
      // if at first you don't succeed, try try again
      $.ajax( {
        async: useASync,
        type: useOperation,
        url: useEndpoint,
        dataType: useDatatype,
        success: function(data) {
          oData=Utility.GetSupportableFormat(data);
          return useSuccessFunction(oData);
        },
        error: function(xhr, status, error) {
          // if you still fail, sulk
          oData=null;
          Utility.Log("ERROR: ", xhr, xhr.status, xhr.getAllResponseHeaders());
        }
      });
    }
  });
  return oData;

};

Utility.GetHtml = function(sFilePath,callback){
  var oData;
  $.ajax({
    async: false,
    type: 'GET',
    url: sFilePath,
    dataType: 'html',
    success: function(data){
      oData=data;
      return callback(oData);
    },
    error: function(){
      oData=null;
    }
  });

  return oData;
};

Utility.GetSupportableFormat = function(data){
  var xml;
  if ( typeof data == 'string') {
    xml = new ActiveXObject( 'Microsoft.XMLDOM');
    xml.async = false;
    xml.loadXML( data);
  } else {
    xml = data;
  }
  return xml;
};

Utility.GetCDATA = function(ContentNode){
  var data;
  if($.browser.msie) data=ContentNode[0].text;
  else data=ContentNode[0].textContent;
  return data;
}

Utility.GetQueryString = function() {
  //USE: // var myParam = GetQueryString()["myParam"];
  var result = {}, queryString = location.search.substring(1),
    re = /([^&=]+)=([^&]*)/g, m;

  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  return result;
}

Utility.AssignUnpackedCSS = function(cssBlock, element){
  Utility.Log("Utility.AssignUnpackedCSS()");
  var cssRules = cssBlock.split("; ");
  var cssRule;
  for (var i=0; i<cssRules.length; i++){
    cssRule = cssRules[i].split(":");
    Utility.Log("	"+cssRule[0]+": "+cssRule[1]);
    $(element).css(cssRule[0], cssRule[1]);
  }
}

Utility.Shuffle = function( arrayToShuffle ){
  var a;
  var b;
  for(var i = 0; i < arrayToShuffle.length; i++){
    a = arrayToShuffle[i];
    b = parseInt(Math.random()* arrayToShuffle.length);
    //alert(b);
    arrayToShuffle[i] = arrayToShuffle[b];
    arrayToShuffle[b] = a;
  }

  return arrayToShuffle;
}

Utility.UpdateGameTime = function(){

  var now = new Date();
  var timeUsed;
  var timeLeft;

  //alert("endTime: "+endTime);
  if (endTime){
    timeLeft = endTime - now.getTime();
    //alert(".timeLeft: "+timeLeft);
  }else{
    if (numSecondsPerRound){
      timeLeft = numSecondsPerRound*1000;
      //alert("..numSecondsPerRound: "+numSecondsPerRound);
      //alert("..timeLeft: "+timeLeft);
    }
  }

  if (startTime){
    timeUsed = now.getTime() - startTime;
  }

  //Converting the remaining time into seconds, minutes, hours, and days
  var secondsRemaining = Math.floor(timeLeft / 1000);
  var minutesRemaining = Math.floor(secondsRemaining / 60);
  //alert("..secondsRemaining: "+secondsRemaining);//alert("..minutesRemaining: "+minutesRemaining);

  //Converting the time used into seconds, minutes, hours, and days
  //var secondsUsed:Number = Math.floor(timeUsed / 1000); // Made this a global var so running Time calc can use it
  secondsUsed = Math.floor(timeUsed / 1000);
  //alert(secondsUsed);
  if (! isNaN(secondsUsed)){
    secondsUsed_raw = secondsUsed_prev + secondsUsed;// because we want secondsUsed_raw as cumulative across internal 'rounds' if applicable
  }

  minutesUsed = Math.floor(secondsUsed / 60);

  //Storing the remainder of this division problem
  secondsUsed %= 60;
  secondsUsed += 1;
  minutesUsed %= 60;

  //Storing the remainder of this division problem
  secondsRemaining %= 60;
  minutesRemaining %= 60;
  //alert("....secondsRemaining: "+secondsRemaining);	//alert("....minutesRemaining: "+minutesRemaining);

  //in some difficult-to-reproduce cases, values of -1 were presenting
  if (sec_r < 0) sec_r = 0;
  if (min_r < 0) min_r = 0;

  //Converting numerical values into strings so that
  //we string all of these numbers together for the display
  var sec_r = secondsRemaining.toString();
  var min_r = minutesRemaining.toString();


  //Setting up a few restrictions for when the current time reaches a single digit
  if (sec_r.length < 2) {
    sec_r = "0" + sec_r;
  }

  var timestampRemaining = Utility.timestampRemaining = min_r+":"+sec_r;

  if (minutesUsed > 99){
    clearInterval(gameTimer);// or roundTimer ?
  }

  //Converting numerical values into strings so that
  //we string all of these numbers together for the display
  var useSecUsed = secondsUsed;
  var useMinUsed = minutesUsed;
  if (useSecUsed == 60){
    useSecUsed = 0;
    useMinUsed += 1;
  }
  var sec_u = useSecUsed.toString();
  var min_u = useMinUsed.toString();

  if (min_u.length < 2) {
    min_u = "0" + min_u;
  }
  if (sec_u.length < 2) {
    sec_u = "0" + sec_u;
  }
  var timestampUsed = Utility.timestampUsed = min_u+":"+sec_u;

  if (countDir == "up"){
    document.getElementById("Timer_time").innerHTML = timestampUsed;
  }else{
    //alert("minutesRemaining: "+minutesRemaining+", secondsRemaining: "+secondsRemaining);
    document.getElementById("Timer_time").innerHTML = timestampRemaining;
    if ((minutesRemaining <= 0) && (secondsRemaining <= 0) && (timedPlay())){
      onTimeUp();
    }

  }


}

Utility.FadeOut = function(element){
  $(element).animate({
    opacity:0}, 500, function() {//anim complete
  });
}
Utility.FadeIn = function(element, duration){
  if (! duration) duration = 500;
  $(element).animate({
    opacity:1}, duration, function() {//anim complete
  });
}

Utility.Rotate = function(element, rotAmt){
  //REVISIT CROSS BROWSER SUPPORT
  $(element).css({
    '-webkit-transform' : 'rotate('+rotAmt+'deg)',
    '-moz-transform' : 'rotate('+rotAmt+'deg)',
    '-ms-transform' : 'rotate('+rotAmt+'deg)',
    'msTransform' : 'rotate('+rotAmt+'deg)',
    '-o-transform' : 'rotate('+rotAmt+'deg)',
    'transform' : 'rotate('+rotAmt+'deg)',
    'zoom' : 1

  });
  /*
   $(element).css('msTransform','rotate('+rotAmt+'deg)');// added above because IE9 can't digest -ms-transform (hyphenated syntax) via jquery even though it can in static inline styling...
   */
}

Utility.GetAngle = function(ms, ctr) {
  //Utility.Log("GetAngle("+ms+", "+ctr+")");
  //Utility.Log("	mouse x: "+ms.x+", y: "+ms.y);
  //Utility.Log("	center x: "+ctr.x+", y: "+ctr.y);
  var x     = ms.x - ctr.x,
    y     = - ms.y + ctr.y,
    hyp   = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
    angle = Math.acos(x / hyp);

  //Utility.Log("	x: "+x+", y: "+y);

  if (y > 0) {
    angle = 2 * Math.PI - angle;
  }
  if (x < 0) {
    //angle = 2 * Math.PI - angle;
  }

  return angle;
}

Utility.RadToDeg = function(r) {
  return (r * (180 / Math.PI));
};

Utility.GetSlope = function(a, b) {
  return (b.y - a.y) / (b.x - a.x);
};

Utility.PointInTriangle = function (px,py,ax,ay,bx,by,cx,cy){
//credit: http://www.blackpawn.com/texts/pointinpoly/default.html
  var v0 = [cx-ax,cy-ay];
  var v1 = [bx-ax,by-ay];
  var v2 = [px-ax,py-ay];

  var dot00 = (v0[0]*v0[0]) + (v0[1]*v0[1]);
  var dot01 = (v0[0]*v1[0]) + (v0[1]*v1[1]);
  var dot02 = (v0[0]*v2[0]) + (v0[1]*v2[1]);
  var dot11 = (v1[0]*v1[0]) + (v1[1]*v1[1]);
  var dot12 = (v1[0]*v2[0]) + (v1[1]*v2[1]);

  var invDenom = 1/ (dot00 * dot11 - dot01 * dot01);

  var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return ((u >= 0) && (v >= 0) && (u + v < 1));
}


Utility.GetHighestChildDepth = function(parentElement){
  var depth = -9999;
  var childDepth;
  //uses jQuery bc z-index is inconsistently implemented across browsers...
  for (var i=0; i<parentElement.children.length; i++){
    childDepth = parseInt($(parentElement.children[i]).css("z-index"));
    if (childDepth >= depth){
      depth = childDepth;
    }
  }
  return depth;
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
Utility.detectIE = function() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > -1) {
    // IE 10 or older => return version number
    //return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    return true;
  }

  var trident = ua.indexOf('Trident/');
  if (trident > -1) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    //return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    return true;
  }

  var edge = ua.indexOf('Edge/');
  if (edge > -1) {
    // IE 12 => return version number
    //return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    return true;
  }

  // other browser
  return false;
}

var isWindows = navigator.platform.toUpperCase().indexOf('WIN')!==-1;
var isIE = Utility.detectIE();
var isFF = !(window.mozInnerScreenX == null);

var lastKnownPos;
Utility.GetMousePosition = function(evt) {
  var _x;
  var _y;
  if ((iTouch || android) && (evt.type != 'mouseup')){
    var touches = (iTouch) ? evt.originalEvent.changedTouches:evt.originalEvent.touches ;//REVISIT if/when jquery touch handlers are no longer used

    if (touches.length == 0){
      //android reports this on touchend; using lastKnownPos addresses the 0-length touches array android triggers on touchend, so that in the case of a touch-drag, the last known pos will be used (lastKnownPos will properly be null for a simple tap)
      if (lastKnownPos != null){
        return lastKnownPos;
      }
      return null;
    }
    _x = touches[touches.length-1].pageX;
    _y = touches[touches.length-1].pageY;
  }else{
    _x = evt.originalEvent.pageX;
    _y = evt.originalEvent.pageY;
  }

  posX = _x;
  posY = _y;
  var  pos=Array(posX,posY);
  lastKnownPos = pos;
  return pos;
}

Utility.True = function(val){
  if ( (val == true) || (val == "true") ) return true;
  return false;
}

Utility.IsNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utility.IsUndefinedNullOrEmpty = function(val){
  if (typeof val == 'undefined') return true;
  if (val === null) return true;
  if (val == "") return true;
  return false;
}

Utility.SetDevice = function(){
  //alert("navigator.platform: "+navigator.platform);
  if ((navigator.platform == 'iPhone') || (navigator.platform == 'iPod') || (navigator.platform == 'iPad')) {
    iTouch=true;
  }else{
    iTouch=false;
  }
  var ua = navigator.userAgent.toLowerCase();
  android = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");// add check for mobile to distinguish android tablet from android smartphone
}

Utility.Fix_iPadLabels = function () {

  function fix() {
    var labels = document.getElementsByTagName('label'),
      target_id,
      el;
    //alert("labels.length: "+labels.length);
    for (var i = 0; labels[i]; i++) {
      //alert("labels[i].getAttribute('for'): "+labels[i].getAttribute('for'));
      if (labels[i].getAttribute('for')) {
        labels[i].onclick = labelClick;
      }
    }
  };

  function labelClick() {
    el = document.getElementById(this.getAttribute('for'));
    if (['radio', 'checkbox'].indexOf(el.getAttribute('type')) != -1) {
      el.setAttribute('selected', !el.getAttribute('selected'));
    } else {
      el.focus();
    }
  };

  fix();

}

Utility.IsImage = function(srcStr){
  if (srcStr.toLowerCase().indexOf(".png") > -1) return true;
  if (srcStr.toLowerCase().indexOf(".jpg") > -1) return true;
  if (srcStr.toLowerCase().indexOf(".jpeg") > -1) return true;
  if (srcStr.toLowerCase().indexOf(".gif") > -1) return true;
  if (srcStr.toLowerCase().indexOf(".bmp") > -1) return true;
  return false;
}

Utility.Hexc = function(colorval) {
  var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  delete(parts[0]);
  for (var i = 1; i <= 3; ++i) {
    parts[i] = parseInt(parts[i]).toString(16);
    if (parts[i].length == 1) parts[i] = '0' + parts[i];
  }
  return '#' + parts.join('');
}

Number.prototype.toHHMMSS = function() {
  d = this;
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

Utility.RandInRange = function(upperRange, lowerRange){
  return Math.floor(Math.random() * (upperRange - lowerRange + 1)) + lowerRange;
}

Utility.CoinToss = function(){
  return Math.floor( Math.random() * 2 ) == 1;
}

Utility.ArraysEqual = function(arr1, arr2) {
  if(arr1.length !== arr2.length)
    return false;
  for(var i = arr1.length; i--;) {
    if(arr1[i] !== arr2[i])
      return false;
  }

  return true;
}

Utility.FoundInArray = function(array, checkItem) {
  for (var i=0; i<array.length; i++){
    if (array[i] == checkItem){
      return true;
    }
  }
  return false;
}

Utility.EscapeRegExp = function(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
Utility.ReplaceAll = function(string, find, replace) {
  return string.replace(new RegExp(Utility.EscapeRegExp(find), 'g'), replace);
}

Utility.Log = function(output){
  var curURL = window.location.hostname;
  var tmpArry = curURL.split(".");
  //this conditional will work where live-site naming convention leads with 'www' and local/dev/staging sites lead with 'local'/'dev'/'staging'
  if (tmpArry[0].toLowerCase() != "www"){
    if(window.console){
      console.log(output);
    }
  }
}

Utility.LocalStorageSupported = function(){
  try{
    return 'localStorage' in window && window['localStorage'] !== null;
  }catch (e) {
    return false;
  }
}
Utility.CookiesSupported = function(){
  //
}

// Activity Common Code ......................
Utility.IncludeCSSfile = function(href) {
  var head_node = document.getElementsByTagName('head')[0];
  var link_tag = document.createElement('link');
  link_tag.setAttribute('rel', 'stylesheet');
  link_tag.setAttribute('type', 'text/css');
  link_tag.setAttribute('href', href);
  head_node.appendChild(link_tag);
}

Utility.ShowConfirmationModal = function(showIt, message){
  //console.log("Utility.ShowConfirmationModal("+showIt+", "+message+")");
  if (quitConfirmed) return;
  if (showIt){
    ///console.log("	quitConfirmation: "+quitConfirmation);
    quitConfirmed = false;
    if (! quitConfirmation){
      quitConfirmation = document.createElement("div");
      $(quitConfirmation).attr("id", "QuitConfirmation");
      activityWrapper.appendChild(quitConfirmation);
      $(quitConfirmation).css("width", activityWidth);
      $(quitConfirmation).css("height", activityHeight);

      var dialogBox = document.createElement("div");
      $(dialogBox).attr("id", "QC_dialogBox");
      quitConfirmation.appendChild(dialogBox);
      dialogBox.innerHTML = message;

      var respOptions = document.createElement("div");
      $(respOptions).attr("id", "QC_options");
      dialogBox.appendChild(respOptions);

      var yesBtn = document.createElement("div");
      $(yesBtn).attr("id", "QC_yesBtn");
      respOptions.appendChild(yesBtn);
      $(yesBtn).mouseup(function (evt) {
        doQuit();
        quitConfirmed = true;
      });

      var noBtn = document.createElement("div");
      $(noBtn).attr("id", "QC_noBtn");
      respOptions.appendChild(noBtn);
      $(noBtn).mouseup(function (evt) {
        Utility.ShowConfirmationModal(false);
      });
    }else{
      $(quitConfirmation).css("visibility", "visible");
      $(quitConfirmation).css("top", "0px");
    }
  }else{
    $(quitConfirmation).css("visibility", "hidden");
    $(quitConfirmation).css("top", "-1000px");
  }
}

Utility.InitTeamSavingAnim = function(container){
  //console.log("Utility.LoadingAnim("+container+")");
  Utility.CreateWaitLoopAnim(container, "saving...");

}

Utility.InitLoadingAnim = function(container){
  //console.log("Utility.LoadingAnim("+container+")");
  Utility.CreateWaitLoopAnim(container, "loading...");
}

Utility.CreateWaitLoopAnim = function(container, animLabelTxt){
  buildSpinner({ x : 30, y : 30, size : 20, degrees : 30 });

  function buildSpinner(data){
    //console.log("Utility.LoadingAnim() buildSpinner("+data+")");
    var loadingAnimDiv = document.createElement('div');
    var useWidth = 68;
    var useHeight = 80;
    var useX = (activityWidth - useWidth)/2;
    var useY = (activityHeight - useHeight)/2;
    if (animLabelTxt.indexOf("saving") > -1){
      useX = 755;
      useY = 435;
    }
    //console.log("useX: "+useX+", useY: "+useY);
    $(loadingAnimDiv).attr("id", "LoadingAnim");
    $(loadingAnimDiv).css("position", "absolute");
    $(loadingAnimDiv).css("z-index", 4000);
    $(loadingAnimDiv).css("width", useWidth+"px");
    $(loadingAnimDiv).css("height", useHeight+"px");
    $(loadingAnimDiv).css("left", useX+"px");
    $(loadingAnimDiv).css("top", useY+"px");
    container.appendChild(loadingAnimDiv);

    var bg = document.createElement('canvas');
    bg.width = useWidth;
    bg.height = useHeight;
    loadingAnimDiv.appendChild(bg);
    var bgCtx = bg.getContext("2d");
    bgCtx.globalAlpha = 0.75;
    bgCtx.clearRect ( 0, 0, 100, 100 );
    bgCtx.fillStyle = '#fff';
    bgCtx.fillRect(0,0,useWidth,useHeight);

    var canvas = document.createElement('canvas');
    useWidth = 60;
    useHeight = 60;
    canvas.width = useWidth;
    canvas.height = useHeight;
    $(canvas).css("position", "absolute");
    $(canvas).css("top", "4px");
    $(canvas).css("left", "4px");
    loadingAnimDiv.appendChild(canvas);
    var ctx = canvas.getContext("2d"), i = 0, degrees = data.degrees, loops = 0, degreesList = [];

    for (i = 0; i < degrees; i++) {
      degreesList.push(i);
    }

    var label = document.createElement('div');
    $(label).css("position", "absolute");
    $(label).css("top", "62px");
    $(label).css("left", "8px");
    $(label).css("font-family", "'Syntax W01 Bold', Tahoma, sans-serif");
    $(label).css("font-size", "12px");
    $(label).css("color", "#000");
    label.innerHTML = animLabelTxt;
    loadingAnimDiv.appendChild(label);

    // reset
    i = 0;

    // so I can kill it later
    window.canvasTimer = setInterval(draw, 1000/degrees);
    function reset() {
      ctx.clearRect(0,0,100,100); // clear canvas
      var left = degreesList.slice(0, 1);
      var right = degreesList.slice(1, degreesList.length);
      degreesList = right.concat(left);
    }

    function draw() {
      var c, s, e;
      var d = 0;
      if (i == 0) {
        reset();
      }
      ctx.save();
      d = degreesList[i];
      c = Math.floor(255/degrees*i);
      ctx.strokeStyle = 'rgb(' + c + ', ' + c + ', ' + c + ')';
      ctx.lineWidth = data.size;
      ctx.beginPath();
      s = Math.floor(360/degrees*(d));
      e = Math.floor(360/degrees*(d+1)) - 1;
      ctx.arc(data.x, data.y, data.size, (Math.PI/180)*s, (Math.PI/180)*e, false);
      ctx.stroke();
      ctx.restore();
      i++;
      if (i >= degrees) {
        i = 0;
      }
    }
  }
}

Utility.RemoveLoadingAnim = function(){
  clearInterval(window.canvasTimer);
  var loadingAnimDiv = document.getElementById('LoadingAnim');
  $(loadingAnimDiv).css("visible", "hidden");
  $(loadingAnimDiv).css("left", "-200px");
}

//-----------------------------------------------------
// TOUCH CONTROLS
//-----------------------------------------------------

//-----------------------------------------------------
// SOUND CONTROL (for iPad etc)
//-----------------------------------------------------
/*!
 * AudioSprite v1.11
 *
 * Copyright 2011, Johannes Koggdal
 * MIT License
 */
Utility.Log("window: "+window);
(function (window, document, undefined) {
  var isTouch = ("ontouchstart" in window||"createTouch" in document);

  // Constructor for the AudioSprite object
  // usage: var sprite = new AudioSprite("sound.wav", 100);
  // length specified in milliseconds
  var AudioSprite = function (src, numSprites) {
    var _this = this,
      numTracks, i, audio,
      sounds = [], timers = [], sprites = [],
      forceLoad, setSpriteLength;

    numSprites = numSprites || 1;

    // Get specific sprite sizes
    if (numSprites instanceof Array) {
      sprites = numSprites;
      numSprites = sprites.length;
    }

    // Get number of tracks
    // iOS only deals with one track at a time, so we set this to 1 for iOS
    numTracks = isTouch ? 1 : numSprites;


    // Create the audio objects
    for (i = 0; i < numTracks; i++) {
      audio = new Audio();
      audio.autobuffer = true;
      audio.loaded = false;
      audio.src = src;
      audio.load();
      audio.userPaused = false;
      audio.loopSprite = false;

      // Bind event handler to loop the audio when the end is reached
      audio.addEventListener("ended", (function (i, sprite, audio) { return function () {
        if (audio.loopSprite) {
          sprite.play(i);
        }
      }; })(i, _this, audio), false);

      sounds.push(audio);
      timers.push(0);
    }
    this.sounds = sounds;
    this.timers = timers;
    this.sprites = sprites;
    this.numTracks = numTracks;
    this.lastCurrentTime = 0;
    this.totalDiff = 0;
    this.diffs = 0;

    // Set the number of sprites in the current file
    this.numSprites = numSprites;

    // Force the audio to load on iOS
    // This method is called by a touch event, since iOS only loads
    // the audio when it's triggered by a user action
    forceLoad = function () {
      sounds[0].play();
      sounds[0].pause();
      document.removeEventListener("touchstart", forceLoad, true);
    };

    // Bind event handler for iOS to force the audio to load
    document.addEventListener("touchstart", forceLoad, true);
  };
  AudioSprite.prototype = {

    // Plays the audio at the specified position
    play: function (position) {
      var _this = this,
        sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position],
        timer = this.numTracks === 1 ? this.timers[0] : this.timers[position],
        length = sound.duration / this.numSprites * 1000,
        i, sprite;

      // If the audio hasn't loaded yet, try again
      if ((sound.readyState !== 4 && !isTouch && !sound.loaded) || (isTouch && sound.seekable && sound.seekable.length === 0 && !sound.loaded)) {
        return setTimeout(function () {
          _this.play(position);
        }, 10);
      }
      sound.loaded = true;

      // Fill the sprite array if it hasn't been filled yet
      if (this.sprites.length === 0) {
        for (i = 0; i < this.numSprites; i++) {
          this.sprites.push({
            start: i * length,
            length: length
          });
        }
      }
      sprite = this.sprites[position];

      // Only deal with the sprite settings if a position is passed in, and there are more than one sprites
      // If no position is passed in, the whole audio clip will be played until the end
      if (position !== undefined && this.numSprites > 1) {

        // Set the new time for the current sprite, only if the user had not paused it
        if (!sound.userPaused) {
          sound.currentTime = sprite.start / 1000;
          sound.lastStart = sprite.start / 1000;
        }

        sound.play();
        sound.userPaused = false;

        // Set a custom timer that will keep track of the current position and end time
        // This is done to get a more frequent update of the current time,
        // since some browsers, especially Firefox, updates with large intervals
        sound.time = sprite.start;
        sound.timeStart = (new Date()).getTime();
        clearInterval(timer);
        timer = setInterval(function () {
          sound.time = sprite.start + (new Date()).getTime() - sound.timeStart;

          _this.checkTime(position, sprite.start + sprite.length);
        }, 1);
        if (this.numTracks === 1) {
          this.timers[0] = timer;
        } else {
          this.timers[position] = timer;
        }

      } else {

        // Play the full audio file if no position was set
        if (!sound.userPaused) {
          sound.currentTime = 0;
          sound.lastStart = 0;
        }
        sound.play();
        sound.userPaused = false;
      }
    },

    // Pauses the audio
    pause: function (position) {
      var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position];
      sound.pause();
      sound.userPaused = true;
    },

    // Stops the audio and reset the time to the beginning
    stop: function (position) {
      //Utility.Log("STOP! sound.stop()");
      var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position];
      sound.pause();
      sound.currentTime = 0;
      sound.loopSprite = false;
    },

    // Plays the audio and loops when it reaches the end
    loop: function (position) {
      var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position];
      sound.loopSprite = true;
      this.play(position);
    },

    // Checks for the end of the sprite and pauses the audio when it's reached
    checkTime: function (position, endTime) {
      var _this = this,
        sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position],
        timer = this.numTracks === 1 ? this.timers[0] : this.timers[position];

      // Check if the timer is past the end time, and if so, pause the audio
      //Utility.Log("sound.time: "+sound.time);
      //Utility.Log("endTime: "+endTime);
      //Utility.Log("sound.currentTime: "+sound.currentTime);
      //Utility.Log("........");
      if (sound.time >= endTime && sound.currentTime * 1000 >= endTime) {
        clearInterval(timer);
        sound.currentTime = 0;
        sound.pause();

        if (sound.loopSprite) {
          _this.play(position);
        }
      }
    }
  };

  // Constructor for the Sound object
  // usages: var sound = new Sound(sprite, 1);
  //         var sound = new Sound("sound.wav");
  // position specified as an index in the sprite
  var Sound = function (sprite, position) {
    if (typeof sprite === "string") {
      sprite = new AudioSprite(sprite);
      position = 0;
    }
    this.sprite = sprite;
    this.position = position;
  };
  Sound.prototype = {
    play: function () {
      //Utility.Log("Sound.prototype.play()");
      //Utility.Log("	this.sprite.play("+this.position+")");
      this.sprite.play(this.position);
    },
    pause: function () {
      this.sprite.pause(this.position);
    },
    stop: function () {
      this.sprite.stop(this.position);
    },
    loop: function () {
      this.sprite.loop(this.position);
    }
  };

  window.AudioSprite = AudioSprite;
  window.Sound = Sound;

})(window, document);

function createSFXforIOS(audioSrc, durationData){
  //Utility.Log("createSFXforIOS("+audioSrc+", "+durationData+")");
  sprite = new AudioSprite(audioSrc, durationData);
  for (var i=0; i<sfxElements.length; i++){
    sfxElements[i].index = i;
    sfxElements[i].play = function(){
      //Utility.Log("playSFX_"+i+"()");
      sfxElements[this.index].play();
    }
    sfxElements[i].pause = function(){
      sfxElements[this.index].pause();
    }
    sfxElements[i].stop = function(){
      sfxElements[this.index].stop();
    }
    sfxElements[i].loop = function(){
      sfxElements[this.index].loop();
    }
    sfxElements[i] = new Sound(sprite, i);
  }
}

