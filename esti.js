const START_BYTE = 0x73;
const STOP_BYTE = 0x65;
const ESCAPE_BYTE = 0xC5;
const GA0 = 0x10;
const GA1 = 0x20;
const GA2 = 0x30;

var SerialPort = require('serialport').SerialPort;
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

writeBuffer = function(buffer) {  
	serial.write(buffer, function(error, result) {
			if (error) console.log('Error ' + error);
		console.log('Bytes written ' + result);
	});
}


serial.on("open", function () {
	console.log('Serial port open');

	var enable = new Buffer(START_BYTE, GA0, 0x01, STOP_BYTE);
	var power = new Buffer(START_BYTE, GA0 + 1, 0x04, STOP_BYTE);
	var interval = new Buffer(START_BYTE, GA0 + 2, 0x20, 0x03, STOP_BYTE);

	var message = new Buffer(START_BYTE, GAO + 3,0x42,0x10,0x00,0x00,0xBB,0xBB,0xBB,0xBB,0xAE,0x02,0x01,0x04,0x06,0x09,0x45,0x6C,0x76,0x69,0x00,STOP_BYTE);

	writeBuffer(message);
});

serial.on('data', function(data) {
	console.log('Response: ' + parseResponse(data));
}); 
