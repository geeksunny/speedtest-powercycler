//
//
var SerialPort = require('serialport');


function Powercycle(/**/) {
    this._port = new SerialPort('/dev/ttyS0', this._errorLog);
    this._broken = false;
    this._timed = false;
}


Powercycle.prototype._errorLog = function(err) {
    if (err) {
        return console.log("Error on serial operation!\n"+err);
    }
};


Powercycle.prototype.toggle = function() {
    if (this._timed) {
        return;
    }
    this.set(!this._broken);
};

Powercycle.prototype.toggleTimed = function(time) {
    if (this._timed) {
        return;
    }
    this.toggle();
    this._timed = true;

    var parent = this;
    setTimeout(function() {
        parent._timed = false;
        parent.toggle();
    }, time);
};

Powercycle.prototype.enable = function() {
    if (!this._broken) {
        this.set(true);
    }
};

Powercycle.prototype.disable = function() {
    if (this._broken) {
        this.set(false);
    }
};

Powercycle.prototype.set = function(breakState) {
    if (this._broken === breakState || this._timed) {
        return;
    }
    this._broken = breakState;
    this._port.set({brk:breakState}, this._errorLog);
};

module.exports = Powercycle;