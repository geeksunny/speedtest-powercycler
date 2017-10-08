//

const Speedtest = require('./libs/speedtest.js');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('html'));
app.get('/js/jquery.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery/dist/jquery.js');
});

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
    Speedtest.build("12345678", {}, callbacks).then(function(result) {
        test = result;
        test.enableDebugMode(false);
        test.disableUploadTest(true);
        socket.emit('ready');
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