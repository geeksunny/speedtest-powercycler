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

const DEFAULT_CONFIG = {
    conntype: undefined,
    bufferbloat: false,
    hz: 2,
    onstatus: function(o) {
        dispatch("onstatus", o);
    },
    oncomplete: function(o) {
        dispatch("oncomplete", o);
    },
    onerror: function(o) {
        dispatch("onerror", o);
        // return true ?
    },
    onconfirm: function(o) {
        dispatch("onconfirm", o);
        return true
    },
    onprogress: function(o) {
        dispatch("onprogress", o);
    }
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
    dispatch("onstatus", {stopped:true});
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
