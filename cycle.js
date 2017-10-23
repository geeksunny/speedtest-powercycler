const Powercycle = require('./libs/powercycle.js');
const config = require('./libs/config.js');


console.log("Beginning powercycle | duration: " + config.powercycle.duration + "ms")
Powercycle.cycle(config.powercycle.duration)
    .then(function(data) {
        console.log("Finished timed powercycle operation!");
    }).catch(function(err) {
        console.log("An error occurred during the powercycle operation.\n" + err)
    }
);