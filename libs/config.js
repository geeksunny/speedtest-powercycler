function pickEnvironmentValue(envKey, defValue) {
    let value = process.env[envKey];
    return (typeof value === "undefined") ? defValue : value;
}

module.exports = {
    speedtest: {
        apiKey: pickEnvironmentValue("SPEEDTEST_API_KEY", "12345678"),
        disableUploadTest: pickEnvironmentValue("SPEEDTEST_DISABLE_UPLOAD_TEST", true),
        enableDebugMode: pickEnvironmentValue("SPEEDTEST_ENABLE_DEBUG_MODE", false),
        timeout: pickEnvironmentValue("SPEEDTEST_TIMEOUT", 90000)
    },
    command: {
        sshServer: pickEnvironmentValue("COMMAND_SSH_SERVER", undefined),
        sshCommand: pickEnvironmentValue("COMMAND_SSH_COMMAND", undefined),
        sshConfig: pickEnvironmentValue("COMMAND_SSH_CONFIG", {})
    }
};