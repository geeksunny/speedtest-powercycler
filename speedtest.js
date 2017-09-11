//
//
const util = require('util');
const phantom = require('phantom');
const waitUntil = require('wait-until');

// TODO: Look in to making this injectable into phantom/run.html
//const SPEEDTEST_URL = "https://www.dslreports.com/assets/st/1.6/js/speedtest.js";
//const SPEEDTEST_API_KEY = "12345678";

const SPEEDTEST_URL = "./phantom/run.html";
const DEBUG_LOG_FORMAT = "[DEBUG] :: %s\n";
const EVENT_NAME = "phantomHookEvent"; // TODO: Should this be injected into/retrieved from the phantom_runner.js?
const WAIT_INTERVAL = 500;          // 0.5s
const WAIT_TIMEOUT_DEFAULT = 60000; // 60s


// TODO: Implement using node-phantom examples: https://github.com/amir20/phantomjs-node/tree/master/examples

// TODO: Add documentation and include the info below
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
    const sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (const prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}


function Speedtest(apiKey, config, callbacks) {
    this._running = false;
    this._debug = false;

    this._phantom = null;
    this._page = null;

    this._callbacks = extend({}, callbacks);
    this._config = extend({}, DEFAULT_CONFIG, config);
    this._config.apikey = apiKey;
}

Speedtest.build = async function(apiKey, config, callbacks) {
    const speedtest = new Speedtest(apiKey, config, callbacks);
    await speedtest._init();
    return speedtest;
};

Speedtest.prototype._init = async function() {
    this._phantom = await phantom.create();
    this._page = await this._phantom.createPage();
    await this._page.on(EVENT_NAME, function(data) {
        this._handleEvent(data);
    });
    const status = await this._page.open(SPEEDTEST_URL);
    // TODO: Check status, throw error if necessary
};

Speedtest.prototype._cleanup = async function() {
    await this._phantom.exit();
};


Speedtest.prototype.start = async function(timeout) {
    this._running = true;
    const start = util.format('function(){ start(%s); }', JSON.stringify(this._config));
    await this._page.evaluateJavaScript(start);
};

Speedtest.prototype.stop = async function() {
    this.finish();
    await this._page.evaluateJavaScript('function(){ stop(); }');
    // TODO: Stop the speed test on the phantom_runner
};

Speedtest.prototype._handleEvent = function(data) {
    const callback = this._callbacks[data.detail.key];
    this._handleCallback(data.detail.data, callback);
    switch (data.detail.key) {
        case "oncomplete":
        case "onerror":
            this._finish();
            break;
        case "onstatus":
        case "onprogress":
        case "onconfirm":
        default:
            //
            break;
    }
};

Speedtest.prototype._finish = function() {
    this._running = false;
    // TODO: Should run this._cleanup automatically?
    // TODO: Is this method even necessary??
};

Speedtest.prototype.awaitResult = function(timeout) {
    // TODO: Is this still necessary or could it be replaced by async/await?
    const _timeout = (timeout > 0) ? timeout : WAIT_TIMEOUT_DEFAULT;
    const times = _timeout / WAIT_INTERVAL;
    waitUntil()
        .interval(WAIT_INTERVAL)
        .times(times)
        .condition(function() {
            return this._running === false;
        })
        .done(function(result) {
            // todo if result is false then we timed-out!
        });
};


Speedtest.prototype.enableDebugMode = function(bool) {
    this._debug = bool === true;
};

Speedtest.prototype._handleCallback = function(data, delegate) {
    const result = (delegate instanceof Function) ? delegate(data) : false;
    if (result !== true && this._debug) {
        const line = util.format(DEBUG_LOG_FORMAT, JSON.stringify(data));
        console.log(line);
    }
};

module.exports = Speedtest;