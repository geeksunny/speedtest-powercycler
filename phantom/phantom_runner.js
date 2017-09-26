function sendback(key, data) {
    const payload = { key: key, data: data };
    window.callPhantom(payload);
}


function extendObject(target) {
    const sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

const DEFAULT_CONFIG = {
    conntype: undefined,
    bufferbloat: false,
    hz: 2
};

const CALLBACKS = {
    onstatus: function(o) {
        sendback("onstatus", o);
    },
    oncomplete: function(o) {
        sendback("oncomplete", o);
    },
    onerror: function(o) {
        sendback("onerror", o);
    },
    onconfirm: function(o) {
        sendback("onconfirm", o);
        return true
    },
    onprogress: function(o) {
        sendback("onprogress", o);
    }
};

function start(config) {
    if (typeof window.callPhantom !== 'function') {
        console.log("PhantomJS not detected! Aborting...");
        return;
    }
    if (!config.apiKey) {
        console.log("Field 'apiKey' not defined in config object! Aborting...");
        return;
    }
    const cfg = extendObject({}, DEFAULT_CONFIG, config, CALLBACKS);
    dslr_speedtest({
        op: 'start',
        params: cfg
    });
}

function stop() {
    dslr_speedtest({ op: 'stop' });
}