//
//
const phantom = require('phantom');
const waitUntil = require('wait-until');

const EVENT_NAME = "phantomHookEvent";
const SPEEDTEST_URL = "https://www.dslreports.com/assets/st/1.6/js/speedtest.js";
const SPEEDTEST_API_KEY = "12345678";


// const DEFAULT_CONFIG = {
//     // ["GPRS", "3G", "4G", "WiFi", "Wireless", "Satellite", "DSL", "Cable", "Fiber", "", "Unsure"]
//     conntype: undefined,
//     // [ true: complete results, false: faster results ]
//     bufferbloat: false,
//     // [ 4: fastest, 2: default, 1: slowest ]
//     hz: 2//,
//     // [ optional user data ]
//     //udata: {"key":value};
// };


function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}


function Speedtest(apiKey, config, callbacks) {
    this._ready = false;
    this._queued = false;
    this._running = false;
    this._debug = false;

    this._config = extend({}, DEFAULT_CONFIG, config, this._prepCallbacks(callbacks));
    this._config.apikey = apiKey;

    this._init();
}


Speedtest.prototype.start = function() {
    if (this._running) {
        return;
    } else if (!this._ready) {
        this._queued = true;
        return;
    }
    this._running = true;
    dslr_speedtest({
        op: 'start',
        params: this._config
    });
};

Speedtest.prototype.stop = function() {
    if (!this._running) {
        return;
    }
    this._running = false;
    dslr_speedtest({ op: 'stop' });
};

Speedtest.prototype.awaitResult = function(timeout) {
    var every = 500;
    var times = timeout / every;
    waitUntil()
        .interval(every)
        .times(times)
        .condition(function() {
            return this._running === false;
        })
        .done(function(result) {
            // if result is false then we timed-out!
        });
};


Speedtest.prototype._prepCallbacks = function(callbacks) {
    return extend({
        onstatus: this._debugLog,
        onprogress: this._debugLog,
        onerror: this._debugLog,
        oncomplete: this._debugLog,
        onconfirm: this._debugLog
    }, callbacks);
};

Speedtest.prototype._init = function() {
    var parent = this;
    // Cache expires in 1 week.
    requestify.get(SPEEDTEST_URL, {cache:{cache:true,expires:604800000}}).then(function(response) {
        // TODO: Does this need to be stored in a context variable?
        vm.runInThisContext(response.getBody());
        parent._ready = true;
        if (parent._queued) {
            parent.start();
        }
    });
};

Speedtest.prototype.enableDebugMode = function(bool) {
    this._debug = bool === true;
};

Speedtest.prototype._debugLog = function(o) {
    if (this._debug) {
        console.log(JSON.stringify(o));
    }
};

// Speedtest.prototype._onStatus = function(o) {
//     // { direction, down, up, ping }
// };
//
// Speedtest.prototype._onProgress = function(o) {
//     // { doing, progress }
// };
//
// Speedtest.prototype._onError = function(o) {
//     // { msg }
//     console.log("Error: "+o.msg);
// };
//
// Speedtest.prototype._onComplete = function(o) {
//     // todo: revisit
//     console.log(JSON.stringify(o));
// };
//
// Speedtest.prototype._onConfirm = function(o) {
// };

module.exports = Speedtest;