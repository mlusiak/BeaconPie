var constants = require('./lib/constants');
var ble = require('./lib/bluetooth');
var uart = require('./lib/uart')

var SerialPort = require('serialport').SerialPort;
var serial = new SerialPort("/dev/ttyS0", {baudRate:"115200", parity:"none"});


function setAdvertisingPackage(advertiser, powerLevel, interval, localName) {
	writeBuffer(uart.buildEnableBuffer(advertiser));
	writeBuffer(uart.buildPowerBuffer(advertiser, powerLevel));
	writeBuffer(uart.buildIntervalBuffer(advertiser, interval));
	writeBuffer(uart.buildAdvertisementBuffer(advertiser, localName));
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
	console.log('Response: ' + uart.parseResponse(data));
}); 
