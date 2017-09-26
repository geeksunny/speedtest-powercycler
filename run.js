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
    onresult: function(result) {
        console.log(result);
        if (result.success) {
            if (result.down <= 250) {
                tools.execSsh(sshServer, sshCommand, sshConfig);
            }
        }
    }
};


(async function() {

    const tester = await Speedtest.build(SPEEDTEST_API_KEY, {}, callbacks);
    tester.enableDebugMode(true);
    tester.disableUploadTest(true);
    await tester.start();
    await tester.awaitResult(90000);
    // await tester.stop();
    console.log("done");

})();
