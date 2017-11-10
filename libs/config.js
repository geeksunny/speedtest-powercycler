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
        lowThreshold: pickEnvironmentValue("SPEEDTEST_LOW_THRESHOLD", 250),
        cfg: {
            conntype: pickEnvironmentValue("SPEEDTEST_CONNTYPE", undefined),
            bufferbloat: pickEnvironmentValue("SPEEDTEST_BUFFERBLOAT", false),
            hz: pickEnvironmentValue("SPEEDTEST_HZ", 2)
        }
    },
    powercycle: {
        duration: pickEnvironmentValue("POWERCYCLE_DURATION", 10000),
        device: pickEnvironmentValue("POWERCYCLE_DEVICE", "/dev/ttyS0")
    },
    command: {
        exec: pickEnvironmentValue("COMMAND_EXEC", "node ./cycle.js"),
        useSSH: pickEnvironmentValue("COMMAND_USE_SSH", false),
        sshServer: pickEnvironmentValue("COMMAND_SSH_SERVER", undefined),
        sshConfig: pickEnvironmentValue("COMMAND_SSH_CONFIG", {})
    },
    Option: function(key, name, description, defaultValue) {
        return {
            key: key,
            name: name,
            description: description,
            default: defaultValue,
            type: typeof(defaultValue)
        };
    }
};