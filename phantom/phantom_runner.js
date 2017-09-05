const EVENT_NAME = "phantomHookEvent";


function dispatch(key, data) {
    var ev = new CustomEvent(EVENT_NAME, {
        detail: {
            key: key,
            data: data
        }
    });
    document.dispatchEvent(ev);
}

var onstatus = function(o) {
    dispatch("onstatus", o);
};

var oncomplete = function(o) {
    dispatch("oncomplete", o);
};

var onerror = function(o) {
    dispatch("onerror", o);
    // return true ?
};

var onconfirm = function(o) {
    dispatch("onconfirm", o);
    // return true ?
};

var onprogress = function(o) {
    dispatch("onprogress", o);
};

var defaultConfig = {
    conntype: undefined,
    bufferbloat: false,
    hz: 2,
    onstatus: onstatus,
    oncomplete: oncomplete,
    onerror: onerror,
    onconfirm: onconfirm,
    onprogress: onprogress
};


function start(config) {
    var cfg = extend({}, defaultConfig, config);
    if (!config.apikey) {
        console.log("Field 'apikey' not defined in config object! Aborting...");
        return;
    }
    dslr_speedtest({
        op: 'start',
        params: cfg
    });
}

function stop() {
    dslr_speedtest({ op: 'stop' });
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
