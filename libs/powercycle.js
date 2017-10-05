//
//
const SerialPort = require('serialport');
const Waiter = require('./waiter');


function Powercycle(device) {
    let dev = (typeof device === "undefined") ? '/dev/ttyS0' : device;
    this.port = new SerialPort(dev, {autoOpen:false}, this.simpleCallback);
    this.isBroken = false;
    this.isTimed = false;
}

Powercycle.cycle = function(ms) {
    let time = (typeof ms === "undefined") ? 10000 : ms;
    let cycler = Powercycle.open();
    cycler.toggleTimed(time).then(function(stateChanged) {
        //
    }).catch(function(err) {
        //
    });
}

Powercycle.open = function() {
    let pc = new Powercycle();
    pc.open().then(function(data) {
        //TODO
    }).catch(function (err) {
        //TODO
    });
    return pc;
};

Powercycle.prototype.open = function() {
    return new Promise(function(resolve, reject) {
        this.port.open(function(err) {
            return (err) ? reject(err) : resolve();
        });
    });
};

Powercycle.prototype.close = function() {
    return new Promise(function(resolve, reject) {
        this.port.close(function(err) {
            return (err) ? reject(err) : resolve();
        });
    })
};

Powercycle.prototype.simpleCallback = function(err) {
    if (err) {
        return console.log("Error on serial operation!\n"+err);
    }
};

Powercycle.prototype.simplePromise = new Promise(function(resolve, reject) {
    resolve(false);
});

Powercycle.prototype.toggle = function() {
    return (this.isTimed) ? this.simplePromise : this.set(!this.isBroken);
};

Powercycle.prototype.toggleTimed = function(time) {
    if (this.isTimed) {
        return this.simplePromise;
    }

    return new Promise(function(resolve, reject) {
        let parent = this;
        this.toggle().then(function(data) {
            parent.isTimed = true;
            return Waiter.sleep(time);
        }).then(function(data) {
            parent.isTimed = false;
            return parent.toggle();
        }).then(function(data) {
            resolve(true);
        }).catch(function(err) {
            reject(err);
        });
    });
};

Powercycle.prototype.enable = function() {
    return (!this.isBroken) ? this.set(true) : this.simplePromise;
};

Powercycle.prototype.disable = function() {
    return (this.isBroken) ? this.set(false) : this.simplePromise;
};

Powercycle.prototype.set = function(breakState) {
    return new Promise(function(resolve, reject) {
        if (this.isBroken === breakState || this.isTimed) {
            resolve(false);
        }
        this.isBroken = breakState;
        this.port.set({brk:breakState}, function(err) {
            return (err) ? reject(err) : resolve(true);
        });
    });
};

module.exports = Powercycle;