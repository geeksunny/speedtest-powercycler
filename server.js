//

const Speedtest = require('./libs/speedtest.js');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/html/index.html');
});
app.get('/jquery.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery/dist/jquery.slim.js');
});

io.on('connection', function(socket) {
    console.log('a user connected.');

    const sendBack = function(data) {
        socket.emit("update", data);
    };
    const callbacks = {
        oncomplete: sendBack,
        onerror: sendBack,
        onprogress: sendBack,
        onstatus: sendBack,
        onconfirm: sendBack,
        onresult: function(result) {
            socket.emit("finished", result);
        }
    };
    let test = undefined;
    Speedtest.build("12345678", {}, callbacks).then(function(result) {
        test = result;
        test.enableDebugMode(true);
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