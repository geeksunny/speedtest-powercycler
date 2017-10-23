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

    // TODO: add catch blocks for any errors that may occur with async functions
    const tester = await Speedtest.build(config.speedtest.apiKey, config.speedtest.cfg, callbacks);
    tester.enableDebugMode(config.speedtest.enableDebugMode);
    tester.disableUploadTest(config.speedtest.disableUploadTest);
    await tester.start();
    await tester.awaitResult(config.speedtest.timeout);
    // await tester.stop();
    console.log("done");

    // TODO: Only output a json object of result. this will get logged with cron.
})();
