var SerialPort = require('serialport').SerialPort;
var constants = require('./constants');

var serial = new SerialPort("/dev/ttyS0", {baudRate:"115200", parity:"none"});

function parseResponse(data) {
	var i = 0,
	    len = data.length,
	    r;
	
	for (; i<len; i+=1) {
		hexString = data[i].toString(16);
		if (hexString!=65 && hexString!=73) r = "0x0" + hexString;
	}

	return r;
}

function generateMacAddress() {
    var macAddress = new Array(6);
	macAddress[0] = Math.floor(Math.random() * (256 - 192 + 1)) + 192; //first part starting with two '1' bits
    for (var i = 1; i < 6; i++) {
        macAddress[i] = Math.floor(Math.random() * (256))
    }

    return macAddress;
}

function buildEnableBuffer(advertiser) {
	return new Buffer([constants.START_BYTE, advertiser, 0x01, constants.STOP_BYTE]);
}

function buildPowerBuffer(advertiser, powerLevel) {
	//TODO add validation / fixing - only predefined power levels are allowed
	
	return new Buffer([constants.START_BYTE, advertiser + 1, powerLevel, constants.STOP_BYTE]);
}

function buildIntervalBuffer(advertiser, interval) {
	//TODO change interval int into LSB-encoded two-bytes
	
	return new Buffer([constants.START_BYTE, advertiser + 2, 0x20, 0x03, constants.STOP_BYTE]);
}

function buildAdvertisementBuffer(advertiser, localName) {
	
	var mac = generateMacAddress();
	
	var adv = {

		start: 			[constants.START_BYTE],

		header: 		[advertiser + 3,											//Register ID: Genertic advertiser 0 - advertising data			
				  		0x42],														//PDU header byte 0: non connectable undirected advertising
						
		packageLength: 	[0x0C + localName.length,									//BLE PDU header byte 1: length in bytes excluding ESCAPE_BYTE
						0x00],														//BLE PDU header byte 2: Allways zero

		mac : 			[mac[5], mac[4], mac[3], mac[2], mac[1], mac[0] ], 			//MAC address

		tcFlag : 		[0x02, 														//Field length 2 bytes	
						0x01, 														//Field type Flags
						0x04,],														//Field Value: BR/EDR not supported

		payloadLength :	[localName.length + 2,		 								//Length of data including flags and payload but excluding ESCAPE_BYTEs
						0x09],														//Field type: Complete Local Name

		payload: 		[],									

		stop:			[constants.STOP_BYTE]
	}
	
	for (i = 0; i < localName.length; i++) {
		var code = localName[i].charCodeAt(0);

		if(code == constants.START_BYTE || code == constants.ESCAPE_BYTE || code == constants.STOP_BYTE) {
			adv.payload.push("\\".charCodeAt(0));
		}
			 
    	adv.payload.push(localName[i].charCodeAt(0));
	}

	adv.payload.push(0x00); // string end

	//create buffer BLE package.
	var buf = adv.start.concat(adv.header, adv.packageLength, adv.mac, adv.tcFlag, adv.payloadLength, adv.payload, adv.stop);
	return new Buffer(buf);
}

function setAdvertisingPackage(advertiser, powerLevel, interval, localName) {
	writeBuffer(buildEnableBuffer(advertiser));
	writeBuffer(buildPowerBuffer(advertiser, powerLevel));
	writeBuffer(buildIntervalBuffer(advertiser, interval));
	writeBuffer(buildAdvertisementBuffer(advertiser, localName));
}

writeBuffer = function(buffer) {  
	serial.write(buffer, function(error, result) {
			if (error) console.log('Error ' + error);
		console.log('Bytes written ' + result);
	});
}

serial.on("open", function () {
	console.log('Serial port open');
	setAdvertisingPackage(constants.GA0, 0x04, 800, "Test");
});

serial.on('data', function(data) {
	console.log('Response: ' + parseResponse(data));
}); 
