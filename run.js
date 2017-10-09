//const Powercycle = require('./powercycle.js');
//let cycler = new Powercycle();
//cycler.toggleTimed(5000);

const Speedtest = require('./libs/speedtest.js');
const tools = require('./libs/tools.js');
const config = require('./libs/config.js');

const callbacks = {
    onresult: function(result) {
        console.log(result);
        if (result.success) {
            if (result.down <= 250) {
                tools.execSsh(config.command.sshServer, config.command.sshCommand, config.command.sshConfig);
            }
        }
    }
};


(async function() {

    const tester = await Speedtest.build(config.speedtest.apiKey, {}, callbacks);
    tester.enableDebugMode(config.speedtest.enableDebugMode);
    tester.disableUploadTest(config.speedtest.disableUploadTest);
    await tester.start();
    await tester.awaitResult(config.speedtest.timeout);
    // await tester.stop();
    console.log("done");

})();
