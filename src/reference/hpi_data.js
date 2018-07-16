var GlobalData = {};

GlobalData.GetXml = function(sFilePath, callback) {
	ActivityCommon.GetData(sFilePath, 'xml', GlobalData.ParseData, callback); //logic migrated to ActivityCommon.js for better maintainability
};

GlobalData.ParseData = function(data, callback) {
	/*
	GlobalData.hpi_display_title;
	GlobalData.hpi_byline;
	*/
	GlobalData.activityWidth = parseInt($(data).find("hpis_global_settings").find("activity_wrapper").find("width").text());
	GlobalData.activityHeight = parseInt($(data).find("hpis_global_settings").find("activity_wrapper").find("height").text());

	GlobalData.introScreen = new Object();
	GlobalData.introScreen.activity_title = $(data).find("hpis_global_settings").find("intro_screen").find("activity_title").text();

	GlobalData.counter = new Object();
	GlobalData.counter.found_txt = $(data).find("hpis_global_settings").find("counter").find("found_txt").text();
	GlobalData.counter.of_txt = $(data).find("hpis_global_settings").find("counter").find("of_txt").text();
	GlobalData.timer = new Object();
	GlobalData.timer.timer_txt = $(data).find("hpis_global_settings").find("timer").find("timer_txt").text();
	GlobalData.timer.timer_ind = $(data).find("hpis_global_settings").find("timer").find("timer_ind").text();
	GlobalData.timer.count_dir = $(data).find("hpis_global_settings").find("timer").find("count_dir").text();

	GlobalData.header_btns = new Object();
	GlobalData.header_btns.hint_txt = $(data).find("hpis_global_settings").find("header_btns").find("hint_txt").text();
	GlobalData.header_btns.zoom_txt = $(data).find("hpis_global_settings").find("header_btns").find("zoom_txt").text();

	var tmpArry = $(data).find("hpis_global_settings").find("main_illustration").find("position").text().split(", ");
	GlobalData.hpi_mainImg = new Object();
	GlobalData.hpi_mainImg.x = parseInt(tmpArry[0]);
	GlobalData.hpi_mainImg.y = parseInt(tmpArry[1]);
	GlobalData.hpi_mainImg.padding = parseInt($(data).find("hpis_global_settings").find("main_illustration").find("padding").text());
	GlobalData.hpi_mainImg.maxScale = parseInt($(data).find("hpis_global_settings").find("main_illustration").find("maxScale").text());

	GlobalData.spotMask = $(data).find("hpis_global_settings").find("spot_mask").text();
	//console.log( 'GlobalData.spotMask = ' + GlobalData.spotMask);

	var tmpArry = $(data).find("hpis_global_settings").find("clue_panel").find("position").text().split(", ");
	GlobalData.hpi_cluePanel = new Object();
	GlobalData.hpi_cluePanel.names_selector_txt = $(data).find("hpis_global_settings").find("clue_panel").find("names_selector_txt").text();
	GlobalData.hpi_cluePanel.pics_selector_txt = $(data).find("hpis_global_settings").find("clue_panel").find("pics_selector_txt").text();
	GlobalData.hpi_cluePanel.instr_txt = $(data).find("hpis_global_settings").find("clue_panel").find("instr_txt").text();
	GlobalData.hpi_cluePanel.x = parseInt(tmpArry[0]);
	GlobalData.hpi_cluePanel.y = parseInt(tmpArry[1]);
	GlobalData.hpi_cluePanel.picClipTotalWidth = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("picClipTotalWidth").text());
	GlobalData.hpi_cluePanel.picClipTotalHeight = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("picClipTotalHeight").text());
	GlobalData.hpi_cluePanel.picClipImgWidth = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("picClipImgWidth").text());
	GlobalData.hpi_cluePanel.picClipImgHeight = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("picClipImgHeight").text());
	GlobalData.hpi_cluePanel.picClipImgMobileWidth = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("picClipImgMobileWidth").text());
	GlobalData.hpi_cluePanel.picClipImgMobileHeight = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("picClipImgMobileHeight").text());
	GlobalData.hpi_cluePanel.nameClipMarginLeft = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("nameClipMarginLeft").text());
	GlobalData.hpi_cluePanel.nameClipHeight = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("nameClipHeight").text());
	GlobalData.hpi_cluePanel.maxRows = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("maxRows").text());
	GlobalData.hpi_cluePanel.maxCols = parseInt($(data).find("hpis_global_settings").find("clue_panel").find("maxCols").text());

	GlobalData.images_dir = $(data).find("hpis_global_settings").find("images_dir").text();
	//console.log('GlobalData.images_dir ' + GlobalData.images_dir);
	GlobalData.audio_dir = $(data).find("hpis_global_settings").find("audio_dir").text();
	GlobalData.printRoot_bw = $(data).find("hpis_global_settings").find("printables").find("print_bw").text();
	GlobalData.printRoot_col = $(data).find("hpis_global_settings").find("printables").find("print_color").text();

	GlobalData.soundEfx = new Array();
	$(data).find("hpis_global_settings").find("sound_effects").find("sound_effect").each(function() {
		GlobalData.soundEfx[$(this).find("sfx_type").text()] = $(this).find("sfx_filename").text();
	});

	callback();
}

var InstanceData = {};

