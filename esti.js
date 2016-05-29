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


serial.on("open", function () {
	console.log('Serial port open');

	var enable = new Buffer(4);
	enable[0] = 0x73;
	enable[1] = 0x10;
	enable[2] = 0x01;
	enable[3] = 0x65;

	var power = new Buffer(4);
	power[0] = 0x73;
	power[1] = 0x11;
	power[2] = 0x04;
	power[3] = 0x65;

	var interval = new Buffer(5);
	interval[0] = 0x73;
	interval[1] = 0x12;
	interval[2] = 0x20;
	interval[3] = 0x03;
	interval[4] = 0x65;

	var elvis = new Buffer(32);
	elvis[0] = 0x73; 
	elvis[1] = 0x13;
	elvis[2] = 0x42;
	elvis[3] = 0x11; 
	elvis[4] = 0x00;  
	elvis[5] = 0x30; 
	elvis[6] = 0xCF; 
	elvis[7] = 0x49; 
	elvis[8] = 0xE3; 
	elvis[9] = 0xEC; 
	elvis[10] = 0x2F;
	elvis[11] = 0x02 
	elvis[12] = 0x01; 
	elvis[13] = 0x04; 
	elvis[14] = 0x07; 
	elvis[15] = 0x09; 
	elvis[16] = 'M'; 
	elvis[17] = 'I'; 
	elvis[18] = 'C'; 
	elvis[19] = 'H'; 
	elvis[20] = 'A'; 
	elvis[21] = 'L';
	elvis[22] = 0x00; 
	elvis[23] = 0x00; 
	elvis[24] = 0x00; 
	elvis[25] = 0x00; 
	elvis[26] = 0x00; 
	elvis[27] = 0x00; 
	elvis[28] = 0x00; 
	elvis[29] = 0x00; 
	elvis[30] = 0x00; 
	elvis[31] = 0x65; 

	serial.on('data', function(data) {
		console.log('Response: ' + parseResponse(data));
	}); 

	write = function(buffer) {  
		serial.write(buffer, function(error, result) {
    			if (error) console.log('Error ' + error);
			console.log('Bytes written ' + result);
  		});
	}
	

	//write(enable);
	//write(power);
	//write(interval);
	write(elvis);

});
