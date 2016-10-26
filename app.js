const Promise = require('bluebird');
const express = require('express');
const morgan = require('morgan');
const request = require('request');

const config = require('./config/main');
const socket = require('./services/socket');
const parrot = require('./bots/parrot');

socket.connect(config.url);
socket.on('message', function (packet) {
    if(packet && packet.type == 'CMD')
    setImmediate(function () {
        parrot.dispatch(packet);
    });
});

let app = express();
app.use(morgan('tiny'));

require('./controllers/web')(app);

app.listen(config.port, config.host, function() {
    console.log('Listening on ' + config.host + ':' + config.port);
    // setInterval(function() {
    //     request(config.url);
    // }, 600000);
});