InstanceData.GetXml = function(sFilePath, callback) {
	ActivityCommon.GetData(sFilePath, 'xml', InstanceData.ParseData, callback); //logic migrated to ActivityCommon.js for better maintainability
};

InstanceData.GetJson = function(sFilePath, callback) {
	ActivityCommon.GetData(sFilePath, 'json', InstanceData.ParseJson, callback); //logic migrated to ActivityCommon.js for better maintainability
};

InstanceData.ParseData = function(data, callback) {
	InstanceData.num_seconds = parseInt($(data).find("nodes").attr("numSeconds"));

	InstanceData.introScreen = new Object();
	InstanceData.introScreen.activity_desc = $(data).find("introTxt").text();

	var firstNode = $(data).find("nodes").find("node").get(0);

	/*
	InstanceData.hpi_title_txt = $(firstNode).find("HPI_Display_Title").text();
	InstanceData.hpi_byline_txt = $(firstNode).find("Byline").text();
	*/

	//console.log('i_images_root' + ' ' + i_images_root);


	InstanceData.hpi_illo_bw = i_images_root + $(firstNode).find("BnW_Illustration_Name").text();
	InstanceData.hpi_illo_col = i_images_root + $(firstNode).find("Color_Illustration_Name").text();

	InstanceData.hiddenObjects = new Array();
	var hoObj;
	var tmpArry;
	var ind = 0;
	$(data).find("nodes").find("node").each(function() {
		hoObj = new Object();
		hoObj.img_bw = i_images_root + $(this).find("HO_BnW_Image_Name").text();
		hoObj.img_col = i_images_root + $(this).find("HO_Color_Image_Name").text();
		tmpArry = $(this).find("HO_Position").text().split(", ");
		hoObj.x = parseInt(tmpArry[0]);
		hoObj.y = parseInt(tmpArry[1]);
		hoObj.responsive_x = parseInt(tmpArry[0]);
		hoObj.responsive_y = parseInt(tmpArry[1]);
		hoObj.x_reveal = "";
		hoObj.y_reveal = "";
		if ($(this).find("HO_Position_Reveal").text() != "") {
			//alert($(this).find("HO_Position_Reveal").text());
			tmpArry = $(this).find("HO_Position_Reveal").text().split(", ");
			hoObj.x_reveal = parseInt(tmpArry[0]);
			hoObj.y_reveal = parseInt(tmpArry[1]);
		}
		if ($(this).find("HO_Rotation")) {
			hoObj.rotation = Number($(this).find("HO_Rotation").text());
		} else {
			hoObj.rotation = 0;
		}
		hoObj.word_txt = $(this).find("Word").text();
		hoObj.hoIndex = ind;
		InstanceData.hiddenObjects.push(hoObj);
		//alert("hoObj.word_txt: "+hoObj.word_txt);
		ind++;

	});
	//alert("InstanceData.hiddenObjects.length: "+InstanceData.hiddenObjects.length);

	callback();
}


InstanceData.ParseJson = function(data, callback) {
	InstanceData.num_seconds = 0;

	InstanceData.introScreen = new Object();
	InstanceData.introScreen.activity_desc = "";
	if (data.field_act_intro_text.und) {
		if (data.field_act_intro_text.und[0]) {
			InstanceData.introScreen.activity_desc = data.field_act_intro_text.und[0]['value'];
		}
	}
	InstanceData.introScreen.activity_icon = "";
	if (data.field_act_intro_graphic.und) {
		if (data.field_act_intro_graphic.und[0]) {
			InstanceData.introScreen.activity_icon = data.field_act_intro_graphic.und[0].uri;
		}
	}

	InstanceData.hpi_illo_bw = data.field_act_hp_main_image_init.und[0].uri;
	InstanceData.hpi_illo_col = data.field_act_hp_main_image_reveal.und[0].uri;

	InstanceData.hiddenObjects = new Array();
	var hoObj;
	var tmpArry;
	var ind = 0;
	var fieldArray = data.field_act_hp_targets
	for (var i in fieldArray) {
		hoObj = new Object();
		hoObj.img_bw = fieldArray[i].field_hp_target_image_hidden.und[0].uri;
		hoObj.img_col = fieldArray[i].field_hp_target_image_reveal.und[0].uri;

		tmpArry = fieldArray[i].field_hp_target_position_hidden.und[0].value.split(',');
		hoObj.x = parseInt(tmpArry[0]);
		hoObj.y = parseInt(tmpArry[1]);
		hoObj.responsive_x = parseInt(tmpArry[0]);
		hoObj.responsive_y = parseInt(tmpArry[1]);
		hoObj.x_reveal = "";
		hoObj.y_reveal = "";
		if (fieldArray[i].field_hp_target_position_reveal.uri) {
			tmpArry = fieldArray[i].field_hp_target_position_reveal.und[0].value.split(',');
			hoObj.x_reveal = parseInt(tmpArry[0]);
			hoObj.y_reveal = parseInt(tmpArry[1]);
		}
		if (fieldArray[i].field_hp_target_rotation.und) {
			hoObj.rotation = Number(fieldArray[i].field_hp_target_rotation.und[0].value);
		} else {
			hoObj.rotation = 0;
		}
		hoObj.word_txt = fieldArray[i].field_hp_target_name.und[0].value;
		hoObj.hoIndex = ind;
		InstanceData.hiddenObjects.push(hoObj);
		ind++;
	}

	parseKeyValueOverrides(data); //ActivityCommon.js
	callback();
}