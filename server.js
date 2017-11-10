const Speedtest = require('./libs/speedtest.js');
const config = require('./libs/config.js');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('html'));
app.get('/js/jquery.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery/dist/jquery.js');
});

const options = {
    speedtest: [
        config.Option("disableUploadTest", "Skip Upload Test",
            "Stop the test after download.", config.speedtest.disableUploadTest),
        config.Option("lowThreshold", "Low Speed Threshold",
            "Minimum download speed before powercycling.", config.speedtest.lowThreshold),
        config.Option("timeout", "Speed Test Timeout", "", config.speedtest.timeout),
    ],
    powercycle: [
        // TODO: Option for disabling powercycling feature
        config.Option("duration", "Powercycle Duration",
            "How long the powercycle event should last.", config.powercycle.duration)
    ]
};

io.on('connection', function(socket) {
    console.log('a user connected.');

    const sendBack = function(key) {
        return function(data) {
            socket.emit("update", { key:key, data:data });
        };
    };
    const callbacks = {
        oncomplete: sendBack('oncomplete'),
        onerror: sendBack('onerror'),
        onprogress: sendBack('onprogress'),
        onstatus: sendBack('onstatus'),
        onconfirm: sendBack('onconfirm'),
        onresult: function(result) {
            socket.emit("finished", result);
        }
    };
    let test = undefined;
    Speedtest
        .build(config.speedtest.apiKey, config.speedtest.cfg, callbacks)
        .then(function(result) {
            test = result;
            test.enableDebugMode(config.speedtest.enableDebugMode);
            test.disableUploadTest(config.speedtest.disableUploadTest);
            socket.emit('ready', options);
        });
    function setTestOption(key, value) {
        switch (key) {
            case 'disableUploadTest':
                test.disableUploadTest(value);
                break;
            case 'lowThreshold':
                // TODO: Make this configurable from outside of Speedtest.js
                break;
            case 'timeout':
                // TODO: Make this configurable from outside of Speedtest.js
                break;
            case 'duration':
                // TODO: Implement the powercycle task execution
                break;
            default:
                console.log('Invalid configuration option presented: ('+key+'),('+value+')');
                break;
        }
    }

    socket.on('configure', function(data) {
        console.log('Configuration passed: '+JSON.stringify(data));
        if (data.options && Array.isArray(data.options)) {
            for (let option in data.options) {
                setTestOption(option.key, option.value);
            }
        } else {
            console.log('Configuration data invalid.');
        }
    });
    socket.on('start', function() {
        console.log('Starting test...');
        test.start();
    });
    socket.on('stop', function() {
        console.log('Stopping test...');
        test.stop();
    });
    socket.on('disconnect', function() {
        console.log('User disconnected...');
        test.stopIfRunning();
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});