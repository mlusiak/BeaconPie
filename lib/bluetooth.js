module.exports = {
    generateMacAddress:generateMacAddress
}

function generateMacAddress() {
    var macAddress = new Array(6);
    macAddress[0] = Math.floor(Math.random() * (256 - 192 + 1)) + 192;
    
    for (var i = 1; i < 6; i++) {
        macAddress[i] = Math.floor(Math.random() * (256))
    }

    return macAddress;
}