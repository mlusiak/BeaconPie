var constants = require('./lib/constants');
var uart = require('./lib/uart');

var SerialPort = require('serialport').SerialPort;
var serial = new SerialPort("/dev/ttyAMA0", {baudRate:"115200", parity:"none"});

serial.on("open", function () {
	console.log('Serial port open');
});

serial.on('data', function(data) {
	console.log('Received data: ' + uart.parseResponse(data));
}); 

writeBuffer = function(buffer) {  
	serial.write(buffer, function(error, result) {
		if (error) console.log('Error ' + error);
		console.log('Bytes written ' + result);
	});
}


module.exports = {
	enableAdvertiser:enableAdvertiser,
	disableAdvertiser:disableAdvertiser,
	setBroadcastingPower:setBroadcastingPower,
	setBroadcastingInterval:setBroadcastingInterval,
	setLocalName:setLocalName,
	setAdvertisingPacket:setAdvertisingPacket
}

function enableAdvertiser(advertiser) {
	var register = uart.getRegister(advertiser);
	writeBuffer(uart.buildEnableBuffer(register));
}

function disableAdvertiser(advertiser) {
	var register = uart.getRegister(advertiser);
	writeBuffer(uart.buildDisableBuffer(register));
}

function setBroadcastingPower(advertiser, powerLevel) {
	var register = uart.getRegister(advertiser);
	writeBuffer(uart.buildPowerBuffer(register, powerLevel));
}

function setBroadcastingInterval(advertiser, interval) {
	var register = uart.getRegister(advertiser);
	writeBuffer(uart.buildIntervalBuffer(register, interval));
}

function setLocalName (advertiser, localName) {
	var register = uart.getRegister(advertiser);
	writeBuffer(uart.buildAdvertisementBuffer(register, localName));
}

function setAdvertisingPacket(advertiser, powerLevel, interval, localName) {
	enableAdvertiser(advertiser);
	setBroadcastingPower(advertiser, powerLevel);
	setBroadcastingInterval(advertiser, interval);
	setLocalName(advertiser, localName);
}