var Speedtest = require('./speedtest.js');
var Powercycle = require('./powercycle.js');

const SPEEDTEST_API_KEY = "12345678";


var tester;
var cycler = new Powercycle();


var onstatus = function(o) {
    // log?
};

var oncomplete = function(o) {
    // todo: check results, run test?
    cycler.toggleTimed(5000);
};

var onerror = function(o) {
    // todo: dump log, end the process
};

var onconfirm = function(o) {
    // todo: is this needed?
};

var onprogress = function(o) {
    // log?
};

var callbacks = {
    onstatus: onstatus,
    oncomplete: oncomplete,
    onerror: onerror,
    onconfirm: onconfirm,
    onprogress: onprogress
};


tester = new Speedtest(SPEEDTEST_API_KEY, null, callbacks);
tester.start();