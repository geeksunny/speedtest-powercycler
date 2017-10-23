const Speedtest = require('./libs/speedtest.js');
const tools = require('./libs/tools.js');
const config = require('./libs/config.js');

// TODO: make this code accessible to server.js
const callbacks = {
    onresult: function(result) {
        console.log(result);
        if (result.down <= cfg.speedtest.lowThreshold) {
            console.log("Download speed was at or below the threshold.");
            if (cfg.command.useSSH) {
                console.log("Executing command via SSH.");
                tools.execSsh(config.command.sshServer, config.command.exec, config.command.sshConfig);
            } else {
                console.log("Executing command in local shell.");
                tools.execShell(config.command.exec);
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
