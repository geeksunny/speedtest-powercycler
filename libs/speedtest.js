//
//
const util = require('util');
const tools = require('./tools');
const phantom = require('phantom');
const Waiter = require('./waiter');

// TODO: Look in to making this injectable into phantom/run.html
//const SPEEDTEST_URL = "https://www.dslreports.com/assets/st/1.6/js/speedtest.js";
//const SPEEDTEST_API_KEY = "12345678";

const SPEEDTEST_URL = "./phantom/run.html";
const DEBUG_LOG_FORMAT = "[DEBUG] :: %s\n";
const CLICK_DELAY_DEFAULT = 2000;


// TODO: Add documentation and include the info below
const DEFAULT_CONFIG = {
    // ["GPRS", "3G", "4G", "WiFi", "Wireless", "Satellite", "DSL", "Cable", "Fiber", "", "Unsure"]
    conntype: undefined,
    // [ true: complete results, false: faster results ]
    bufferbloat: false,
    // [ 4: fastest, 2: default, 1: slowest ]
    hz: 2//,
    // [ optional user data ]
    //udata: {"key":value};
};


function PhantomLogger(prefix, disabled) {
    this.prefix = (typeof prefix !== "undefined") ? prefix : "PhantomJS";
    this.disabled = (typeof prefix !== "object") ? disabled : {};
}

PhantomLogger.prototype.warn = function(msg) {
    this.log("warn", msg);
};

PhantomLogger.prototype.debug = function(msg) {
    this.log("debug", msg);
};

PhantomLogger.prototype.error = function(msg) {
    this.log("error", msg);
};

PhantomLogger.prototype.info = function(msg) {
    this.log("info", msg);
};

PhantomLogger.prototype.log = function(type, msg) {
    // TODO: Check disabled list OR ALTERNATIVELY: null out the functions at construction
    if (typeof this.disabled[type] !== "undefined") {
        return; // TODO: Verify that this logic is OK
    }
    let log = util.format("[%s::%s] %s\n", this.prefix, type, msg);
    console.log(log);
};


function Speedtest(apiKey, config, callbacks) {
    this.running = false;
    this.debugMode = false;

    this.phantom = null;
    this.page = null;

    this.callbacks = tools.extendObject({}, callbacks);
    this.config = tools.extendObject({}, DEFAULT_CONFIG, config);
    this.config.apiKey = apiKey;
}

Speedtest.build = async function(apiKey, config, callbacks) {
    const speedtest = new Speedtest(apiKey, config, callbacks);
    await speedtest.doInit();
    return speedtest;
};

Speedtest.prototype.doInit = async function() {
    this.phantom = await phantom.create(
        ['--web-security=no', '--local-to-remote-url-access=true'], { /*logger: new PhantomLogger()*/ });
    this.page = await this.phantom.createPage();
    await this.page.setting('userAgent',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.91 Safari/537.36');
    await this.page.on('onConsoleMessage', function (msg) {
        console.log("PhantomJS :: "+msg);
    });
    await this.page.on('onResourceRequested', true, function(reqData, netReq) {
        const _url = reqData.url.trim();
        const _prefix = _url.substr(0, 7);
        if (_prefix === "file://") {
            const _check = _url.substr(7, 1);
            if (_check !== "/") {
                netReq.changeUrl(_url.replace("file://","https://"));
            }
        }
    });
    // await this.page.on('onError', function(msg, trace) {
    //     console.log("phantom.onError: "+msg);
    // });
    const parent = this;
    await this.page.on('onCallback', function(data) {
        parent.handleEvent(data);
    });
    // await this.page.on('onCallback', this.handleEvent);  // TODO: DOES THIS WORK? Verify!
    await this.page.open(SPEEDTEST_URL).then(function(status) {
        // TODO: Check status, throw error if necessary
        // console.log("Page open status: "+status);
    });
};

Speedtest.prototype.doCleanup = async function() {
    await this.phantom.exit();
};


Speedtest.prototype.start = async function(msDelayClick) {
    this.running = true;
    const delay = (msDelayClick > 0) ? msDelayClick : CLICK_DELAY_DEFAULT;
    await Waiter.sleep(delay);
    const cmd = util.format('function(){ start(%s); }', JSON.stringify(this.config));
    await this.page.evaluateJavaScript(cmd);

};

Speedtest.prototype.stop = async function() {
    await this.page.evaluateJavaScript('function(){ stop(); }');
    // TODO: the line above should trigger an "oncomplete" signal that will call .doFinish(). Verify.
    // await this.doFinish();
};

Speedtest.prototype.handleEvent = async function(data) {
    const callback = this.callbacks[data.key];
    this.handleCallback(data.data, callback);
    switch (data.key) {
        case "oncomplete":
        case "onerror":
            await this.doFinish();
            break;
        case "onstatus":
        case "onprogress":
        case "onconfirm":
        default:
            //
            break;
    }
};

Speedtest.prototype.doFinish = async function() {
    this.running = false;
    await this.doCleanup();
};

Speedtest.prototype.awaitResult = async function(timeout) {
    let waiter = Waiter.start()
        .timeout(timeout)
        .waitFor(function() {
            return this.running === false;
        })
        .afterwards(function(timedout) {
            //
            console.log("Waiter timed out: "+timedout);
        });
    await waiter.go();
};


Speedtest.prototype.enableDebugMode = function(bool) {
    this.debugMode = bool === true;
};

Speedtest.prototype.handleCallback = function(data, delegate) {
    const result = (delegate instanceof Function) ? delegate(data) : false;
    if (result !== true && this.debugMode) {
        const line = util.format(DEBUG_LOG_FORMAT, JSON.stringify(data));
        console.log(line);
    }
};

module.exports = Speedtest;