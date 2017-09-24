module.exports = {

    extendObject(target) {
        const sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (let prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    },

    execSsh(server, cmd, config) {
        const sequest = require('sequest');
        config.command = cmd;
        sequest(server, config, function(err, stdout) {
            if (err) console.error(err);
            console.log(stdout);
        });
    },

    execShell(cmd) {
        const exec = require('child_process').exec;
        function puts(error, stdout, stderr) {
            // TODO: error/stderr ??
            console.log(stdout);
        }
        exec(cmd, puts);
    }

};
