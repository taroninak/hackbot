const Promise = require('bluebird');
const express = require('express');
const morgan = require('morgan');
const request = require('request');

const config = require('./config/main');
const parrot = require('./bots/parrot');
const pa = require('./services/pa');
const slack = require('./services/slack');

//slack.start();
pa.start();
let app = express();
app.use(morgan('tiny'));

require('./controllers/web')(app);

app.listen(config.port, config.host, function() {
    console.log('Listening on ' + config.host + ':' + config.port);
    setInterval(function() {
        request('https://hackbot-slack.herokuapp.com/');
    }, 600000);
});
