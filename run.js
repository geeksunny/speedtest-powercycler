//const Powercycle = require('./powercycle.js');
//let cycler = new Powercycle();
//cycler.toggleTimed(5000);

const Speedtest = require('./libs/speedtest.js');
const tools = require('./libs/tools.js');

const SPEEDTEST_API_KEY = "12345678";


const sshServer = "";
const sshCommand = "ls -al";
const sshConfig = {
};

const callbacks = {
    oncomplete: function(o) {
        // todo: try/catch/etc
        tools.execSsh(sshServer, sshCommand, sshConfig);
    },
    onerror: function(o) {
        // todo: dump log, end the process
        console.log(o);
    }
};


(async function() {

    const tester = await Speedtest.build(SPEEDTEST_API_KEY, {}, callbacks);
    tester.enableDebugMode(true);
    await tester.start();
    tester.awaitResult();
    // await tester.stop();
    console.log("done");

})();
