var constants = require('./lib/constants');
var ble = require('./lib/bluetooth');

module.exports = {
    buildEnableBuffer:buildEnableBuffer,
    buildPowerBuffer:buildPowerBuffer,
    buildIntervalBuffer:buildIntervalBuffer,
    buildAdvertisementBuffer:buildAdvertisementBuffer,
    parseResponse:parseResponse,
	getRegister:getRegister
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
	
	var mac = ble.generateMacAddress();
	
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
		var character = localName[i].charCodeAt(0);

		if(character == constants.START_BYTE || character == constants.ESCAPE_BYTE || character == constants.STOP_BYTE) {
			adv.payload.push("\\".charCodeAt(0));
		}
			 
    	adv.payload.push(character);
	}

	adv.payload.push(0x00); // string end

	//create buffer BLE package.
	var buf = adv.start.concat(adv.header, adv.packageLength, adv.mac, adv.tcFlag, adv.payloadLength, adv.payload, adv.stop);
	return new Buffer(buf);
}

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

function getRegister(advertiser) {
	switch(advertiser) {
		case 0:
			return constants.GA0;
		case 1:
			return constants.GA1;
		case 2:
			return constants.GA2;
		default:
			return constants.GA0;
	}
}