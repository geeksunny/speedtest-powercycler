function pickEnvironmentValue(envKey, defValue) {
    let value = process.env[envKey];
    return (typeof value === "undefined") ? defValue : value;
}

module.exports = {
    speedtest: {
        apiKey: pickEnvironmentValue("SPEEDTEST_API_KEY", "12345678"),
        disableUploadTest: pickEnvironmentValue("SPEEDTEST_DISABLE_UPLOAD_TEST", true),
        enableDebugMode: pickEnvironmentValue("SPEEDTEST_ENABLE_DEBUG_MODE", false),
        timeout: pickEnvironmentValue("SPEEDTEST_TIMEOUT", 90000),
        cfg: {
            conntype: pickEnvironmentValue("SPEEDTEST_CONNTYPE", undefined),
            bufferbloat: pickEnvironmentValue("SPEEDTEST_BUFFERBLOAT", false),
            hz: pickEnvironmentValue("SPEEDTEST_HZ", 2)
        }
    },
    command: {
        exec: pickEnvironmentValue("COMMAND_EXEC", "node ./cycle.js"),
        useSSH: pickEnvironmentValue("COMMAND_USE_SSH", false),
        sshServer: pickEnvironmentValue("COMMAND_SSH_SERVER", undefined),
        sshConfig: pickEnvironmentValue("COMMAND_SSH_CONFIG", {})
    }
};