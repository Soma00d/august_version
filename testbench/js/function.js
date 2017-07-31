$(document).ready(function(){
    
    var ws = new WebSocket("ws://localhost:8100");  
    var dictionary = {};  
    var jsonLog = [];
    //------//
    var lineContainer = $("#content_pretest .line_container");
    var testPoppin = $("#content_pretest .test_poppin");
    var canvasJauge = $(".canvas_jauge");
    
    var joystickTop = $("#jauge_joystick_vertical_top .jauge_remplissage");
    var joystickBot = $("#jauge_joystick_vertical_bot .jauge_remplissage");
    var joystickLeft = $("#jauge_joystick_horizontal_left .jauge_remplissage");
    var joystickRight = $("#jauge_joystick_horizontal_right .jauge_remplissage");
    
    var joystickTop2 = $("#jauge_joystick_vertical_top_2 .jauge_remplissage");
    var joystickBot2 = $("#jauge_joystick_vertical_bot_2 .jauge_remplissage");
    var joystickLeft2 = $("#jauge_joystick_horizontal_left_2 .jauge_remplissage");
    var joystickRight2 = $("#jauge_joystick_horizontal_right_2 .jauge_remplissage");
    
    var joystickTop3 = $("#jauge_joystick_vertical_top_3 .jauge_remplissage");
    var joystickBot3 = $("#jauge_joystick_vertical_bot_3 .jauge_remplissage");
    var joystickLeft3 = $("#jauge_joystick_horizontal_left_3 .jauge_remplissage");
    var joystickRight3 = $("#jauge_joystick_horizontal_right_3 .jauge_remplissage");
    
    //info génériques//    
    var userSSO = "";
    var partNumber = "";
    var serialNumber = "";
    var family_id;
    var sequences = "";
    var familyName = "";
    var familyChoice = "";
    var modelChoice = "";
    
   //Definition des variables globales pour le test final    
    var nameFinalContainer = $("#testfinal_container .name_test_container");
    var symbolNameFinal = $("#testfinal_container #symbol_name_t");
    var descriptionFinal = $("#testfinal_container #description_t");
    var imgFinal = $("#testfinal_container .img_t img");
    var imgFinalBloc = $("#testfinal_container .img_t");
    var timerBloc = $("#testfinal_container .timer_bloc");
    var stopTestBloc = $("#testfinal_container .stop_test_bloc");
    var recapListFinal = $("#testfinal_container #recap_list_t .content_recap");
    var progressBarFinal = $("#testfinal_container #progress_bar_t .percent");
    var progressBarFinalInside = $("#testfinal_container #progress_bar_t .inside_bar");
    
    //Test final fonctionnel
    var finalTestEntries = {};     
    var waitingAction;
    var waitingPressValue;
    var waitingReleaseValue;
    var waitingValue;    
    var indexFinal;
    var maxIndexFinal;
    var intervalGlobal;    
    var currSymbol_name;
    var currType;
    var currDescription;
    var currPhoto_link;
    var currTimer;
    
    //Spybox
    var spyBox = $("#dialog-spybox .content_line");
    var spyBoxDialog = $("#dialog-spybox");
    var lastSpyMsg;
    var operatorID;
    var operatorData;
    
    var isFilter;
    var filterID;
    var filterData;
    
    //Calibration
    var calibrateBt1 = $(".calibrate_bt_1");
    var calibrateBt2 = $(".calibrate_bt_2");
    var calibrateBt3 = $(".calibrate_bt_3");
    var waitCalibResponse = "";
    var finalResponseData;
    
    //get info version
    var bootRelease;
    var FPGARelease;
    var softwareRelease;
    var unicID;
    
    //download firmware
    var arrayOfLines;
    var waitDownloadResponse = "";
    var continueDownload = 0;
    
    
    //-----------------------------------------------------//
    
    var _MODE = "PRETEST";
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// HOMEPAGE REPAIR  /////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //recupération des infos tsui homepage
    $("#send_info_hp").on('click', function(){
        userSSO = ($("#user_sso_input").val());
        partNumber = ($("#part_number_input").val());
        serialNumber = ($("#serial_number_input").val());        
        if(userSSO !== "" && partNumber !== "" && serialNumber !== ""){
            $.ajax({
            url : 'php/api.php?function=get_tsui&param1='+partNumber,
            type : 'GET',
            dataType : 'JSON',
            success: function(data, statut){
                if(data.length == 0){
                    alert("No result found with this part number.")
                }else{
                    familyName = data[0].name;
                    var photo = data[0].photo_link;
                    sequences = data[0].linked_sequence;
                    family_id = data[0].family;                    
                    $(".photo_tsui").attr('src', 'images/'+photo);
                    $(".title_bloc.name").html(familyName);                    
                    $(".sso_user").html(userSSO);
                    $(".part_number").html(partNumber);
                    $(".serial_number").html(serialNumber);                    
                    $("#content_home .information").removeClass("hidden");
                    $(".head_userinfo").removeClass("hidden");
                    $(".head_userinfo .info .role_user").html("Repair");
                }    
                //Recupération du dictionnaire correspondant
                $.ajax({
                    url : 'php/api.php?function=get_dictionaries_by_id&param1='+family_id,
                    type : 'GET',
                    dataType : 'JSON',
                    success: function(data, statut){
                        dictionary = data;                
                        var len = data.length;
                        lineContainer.empty();
                        for (var iter = 0; iter < len; iter++) {
                            if(data[iter].type !== "led" && data[iter].type !== "buzzer"){
                                lineContainer.append("<div class='line id"+data[iter].id+"' data-id='"+data[iter].id+"' data-name='"+data[iter].symbol_name+"' data-function='"+data[iter].type+"'><span class='td'>"+data[iter].symbol_name+"</span><span class='td'>"+data[iter].type+"</span><span class='td'>"+data[iter].description+"</span><span class='td press'>"+data[iter].pressed_val_freq+"</span><span class='td rel'>"+data[iter].released_val_freq+"</span><span class='td photo_piece'><img src='images/"+data[iter].photo_link+"'></span><span class='td totest'>Not tested</span></div>");
                            }else{
                                lineContainer.append("<div class='line id"+data[iter].id+"' data-id='"+data[iter].id+"' data-name='"+data[iter].symbol_name+"' data-function='"+data[iter].type+"'><span class='td'>"+data[iter].symbol_name+"</span><span class='td'>"+data[iter].type+"</span><span class='td'>"+data[iter].description+"</span><span class='td press'>"+data[iter].pressed_val_freq+"</span><span class='td rel'>"+data[iter].released_val_freq+"</span><span class='td photo_piece'><img src='images/"+data[iter].photo_link+"'></span><span class='td test_bt' data-name='"+data[iter].description+"' data-press='"+data[iter].pressed_val_freq+"' data-release='"+data[iter].released_val_freq+"' data-canid='"+data[iter].can_id+"'>TEST</span></div>");
                            }
                        }
                        //gestion des boutons de test des leds et buzzers
                        $(".test_bt").on('click',function(){    
                            var _this = $(this);
                            var description = $(this).data('name');
                            var press = $(this).data('press');
                            var release = $(this).data('release');
                            var canId = $(this).data('canid');        
                            var dlc = "0"+(press.toString().length/2)+"0000";
                            var signalStart = "002400806d68d7551407f09b861e3aad000549a844"+dlc+canId+press;
                            var signalStop = "002400806d68d7551407f09b861e3aad000549a844"+dlc+canId+release;
                            
                            testPoppin.html("<div class='title'>"+description+"</div><div class='bt_test'><div class='bouton_grey start_bt'>Start</div><div class='bouton_grey stop_bt'>Stop</div></div><div class='result_test'>Did something happen as expected ?</div><div class='bt_test_result'><div class='bouton_grey yes_bt'>YES</div><div class='bouton_grey no_bt'>NO</div></div>");
                            
                            testPoppin.find(".title").html(description);        
                            testPoppin.removeClass("hidden");

                            testPoppin.find(".start_bt").on('click', function(){                       
                                sendSignal(signalStart);                                
                            });
                            testPoppin.find(".stop_bt").on('click', function(){                       
                                sendSignal(signalStop);
                            });
                            testPoppin.find(".yes_bt").on('click', function(){  
                                testPoppin.empty();
                                testPoppin.addClass("hidden");
                                _this.css('background-color','yellowgreen');
                                _this.html('TEST OK');
                                _this.parent().addClass("tested");
                                _this.parent().addClass("testok");
                            });
                            testPoppin.find(".no_bt").on('click', function(){   
                                testPoppin.empty();
                                testPoppin.addClass("hidden");
                                _this.css('background-color','red');
                                _this.html('TEST FAIL');
                                _this.parent().addClass("tested");
                            });
                        });
                        
                        $(".totest").on('click',function(){
                           if($(this).hasClass("tested")){
                               $(this).html("Not tested");
                               $(this).removeClass("tested");
                               $(this).parent().removeClass("tested");
                           }else{
                               $(this).html("Tested");
                               $(this).addClass("tested");
                               $(this).parent().addClass("tested");
                           }
                        });
                    }
                });        
            }
         });
        }else{
            alert("Some fields are missing");
        }        
    }); 
    
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// HOMEPAGE ENGINEERING  ////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //recupération des infos tsui homepage INGE
    $("#send_info_hp_E").on('click', function(){
        userSSO = ($("#user_sso_input_E").val());
        familyChoice = ($("#family_choice").html());
        modelChoice = ($("#model_choice").html());        
        if(userSSO !== "" && familyChoice !== "" && modelChoice !== ""){            
            $.ajax({
            url : 'php/api.php?function=get_tsui&param1='+familyChoice,
            type : 'GET',
            dataType : 'JSON',
            success: function(data, statut){
                if(data.length == 0){
                    alert("No result found with this part number."+familyChoice)
                }else{
                    familyName = data[0].name;
                    var photo = data[0].photo_link;
                    sequences = data[0].linked_sequence;
                    family_id = data[0].family;                    
                    $(".photo_tsui").attr('src', 'images/'+photo);
                    $(".title_bloc.name").html(familyName);                    
                    $(".sso_user").html(userSSO);
                    $(".part_number").html(partNumber);
                    $(".serial_number").html(serialNumber);                    
                    $("#content_homeE .information").removeClass("hidden");
                    $(".head_userinfo").removeClass("hidden");
                    $(".head_userinfo .info .role_user").html("Engineering");
                    
                }    
                //Recupération du dictionnaire correspondant
                $.ajax({
                    url : 'php/api.php?function=get_dictionaries_by_id&param1='+family_id,
                    type : 'GET',
                    dataType : 'JSON',
                    success: function(data, statut){
                        dictionary = data;                
                        var len = data.length;
                        lineContainer.empty();
                        for (var iter = 0; iter < len; iter++) {
                            if(data[iter].type !== "led" && data[iter].type !== "buzzer"){
                                lineContainer.append("<div class='line id"+data[iter].id+"' data-id='"+data[iter].id+"' data-name='"+data[iter].symbol_name+"' data-function='"+data[iter].type+"'><span class='td'>"+data[iter].symbol_name+"</span><span class='td'>"+data[iter].type+"</span><span class='td'>"+data[iter].description+"</span><span class='td press'>"+data[iter].pressed_val_freq+"</span><span class='td rel'>"+data[iter].released_val_freq+"</span><span class='td photo_piece'><img src='images/"+data[iter].photo_link+"'></span><span class='td totest'>Not tested</span></div>");
                            }else{
                                lineContainer.append("<div class='line id"+data[iter].id+"' data-id='"+data[iter].id+"' data-name='"+data[iter].symbol_name+"' data-function='"+data[iter].type+"'><span class='td'>"+data[iter].symbol_name+"</span><span class='td'>"+data[iter].type+"</span><span class='td'>"+data[iter].description+"</span><span class='td press'>"+data[iter].pressed_val_freq+"</span><span class='td rel'>"+data[iter].released_val_freq+"</span><span class='td photo_piece'><img src='images/"+data[iter].photo_link+"'></span><span class='td test_bt' data-name='"+data[iter].description+"' data-press='"+data[iter].pressed_val_freq+"' data-release='"+data[iter].released_val_freq+"' data-canid='"+data[iter].can_id+"'>TEST</span></div>");
                            }
                        }                        
                    }
                });        
            }
         });
        }else{
            alert("Some fields are missing");
        }        
    }); 
    
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// ON MESSAGE WEBSOCKET  ////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
   //Traitement des données websocket 
    ws.onmessage=function(event) {
        switch(_MODE){
            case "PRETEST":   
                var message = JSON.parse(event.data);        
                console.log(event.data);
                var canId = message.canId;
                var canData = message.canData; 
                for (var nb = 0; nb < dictionary.length; nb++) {
                    if(dictionary[nb].can_id === canId){
                        switch(dictionary[nb].type){
                            case "button":                        
                                if(dictionary[nb].pressed_val_freq === canData){
                                    lineContainer.find(".line.id"+dictionary[nb].id).addClass("pressed");
                                    lineContainer.find(".line.id"+dictionary[nb].id).addClass("tested");                                       
                                    lineContainer.find(".line.id"+dictionary[nb].id+" .totest").addClass("tested");
                                    lineContainer.find(".line.id"+dictionary[nb].id+" .totest").html("Tested");
                                }
                                if(dictionary[nb].released_val_freq === canData){
                                    lineContainer.find(".line.id"+dictionary[nb].id).addClass("released"); 
                                    lineContainer.find(".line.id"+dictionary[nb].id).addClass("tested");
                                    lineContainer.find(".line.id"+dictionary[nb].id+" .totest").addClass("tested");
                                    lineContainer.find(".line.id"+dictionary[nb].id+" .totest").html("Tested");
                                }
                                break;
                            case "filter1":
                                if(dictionary[nb].value === canData){
                                    var jsonFilter = '{"type":"filter1", "canData":"'+canData+'", "canId":"'+canId+'", "timer":"'+dictionary[nb].timer+'"}';
                                    ws.send(jsonFilter);
                                }
                                break;
//                            case "filter2":
//                                if(dictionary[nb].value === canData){
//                                    var jsonFilter = '{"type":"filter2", "canData":"'+canData+'", "canId":"'+canId+'", "timer":"'+dictionary[nb].timer+'"}';
//                                    ws.send(jsonFilter);
//                                }
//                                break;
                            case "joystick":           
                                if(canData == "000000000000"){
                                    canvasJauge.addClass("zero_state");
                                    joystickBot.css('height', '0%');
                                    joystickTop.css('height', "100%");
                                    joystickLeft.css('width', "100%");
                                    joystickRight.css('width', "0%");
                                    
                                    joystickBot2.css('height', '0%');
                                    joystickTop2.css('height', "100%");
                                    joystickLeft2.css('width', "100%");
                                    joystickRight2.css('width', "0%");
                                    
                                    joystickBot3.css('height', '0%');
                                    joystickTop3.css('height', "100%");
                                    joystickLeft3.css('width', "100%");
                                    joystickRight3.css('width', "0%");
                                }
                                var joy1_horizontal = canData.substring(0,2);
                                var joy1_vertical = canData.substring(2,4);
                                var joy2_horizontal = canData.substring(4,6);
                                var joy2_vertical = canData.substring(6,8);
                                var joy3_horizontal = canData.substring(8,10);
                                var joy3_vertical = canData.substring(10,12);
                                
                                if(joy1_vertical !== '00' || joy1_horizontal !== '00'){
                                    canvasJauge.removeClass("zero_state");
                                    if(joy1_vertical !== '00'){
                                        joy1_vertical = convertHexa(joy1_vertical);
                                        if(joy1_vertical<0){
                                            joystickBot.css('height', (joy1_vertical*-1)+"%");                                 
                                        }else{
                                            joystickTop.css('height', (100-joy1_vertical)+"%");
                                        }
                                    }
                                    else{
                                        joy1_horizontal = convertHexa(joy1_horizontal);
                                        if(joy1_horizontal<0){
                                            joystickLeft.css('width', (100+joy1_horizontal)+"%");
                                        }else{
                                            joystickRight.css('width', joy1_horizontal+"%");
                                        }
                                    }
                                }
                                
                                if(joy2_vertical !== '00' || joy2_horizontal !== '00'){
                                    canvasJauge.removeClass("zero_state");
                                    if(joy2_vertical !== '00'){
                                        joy2_vertical = convertHexa(joy2_vertical);
                                        if(joy2_vertical<0){
                                            joystickBot2.css('height', (joy2_vertical*-1)+"%");                                 
                                        }else{
                                            joystickTop2.css('height', (100-joy2_vertical)+"%");
                                        }
                                    }
                                    else{
                                        joy2_horizontal = convertHexa(joy2_horizontal);
                                        if(joy2_horizontal<0){
                                            joystickLeft2.css('width', (100+joy2_horizontal)+"%");
                                        }else{
                                            joystickRight2.css('width', joy2_horizontal+"%");
                                        }
                                    }
                                }
                                
                                if(joy3_vertical !== '00' || joy3_horizontal !== '00'){
                                    canvasJauge.removeClass("zero_state");
                                    if(joy3_vertical !== '00'){
                                        joy3_vertical = convertHexa(joy3_vertical);
                                        if(joy3_vertical<0){
                                            joystickBot3.css('height', (joy3_vertical*-1)+"%");                                 
                                        }else{
                                            joystickTop3.css('height', (100-joy3_vertical)+"%");
                                        }
                                    }
                                    else{
                                        joy3_horizontal = convertHexa(joy3_horizontal);
                                        if(joy3_horizontal<0){
                                            joystickLeft3.css('width', (100+joy3_horizontal)+"%");
                                        }else{
                                            joystickRight3.css('width', joy3_horizontal+"%");
                                        }
                                    }
                                }                      
                                                                
                                break;
                            default:
                                //console.log("non indentifié");
                        }
                    }
                }
                break;
            case "TEST":   
                var message = JSON.parse(event.data);        
                console.log(event.data);
                var canId = message.canId;
                var canData = message.canData; 
                break;
            case "CALIBRATION":   
                var message = JSON.parse(event.data);        
                console.log(event.data);
                var canId = message.canId;
                var canData = message.canData; 
                if(waitCalibResponse !== ""){
                    var lengthData;                    
                    if(canId == waitCalibResponse){
                        console.log("response detected");
                        lengthData = canData.substring(0,2);
                        if(lengthData == "4f"){
                            finalResponseData = canData.substring(8,10);
                        }else if(lengthData == "4b"){
                            finalResponseData = canData.substring(8,12);
                        }else if(lengthData == "43"){
                            finalResponseData = canData.substring(8,16);
                        }else{
                            finalResponseData = canData.substring(8,14);
                        }
                        console.log(finalResponseData);
                        waitCalibResponse = "";
                    }
                }
                if(waitDownloadResponse != ""){
                    if(waitDownloadResponse == canId){
                        if(canData.substring(0,2) == "20" || canData.substring(0,2) == "30"){
                            continueDownload = 1;
                            waitDownloadResponse = "";
                        }else if(canData.substring(0,2) == "80"){
                            continueDownload = 0;
                            waitDownloadResponse = "";
                        }
                    }
                }
                break;
            case "TOOLBOX": 
                var message = JSON.parse(event.data);        
                //console.log("TOOLBOX :"+event.data);
                var canId = message.canId;
                var canData = message.canData;
                if(spyBoxDialog.hasClass("open") && !spyBoxDialog.hasClass("stop_mode")){
                    if(isFilter == 1){
                        if(operatorID == "==" && filterID !== "" && filterID == canId){
                            sendToSpy(canId, canData);
                        }
                        if(operatorID == "!=" && filterID !== "" && filterID != canId){
                            sendToSpy(canId, canData);
                        }
                        
                        if(operatorData == "==" && filterData !== "" && filterData == canData){
                            sendToSpy(canId, canData);
                        }
                        if(operatorData == "!=" && filterData !== "" && filterData != canData){
                            sendToSpy(canId, canData);
                        }
                        
                    }else{
                        sendToSpy(canId, canData);
                    }
                    
                }else{
                    console.log("not send to spy");
                }                
                break;
        }         
        
    };
    
      
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// SPY BOX        ///////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    
    function sendToSpy(canId, canData){
        var d = spyBox.get(0);
        d.scrollTop = d.scrollHeight;
        if(lastSpyMsg !== canData){
            spyBox.append("<div class='line_spy'><span class='can_id_spy' data-id='"+canId+"'>"+canId+"</span> <span class='can_data_spy'>"+canData+"</span> <span class='nb'>1</span><span class='ts'>"+new Date().getTime()+"</span></div>");
        }else{           
            var nb = $("#dialog-spybox .content_line .line_spy:last-child .nb").html();
            nb = parseInt(nb);
            nb ++;
            $(".content_line .line_spy:last-child .nb").html(nb);
        }               
        lastSpyMsg = canData;
    };
    
    $("#dialog-spybox .spy_stop").on('click',function(){        
        spyBoxDialog.addClass("stop_mode");
    });
    $("#dialog-spybox .spy_play").on('click',function(){
        spyBoxDialog.removeClass("stop_mode");
    });
    $("#dialog-spybox .spy_clear").on('click',function(){
        spyBox.empty();
    });
   
    $("#dialog-spybox .is_different_canid").on('click',function(){
        if($(this).hasClass("activated")){
            $(this).removeClass("activated");
        }else{
            $(this).addClass("activated");
        }
    });
    $("#dialog-spybox .is_different_candata").on('click',function(){
        if($(this).hasClass("activated")){
            $(this).removeClass("activated");
        }else{
            $(this).addClass("activated");
        }
    });    
    $("#dialog-spybox .launch_filter").on('click',function(){
       var inputCanid =  $(".filter_canid").val();
       var inputCandata =  $(".filter_candata").val();
       operatorID = "==";
       operatorData = "==";
       
       if($(".is_different_canid").hasClass('activated')){
           operatorID = "!=";
       }
       if($(".is_different_candata").hasClass('activated')){
           operatorData = "!=";
       }
       if(inputCanid == "" && inputCandata == ""){
           $("#dialog-spybox .recap_filter").html("No filters applied");
           isFilter = 0;
       }else{           
           if(inputCandata !== "" && inputCanid !== ""){
               $("#dialog-spybox .recap_filter").html("CAN ID "+operatorID+" "+inputCanid+" && CAN DATA "+operatorData+" "+inputCandata+".");
               filterID = inputCanid;
               filterData = inputCandata;
           }
           if(inputCandata !== "" && inputCanid == ""){
               $("#dialog-spybox .recap_filter").html("CAN DATA "+operatorData+" "+inputCandata+".");
               filterID = "";
               filterData = inputCandata;
           }
           if(inputCandata == "" && inputCanid !== ""){
               $("#dialog-spybox .recap_filter").html("CAN ID "+operatorID+" "+inputCanid+".");
               filterID = inputCanid;
               filterData = "";
           }
           isFilter = 1;
       }
      
    });
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// SENDER BOX        ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    
    $("#dialog-sender .sender_test").on('click',function(){        
        getPreviewValues();
    });
    
    $("#dialog-sender .add_zero").on('click',function(){        
        adjustCanMessage();
    });
    
    function addZeroBefore(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    function addZeroAfter(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : n + new Array(width - n.length + 1).join(z);
    }
    
    function adjustCanMessage(){
        var dlcInputSender = $("#dialog-sender .candlc_sender").val().trim();
        var idInputSender = $("#dialog-sender .canid_sender").val().trim();
        var dataInputSender = $("#dialog-sender .candata_sender").val().trim();
        
        dlcInputSender = addZeroBefore(dlcInputSender, 2);
        idInputSender = addZeroBefore(idInputSender, 8);
        dataInputSender = addZeroAfter(dataInputSender, 16);
        
        $("#dialog-sender .candlc_sender").val(dlcInputSender);
        $("#dialog-sender .canid_sender").val(idInputSender);
        $("#dialog-sender .candata_sender").val(dataInputSender);
    }
    
    function getPreviewValues(){
        var dlcInputSender = $("#dialog-sender .candlc_sender").val().trim();
        var idInputSender = $("#dialog-sender .canid_sender").val().trim();
        var dataInputSender = $("#dialog-sender .candata_sender").val().trim();
        
        if(dlcInputSender.length == 0 && idInputSender.length == 0 && dataInputSender.length == 0 ){
            $("#dialog-sender .error_sender").html("Fields are empty.");
            $("#dialog-sender .error_sender").removeClass("hidden");
            $("#dialog-sender .result_sender").addClass("hidden");
        }else{
            $("#dialog-sender .error_sender").addClass("hidden");            
            displayPreviewValues(dlcInputSender, idInputSender, dataInputSender);
        }
    }
    
    function displayPreviewValues(dlcInputSender, idInputSender, dataInputSender){
        $("#dialog-sender .result_sender").removeClass("hidden");
        $("#dialog-sender .result_sender .sender_msg").html("<span class='text_ref'>Message : </span><span class='red'>"+dlcInputSender+"</span> <span class='green'>"+idInputSender+"</span> <span class='blue'>"+dataInputSender+"</span>");
        $("#dialog-sender .result_sender .length_msg").html("<span class='text_ref'>Length : </span><span class='red'>"+dlcInputSender.length+"/2</span> <span class='green'>"+idInputSender.length+"/8</span> <span class='blue'>"+dataInputSender.length+"/16</span>");
    }
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// DIAG PRINT LOG ///////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    
    //Generation du tableau de log qui sera ensuite save en base de donnée
    function generateJsonLog(){
        jsonLog = [];
        var name;
        var fct;
        var completeName;
        $("#content_pretest .line_container .line").each(function(){
            if($(this).hasClass("tested")){
                name = $(this).data('name');
                fct = $(this).data('function');
                if(fct == "button"){
                    if($(this).hasClass("pressed")){
                        completeName = name+" - press"; 
                        jsonLog.push({name:completeName, test:'OK', fct:fct});
                    }else{
                        completeName = name+" - press"; 
                        jsonLog.push({name:completeName, test:'FAILED', fct:fct});
                    }
                    if($(this).hasClass("released")){
                        completeName = name+" - release"; 
                        jsonLog.push({name:completeName, test:'OK', fct:fct});
                    }else{
                        completeName = name+" - release"; 
                        jsonLog.push({name:completeName, test:'FAILED', fct:fct});
                    }                     
                }else{
                    if($(this).hasClass("testok")){
                        completeName = name+" - "+fct; 
                        jsonLog.push({name:completeName, test:'OK', fct:fct});
                    }else{
                        completeName = name+" - "+fct; 
                        jsonLog.push({name:completeName, test:'FAILED', fct:fct});
                    }
                }                 
            }else{
                name = $(this).data('name');
                fct = $(this).data('function');
                if(fct == "button"){
                    completeName = name+" - press"; 
                    jsonLog.push({name:completeName, test:'untested', fct:fct});
                    completeName = name+" - release"; 
                    jsonLog.push({name:completeName, test:'untested',fct:fct});
                }else{
                    completeName = name+" - "+fct; 
                    jsonLog.push({name:completeName, test:'untested',fct:fct});
                }                                
            }
        });
        console.log(jsonLog);
        console.log("------");
        jsonLog = JSON.stringify(jsonLog);
        console.log(jsonLog);
        $.ajax({
            type: "POST",
            url: "php/api.php?function=save_log_pretest",
            data: {jsonlog:jsonLog},
            success: function (msg) {
                alert("Your log have been saved.");
                $("#print_log").removeClass("hidden");
            }
        });
    };
    
    //Generation du rapport de test et affichage de la fenetre d'impression 
    function printJsonLog(jsonLog){  
        var msg = JSON.parse(jsonLog);
        var lineButton = "";
        var lineLed = "";
        var lineJoystick = "";
        var lineBuzzer = "";
        for(var i =0; i<msg.length; i++){
            if(msg[i].fct == "button"){
                if(msg[i].test == "untested"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:orange'>"+msg[i].test+"</span></div>"                
                }
                if(msg[i].test == "OK"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:green'>"+msg[i].test+"</span></div>"                
                }
                if(msg[i].test == "FAILED"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:red'>"+msg[i].test+"</span></div>"                
                }
                
                lineButton += line;
            }
            if(msg[i].fct == "led"){
                if(msg[i].test == "untested"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:orange'>"+msg[i].test+"</span></div>"                
                }
                if(msg[i].test == "OK"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:green'>"+msg[i].test+"</span></div>"                
                }
                if(msg[i].test == "FAILED"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:red'>"+msg[i].test+"</span></div>"                
                }
                lineLed += line;
            }
            if(msg[i].fct == "buzzer"){
                if(msg[i].test == "untested"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:orange'>"+msg[i].test+"</span></div>"                
                }
                if(msg[i].test == "OK"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:green'>"+msg[i].test+"</span></div>"                
                }
                if(msg[i].test == "FAILED"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:red'>"+msg[i].test+"</span></div>"                
                }
                lineBuzzer += line;
            }
            if(msg[i].fct == "joystick"){
                if(msg[i].test == "untested"){
                    var line = "<div><span style='width:100px;display:inline-block;'>"+msg[i].name+"</span> = <span style='color:orange'>"+msg[i].test+"</span></div>"                
                }
                lineJoystick += line;
            }
            
        }
        var currentdate = new Date(); 
        var datetime =  currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear() + " "+ currentdate.getHours() + "h" + currentdate.getMinutes();
        var myWindow=window.open('','','width=1000,height=800');
        myWindow.document.write("<h2>PRETEST LOG RECORD - "+datetime+"</h2><div style='border:1px solid black;padding:5px;'><b>Family</b> : "+familyName+" - <b>PN</b> : "+partNumber+" - <b>SN</b> : "+serialNumber+" - <b>Firmware version</b> : 2.0.3 - <b>User SSO</b> : "+userSSO+"</div><h3>BUTTONS</h3><div>"+lineButton+"</div><h3>BUZZERS</h3><div>"+lineBuzzer+"</div><h3>BACKLIGHTS</h3><div>"+lineLed+"</div>");
        myWindow.document.close();
        myWindow.focus();
        myWindow.print();
        myWindow.close();
    };
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// FINAL   TEST /////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    
     //Click on launch final test button
    $(".launch_final").on('click', function(){
        launchFinalTest();
    });
    
    //valider manuellement l'étape (dev only)
    $("#next_final_test").on('click', function(){
        nextStepFinal("ok");
    });
    
    //interrompre manuellement le test final
    $("#stop_final_test").on('click', function(){
        stopFinalTest("interrupted");
    });
    
    //recuperation des entrées du test final dans le dictionnaire associé
    function getFinalTest(){
        $.ajax({
                url : 'php/api.php?function=get_final_test&param1='+family_id,
                type : 'GET',
                dataType : 'JSON',
                success: function(data, statut){
                    finalTestEntries = data;
                    
                }
            }
        );
    };
    
    //Launch final test
    function launchFinalTest(){
        indexFinal = 0;
        _MODE = "TEST";
        getFinalTest();
        
        setTimeout(function(){
            maxIndexFinal = finalTestEntries.length;
            if(maxIndexFinal > 0){
                $("#testfinal_container .display_test_content").removeClass("hidden");
                $("#testfinal_container #launch_final_test").addClass("hidden");
                nameFinalContainer.removeClass("hidden");
                timerBloc.removeClass("hidden");
                imgFinalBloc.removeClass("hidden");
                stopTestBloc.addClass("hidden");
                $("#stop_final_test").removeClass("hidden");
                $("#next_final_test").removeClass("hidden");
                recapListFinal.empty();
                timerBloc.html("");
                
                displayFinalTest(indexFinal);
            }            
        },200);
    }
    
    //Affichage du test final en cours
    function displayFinalTest(indexFinal){
        var pourcentage = Math.round((indexFinal/maxIndexFinal)*100);
        
        currSymbol_name = finalTestEntries[indexFinal].symbol_name;
        currType = finalTestEntries[indexFinal].type;
        currDescription = finalTestEntries[indexFinal].description;
        currPhoto_link = finalTestEntries[indexFinal].photo_link;
        currTimer = finalTestEntries[indexFinal].timer;
        
        launchTimer(currTimer);
        
        var value = finalTestEntries[indexFinal].value;
        var can_id = finalTestEntries[indexFinal].can_id;
        var pressed_val_freq = finalTestEntries[indexFinal].pressed_val_freq;
        var pressed_val_tens = finalTestEntries[indexFinal].pressed_val_tens;
        var released_val_freq = finalTestEntries[indexFinal].released_val_freq;
        var released_val_tens = finalTestEntries[indexFinal].released_val_tens;
        
        switch(currType){
            case "button":
                symbolNameFinal.html("Press and release "+currSymbol_name);
                descriptionFinal.html(currDescription);
                imgFinal.attr('src', 'images/'+currPhoto_link);
                progressBarFinalInside.css('width',pourcentage+'%');
                progressBarFinal.html(pourcentage+'%');
                break;
            case "joystick":
                break;
        }
        
    };
    
    //goto Next step with result in param
    function nextStepFinal(result){
        indexFinal++;
        timerBloc.html("");
        clearInterval(intervalGlobal);
        if(result == "ok"){
            var line = "<div class='line'><span class='symbol'>"+currSymbol_name+"</span> - <span class='description'>"+currDescription+"</span><span class='type'>"+currType+"</span><span class='green'>TEST OK</span></div>"
        }else{
            var line = "<div class='line'><span class='symbol'>"+currSymbol_name+"</span> - <span class='description'>"+currDescription+"</span><span class='type'>"+currType+"</span><span class='red'>TEST FAIL</span></div>"
        }
        recapListFinal.append(line);
        var d = recapListFinal.get(0);
        d.scrollTop = d.scrollHeight;
        if(indexFinal< maxIndexFinal){
            displayFinalTest(indexFinal);
        }else{
            stopFinalTest("end");
        }
    }
    
    //Gestion du timer
    function launchTimer(timer){
        var time = timer*1000;
        intervalGlobal = setInterval(function(){ 
            if(timer == 0){
                nextStepFinal("fail");                
            }else{
                timerBloc.html(timer);
                timer -= 1;
            }            
        }, 1000);
    };
    
    //Interrupt or end Final test
    function stopFinalTest(result){
        switch(result){
            case "interrupted":
                $(".stop_test_bloc .result_title").html("Final test has been interrupted");
                clearInterval(intervalGlobal);
                break;
            case "end":
                var pourcentage = 100;
                progressBarFinalInside.css('width',pourcentage+'%');
                progressBarFinal.html(pourcentage+'%');
                $(".stop_test_bloc .result_title").html("Final test is completed");
                break;
        }        
        nameFinalContainer.addClass("hidden");
        timerBloc.addClass("hidden");
        imgFinalBloc.addClass("hidden");
        stopTestBloc.removeClass("hidden");
        $("#stop_final_test").addClass("hidden");
        $("#next_final_test").addClass("hidden");
        
        _MODE = "PRETEST";
    }
    
    
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// CALIBRATION //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    var joystickLongSubindex;
    var joystickLatSubindex;
    calibrateBt1.find("button").on('click', function(){
        _MODE = "CALIBRATION";
        joystickLongSubindex = "01";
        joystickLatSubindex = "02";
        calibrateBt1.find(".calibrate_tool").removeClass("hidden");
        calibrateZeroLong("1");
        $(this).addClass("hidden");
    });    
    calibrateBt2.find("button").on('click', function(){
        _MODE = "CALIBRATION";
        joystickLongSubindex = "03";
        joystickLatSubindex = "04";
        calibrateBt2.find(".calibrate_tool").removeClass("hidden");
        calibrateZeroLong("2");
        $(this).addClass("hidden");
    });    
    calibrateBt3.find("button").on('click', function(){
        _MODE = "CALIBRATION";
        joystickLongSubindex = "05";
        joystickLatSubindex = "06";
        calibrateBt3.find(".calibrate_tool").removeClass("hidden");
        calibrateZeroLong("3");
        $(this).addClass("hidden");
    });    
    
   
    
    // 002400806d68d7551407f09b861e3aad000549a844 05 00000000062d 2f 01 54 00 00 00 00 00
    
    var Cal_merde = "002400806d68d7551407f09b861e3aad000549a844";
    var Cal_dlc = "08";
    var Cal_canid = "00000000062D";
    var Cal_data = "401f540100000000";
    
     $(".eprom_protect .bt_eprom").on('click', function(){
        if($(".eprom_protect").hasClass("protected")){
            $(".img_eprom").attr('src', "images/unprotected.png");
            $(this).html("LOCK EEPROM");
            $(this).css({"background":"#3b73b9", "color": "white"});
            $(".txt_eprom").html("EEPROM is writable");
            sendSignal(Cal_merde+Cal_dlc+Cal_canid+"2f00550100000000");
            $(".eprom_protect").removeClass("protected");
        }else{
            $(".img_eprom").attr('src', "images/protected.png");
            $(this).html("UNLOCK EEPROM");
            $(this).css({"background":"#c4c4c4","color":"black"});
            $(".txt_eprom").html("EEPROM is protected");
            sendSignal(Cal_merde+Cal_dlc+Cal_canid+"2f00550101000000");
            $(".eprom_protect").addClass("protected");
        }
    });
    
    var axisRawSignal = Cal_merde+Cal_dlc+Cal_canid+Cal_data;
    
    var axisRawZeroLong;
    var axisRawZeroLat;
    var axisRawMaxLong;
    var axisRawMinLong;
    var axisRawMaxLat;
    var axisRawMinLat;
    
    function signalComposer(response, header, subIndex){
        var newSignal;
        if(response.length == 2){
            newSignal = Cal_merde+Cal_dlc+Cal_canid+"2f"+header+subIndex+response+"000000";
            console.log("nouveau signal envoyé : "+newSignal);  
        }else if(response.length == 4){
            newSignal = Cal_merde+Cal_dlc+Cal_canid+"2b"+header+subIndex+response+"0000";      
            console.log("nouveau signal envoyé : "+newSignal);  
        }else if(response.length == 8){
            newSignal = Cal_merde+Cal_dlc+Cal_canid+"23"+header+subIndex+response;
            console.log("nouveau signal envoyé : "+newSignal);  
        }else{
            console.log("nouveau signal envoyé : "+newSignal);  
        }
        return newSignal;
    }
    
    //Recuperation de la position Longitudinale et stockage dans l'EPROM
    function calibrateZeroLong(identifier){
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Axis Raw acquisition ZERO");
        $(".calibrate_bt_"+identifier).find(".action_calib").html("Be sure joystick "+identifier+" is on position zero then click.");
        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            alert("length = "+axisRawSignal.length+" ..send signal acquisition ZERO : "+axisRawSignal);
            sendSignal(axisRawSignal);
            waitCalibResponse = "000005ad";
            setTimeout(function(){
                axisRawZeroLong = finalResponseData;
                var newSignal = signalComposer(axisRawZeroLong, "2054", joystickLongSubindex); //param = response + header for zero long                
                sendSignal(newSignal);
                calibrateMaxLong(identifier);
            },200);
        });
    }
    function calibrateMaxLong(identifier){
        $(".calibrate_bt_"+identifier).find(".validate_calib").off();
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Axis Raw acquisition max");
        $(".calibrate_bt_"+identifier).find(".action_calib").html("Press joystick "+identifier+" at maximum RIGHT position then click.");
        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            alert("length = "+axisRawSignal.length+" ..send signal acquisition axis raw MAX : "+axisRawSignal);  
            sendSignal(axisRawSignal);
            waitCalibResponse = "000005ad";
            setTimeout(function(){
                axisRawMaxLong = finalResponseData;
                var newSignal = signalComposer(axisRawZeroLong, "2254", joystickLongSubindex); //param = response + header for max long
                sendSignal(newSignal);
                calibrateMinLong(identifier);
            },200);
        });
    }
    function calibrateMinLong(identifier){
        $(".calibrate_bt_"+identifier).find(".validate_calib").off();
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Axis Raw acquisition min");
        $(".calibrate_bt_"+identifier).find(".action_calib").html("Press joystick "+identifier+" at minimum LEFT position then click.");
        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            alert("length = "+axisRawSignal.length+" ..send signal acquisition axis raw MIN : "+axisRawSignal);  
            sendSignal(axisRawSignal);
            waitCalibResponse = "000005ad";
            setTimeout(function(){
                axisRawMinLong = finalResponseData;
                var newSignal = signalComposer(axisRawZeroLong, "2154", joystickLongSubindex); //param = response + header for min long
                sendSignal(newSignal);
                calibrateMinLat(identifier);
            },200);
        });
    }
    
    //Recuperation de la position Verticale et stockage dans l'EPROM
    function calibrateMinLat(identifier){
        $(".calibrate_bt_"+identifier).find(".validate_calib").off();
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Axis Raw acquisition min");
        $(".calibrate_bt_"+identifier).find(".action_calib").html("Press joystick "+identifier+" at maximum BOTTOM position then click.");
        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            alert("length = "+axisRawSignal.length+" ..send signal acquisition axis raw MIN : "+axisRawSignal);  
            sendSignal(axisRawSignal);
            waitCalibResponse = "000005ad";
            setTimeout(function(){
                axisRawMinLat = finalResponseData;
                var newSignal = signalComposer(axisRawZeroLong, "2154", joystickLatSubindex); //param = response + header for zero long
                sendSignal(newSignal);
                calibrateMaxLat(identifier);
            },200);
        });
    }
    function calibrateMaxLat(identifier){
        $(".calibrate_bt_"+identifier).find(".validate_calib").off();
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Axis Raw acquisition max");
        $(".calibrate_bt_"+identifier).find(".action_calib").html("Press joystick "+identifier+" at maximum TOP position then click.");
        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            alert("length = "+axisRawSignal.length+" ..send signal acquisition axis raw MIN : "+axisRawSignal);  
            sendSignal(axisRawSignal);
            waitCalibResponse = "000005ad";
            setTimeout(function(){
                axisRawMaxLat = finalResponseData;
                var newSignal = signalComposer(axisRawZeroLong, "2254", joystickLatSubindex); //param = response + header for zero long
                sendSignal(newSignal);
                calibrateZeroLat(identifier);
            },200);
        });
    }
    function calibrateZeroLat(identifier){
        $(".calibrate_bt_"+identifier).find(".validate_calib").off();
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Axis Raw acquisition min");
        $(".calibrate_bt_"+identifier).find(".action_calib").html("Press joystick "+identifier+" at ZERO position then click.");
        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            alert("length = "+axisRawSignal.length+" ..send signal acquisition axis raw MIN : "+axisRawSignal);  
            sendSignal(axisRawSignal);
            waitCalibResponse = "000005ad";
            setTimeout(function(){
                axisRawZeroLat = finalResponseData;
                var newSignal = signalComposer(axisRawZeroLong, "2054", joystickLatSubindex); //param = response + header for zero long
                sendSignal(newSignal);
                resetCalibration(identifier);
            },200);
        });
    }
    
    function resetCalibration(identifier){
        $(".calibrate_bt_"+identifier).find(".validate_calib").off();
        $(".calibrate_bt_"+identifier).find(".status_calib").html("Recap final Values");

        $(".calibrate_bt_"+identifier).find(".validate_calib").on('click', function(){
            pingEpromValues();
        });
    }
    
         
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// PING GET INFO VERSION ////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    $(".bt_get_config").on('click', function(){
        _MODE = "CALIBRATION";
        pingGetInfo("ELEGANCE", "000005ad");
        setTimeout(function(){
            var newBootRelease = bootRelease.substring(6,8)+"."+bootRelease.substring(4,6);
            $(".boot_config").html(newBootRelease);
            var newFPGARelease = FPGARelease.substring(6,8)+FPGARelease.substring(4,6)+"."+FPGARelease.substring(2,4)+FPGARelease.substring(0,2);
            $(".fpga_config").html(newFPGARelease);
            var newsoftwareRelease = softwareRelease.substring(6,8)+"."+softwareRelease.substring(4,6);
            $(".sw_config").html(newsoftwareRelease);
            var newunicID = unicID.substring(14,16)+"."+unicID.substring(12,14)+"."+unicID.substring(10,12)+"."+unicID.substring(8,10)+" "+unicID.substring(6,8)+"."+unicID.substring(4,6)+"."+unicID.substring(2,4)+"."+unicID.substring(0,2);
            $(".unic_config").html(newunicID);
        },1200);
        
    });
    
    function pingGetInfo(model, id){
        switch(model){
            case "ELEGANCE":
                pingTSSC(Cal_merde+Cal_dlc+Cal_canid+"4018100300000000",id);                
                setTimeout(function(){
                    bootRelease = finalResponseData;                    
                    pingTSSC(Cal_merde+Cal_dlc+Cal_canid+"4018100400000000",id);
                    setTimeout(function(){
                        FPGARelease = finalResponseData;
                        pingTSSC(Cal_merde+Cal_dlc+Cal_canid+"4018100700000000",id);
                        setTimeout(function(){
                            softwareRelease = finalResponseData;
                            pingTSSC(Cal_merde+Cal_dlc+Cal_canid+"4018100500000000",id);
                            setTimeout(function(){
                                var unicIDmsb = finalResponseData;
                                pingTSSC(Cal_merde+Cal_dlc+Cal_canid+"4018100600000000",id);
                                setTimeout(function(){
                                    var unicIDlsb = finalResponseData;
                                    unicID = unicIDmsb+unicIDlsb;
                                },200);
                            },200);
                        },200);
                    },200);
                },200);     
            break;
        }        
    }
    
    function pingTSSC(signal, id){
        sendSignal(signal);
        waitCalibResponse = id;  
    }
    
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// DOWNLOAD FIRMWARE ////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function readSingleFile(evt) {
        //Retrieve the first (and only!) File from the FileList object
        var f = evt.target.files[0]; 

        if (f) {
          var r = new FileReader();
          r.onload = function(e) { 
                  var contents = e.target.result;
                  arrayOfLines = contents.split("\n");
                  showReadResult(f.name, f.type, f.size);
          }
          r.readAsText(f);
        } else { 
          alert("Failed to load file");
        }
      }
   
    function showReadResult(name, type, size){
        $(".testing_upl .content_upl").html( "<span>File is read ! </span> | " 
            +"<b>Name</b> : " + name + "<br>"
            +"<b>Nb of lines </b>: "+ arrayOfLines.length
            +" | <b>Size </b>: " + size + " bytes<br/>"
        );
        if(arrayOfLines.length > 0){
            $(".testing_upl .start_download").removeClass("hidden");
            $(".testing_upl .stop_download").removeClass("hidden");
        }
    }
    document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
    
    $(".testing_upl .start_download").on('click', function(){
        startDownload(Cal_canid);
    });
    
    $(".testing_upl .stop_download").on('click', function(){
        stopDownload(Cal_canid);
    });
    
    function startDownload(canId){         
        //stop application mode
        console.log("stop application mode");
        sendSignal(Cal_merde+Cal_dlc+canId+"2f511f0100000000");
        setTimeout(function(){
            //start download mode
            console.log("start download mode");
            if(arrayOfLines[0].substr(0,1)== "+"){
                var lengthFirstLine = arrayOfLines[0].length-1;
                console.log(lengthFirstLine);
                var newval= lengthFirstLine.toString(16);
                console.log(newval);
                var customCAN = Cal_merde+Cal_dlc+canId+"21501f01"+newval+"000000";
                sendSignal(customCAN);
                setTimeout(function(){
                    var asciiToHex = "";
                    for(var index = 0;index < lengthFirstLine; index++){
                        asciiToHex += arrayOfLines[0].charCodeAt(index).toString(16);
                    }
                    sendMultipleSignal(asciiToHex, canId);
                    console.log("------------------------------------------");
                    coreDownload(canId);
//                    waitDownloadResponse = "000005ad";
//                    var checkResponse = setInterval(function(){
//                        console.log("check response");
//                        if(waitDownloadResponse !== ""){
//                            if(continueDownload == 1){
//                                coreDownload();
//                                clearInterval(checkResponse);
//                            }
//                        }else{
//                            clearInterval(checkResponse);
//                        }
//                    }, 200);
                },200);
            }
            //sendSignal(Cal_merde+Cal_dlc+canId+"2f511f0101000000");
        },200);
    };
    function coreDownload(canId){
        console.log("reponse reçu on continue le download");
        var asciiToHex = "";
        var lengthOfLine = arrayOfLines[2].length-1;
        for(var index = 0;index < lengthOfLine; index++){
            asciiToHex += arrayOfLines[2].charCodeAt(index).toString(16);
        }
        sendMultipleSignal(asciiToHex, canId);
    };
    function stopDownload(canId){         
        //application mode
        sendSignal(Cal_merde+Cal_dlc+canId+"2f511f0101000000");
    };
    
    function sendMultipleSignal(signal, canId){
        var nbMessage = parseInt((signal.length/2)/7);
        if(nbMessage == 0){
            nbMessage = 1;
        }
        if(((signal.length/2)%7 > 0)){
            nbMessage += 1;
        }
        var dataZero;      
        for(var i = 0; i <nbMessage; i++){
            var t;                        
            var c = 0;
            var n = 0;
            if(i%2 == 0){
                t = 0;
            }else{
                t = 16;
            }
            if(i == (nbMessage-1)){
                c = 1;
                n = 0+(7-(signal.length/2)%7)*2; 
                if(n == 14){n = 0}
            }
            dataZero = 0+parseInt(t)+parseInt(n)+parseInt(c); 
            var hexDataZero = dataZero.toString(16);
            if(hexDataZero.length <2){
                hexDataZero = "0"+hexDataZero;
            }
            var startInd = (14*i);
            var endInd = (14*i)+14;
            var data = signal.substring(startInd, endInd);
            data = addZeroAfter(data,14);
            console.log('t+n+c :'+t+" "+n+" "+c)
            sendSignal(Cal_merde+Cal_dlc+canId+hexDataZero+data);
        }      
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// ON CLICK FUNCTION ////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //différentes fonctions d'envoi de signaux au tsui
    $("#start_node").on('click', function(){sendSignal("002400806d68d7551407f09b861e3aad000549a84402000000000000012D000000000000");});    
    $("#stop_node").on('click', function(){sendSignal("002400806d68d7551407f09b861e3aad000549a84402000000000000022D000000000000");});
    $("#start_led").on('click', function(){sendSignal("002400806d68d7551407f09b861e3aad000549a84408000000000328FFFFFFFFFFFFFFFF");});
    $("#stop_led").on('click', function(){sendSignal("002400806d68d7551407f09b861e3aad000549a844080000000003280000000000000000");});
    $("#record_log").on('click', function(){generateJsonLog();});
    $("#print_log").on('click', function(){printJsonLog(jsonLog);});
    
    
    $(".toolbox").on('click', function(){
        _MODE = "TOOLBOX";
        alert("mode toolbox activated");
    });
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// SEND SIGNAL TO DRIVER ////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    
    function sendSignal(signal){        
        var jsonData = '{"type":"signal", "msg":"'+signal+'"}';
        console.log(jsonData);
        ws.send(jsonData);
    }
    
    function convertHexa(hexaVal){
        var newval = parseInt(hexaVal, 16);
        if(newval>0x80){
           newval = newval-0x100; 
        }
        return newval;
    }
    
   
    $("#test_calib").on('click', function(){
        sendSignal(Cal_merde+Cal_dlc+Cal_canid+"4021540100000000");    
    });
    $("#test_calib2").on('click', function(){
        sendSignal("002400806d68d7551407f09b861e3aad000549a8440800000000062d4020540100000000");    
    });
    $("#test_calib3").on('click', function(){
        sendSignal("002400806d68d7551407f09b861e3aad000549a8440800000000062d401f540100000000");    
    });
    $("#test_calib4").on('click', function(){
        sendSignal("002400806d68d7551407f09b861e3aad000549a8440800000000062d4022540100000000");    
    });
    $("#test_calib5").on('click', function(){
        sendSignal("002400806d68d7551407f09b861e3aad000549a8440800000000062d401f540100000000");    
    });
    $("#test_calib6").on('click', function(){
        sendSignal("002400806d68d7551407f09b861e3aad000549a8440800000000062d4021540100000000");    
    });
    $("#test_calib7").on('click', function(){
        sendSignal("002400806d68d7551407f09b861e3aad000549a8440800000000062d4000550100000000");    
    });
    
    
});