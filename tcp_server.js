var net = require('net');
var fs = require('fs');
var dgram = require('dgram');

var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer( { port: 8100 } );

var HOST = '192.168.1.20';
var PORT = 21100;

var HOST2 = '192.168.1.10';
var PORT2 = 25000;

var i=0;
var ct = 0
var filter1 = "";
var filter2 = "";

var counter = 0;

console.log('Server listening on ' + HOST +':'+ PORT);
wss.on('connection', function (ws) {
	
	var udpClient = dgram.createSocket('udp4');
	console.log("lancement du process websocket");
	 net.createServer(function(sock) {
		
		console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
		
		sock.on("data", function(data) {
			//console.log(counter);

			var canStr = data.toString('hex');
			
			if(canStr.length >72){
				sock.write('received "' + data + '"');
				var nbFrame = canStr.length/72;
				for(i=0;i<nbFrame;i++){
					var mult = i*72;
					var dlc = canStr.substring(42+mult, 44+mult);
					var canId = canStr.substring(48+mult, 56+mult);
					var canData = canStr.substring(56+mult, 72+mult);
					
					switch(dlc){
						case '01':
							canData = canData.substring(0,2);
							break;
						case '02':
							canData = canData.substring(0,4);
							break;
						case '03':
							canData = canData.substring(0,6);
							break;
						case '04':
							canData = canData.substring(0,8);
							break;
						case '05':
							canData = canData.substring(0,10);
							break;
						case '06':
							canData = canData.substring(0,12);
							break;
						case '07':
							canData = canData.substring(0,14);
							break;
						case '08':
							canData = canData.substring(0,16);
							break;

						default:
							return
					}
					
					var jsonData = '{"canId":"'+canId+'", "canData":"'+canData+'"}';
					
					if(filter1 !== "" || filter2 !== ""){
						if(filter1 !== ""){
							msgFilter1 = JSON.parse(filter1);
							if(canId !== msgFilter1.canId && canData !== msgFilter1.canData){
								if(filter2 !== ""){
									msgFilter2 = JSON.parse(filter2);						
									if(canId !== msgFilter2.canId && canData !== msgFilter2.canData){
										console.log(canId + " filter2 can id : "+msgFilter2.canId + " // "+canData + "filter2 can data : "+msgFilter2.canData);
										ws.send(jsonData);
									}		
								}else{
									ws.send(jsonData);
								}
							}			
						}else{
							msgFilter2 = JSON.parse(filter2);						
							if(canId !== msgFilter2.canId && canData !== msgFilter2.canData){
								//console.log(canId + " filter2 can id : "+msgFilter2.canId + " // "+canData + "filter2 can data : "+msgFilter2.canData);
								ws.send(jsonData);
							}	
						}
					}else{
						ws.send(jsonData);
					}
										
					counter ++;
				}
			}else{
				//console.log("frame per packet : "+ (canStr.length/72));
				var dlc = canStr.substring(42, 44);
				var canId = canStr.substring(48, 56);
				var canData = canStr.substring(56, 72);
				
				switch(dlc){
					case '01':
						canData = canData.substring(0,2);
						break;
					case '02':
						canData = canData.substring(0,4);
						break;
					case '03':
						canData = canData.substring(0,6);
						break;
					case '04':
						canData = canData.substring(0,8);
						break;
					case '05':
						canData = canData.substring(0,10);
						break;
					case '06':
						canData = canData.substring(0,12);
						break;
					case '07':
						canData = canData.substring(0,14);
						break;
					case '08':
						canData = canData.substring(0,16);
						break;

					default:
						return
				}
				

				//var jsonData = '{"length":"'+length+'", "msgType":"'+msgType+'", "tag":"'+tag+'", "tsLow":"'+tsLowConvert+'", "tsHigh":"'+tsHigh+'", "channel":"'+channel+'", "dlc":"'+dlc+'", "flags":"'+flags+'", "canId":"'+canId+'", "canData":"'+canData+'"}';
				var jsonData = '{"canId":"'+canId+'", "canData":"'+canData+'"}';
								
				sock.write('received "' + data + '"');
				
				
				if(filter1 !== "" || filter2 !== ""){
					if(filter1 !== ""){
						msgFilter1 = JSON.parse(filter1);
						if(canId !== msgFilter1.canId && canData !== msgFilter1.canData){
							if(filter2 !== ""){
								msgFilter2 = JSON.parse(filter2);						
								if(canId !== msgFilter2.canId && canData !== msgFilter2.canData){
									//console.log(canId + " filter2 can id : "+msgFilter2.canId + " // "+canData + "filter2 can data : "+msgFilter2.canData);
									ws.send(jsonData);
								}		
							}else{
								ws.send(jsonData);
							}
						}			
					}else{
						msgFilter2 = JSON.parse(filter2);						
						if(canId !== msgFilter2.canId && canData !== msgFilter2.canData){
							//console.log(canId + " filter2 can id : "+msgFilter2.canId + " // "+canData + "filter2 can data : "+msgFilter2.canData);
							ws.send(jsonData);
						}	
					}
				}else{
					ws.send(jsonData);
				}
									
				counter ++;
			}
		});
		
		sock.on('close', function(data) {
			console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
		});			
		
		ws.on('message', function incoming(data) {
			var message = JSON.parse(data);
			console.log(message.type);
			if(message.type == "filter1"){
				console.log("receive filter1");
				if(filter1 == ""){
					console.log("set_filter1");
					filter1 = '{"canId":"'+message.canId+'", "canData":"'+message.canData+'"}';
					setTimeout(function(){
						filter1 = "";
					},message.timer);
				}
			}
			/*if(message.type == "filter2"){
				console.log("receive filter2");
				if(filter2 == ""){
					console.log("set_filter2");
					filter2 = '{"canId":"'+message.canId+'", "canData":"'+message.canData+'"}';
					setTimeout(function(){
						filter2 = "";
					},message.timer);
				}
			}*/
			if(message.type == "signal"){
				var msgBuff = new Buffer(message.msg, 'hex');
				
				udpClient.send(msgBuff, 0, 36, PORT2, HOST2);
				console.log(message.msg);
			}
		});
		
	}).listen(PORT, HOST);	
	
});

