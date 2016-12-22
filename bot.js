const builder = require('botbuilder');
const config = require('./config/main');

// Real Server Connector
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// ConsoleConnector
// const connector = new builder.ConsoleConnector().listen();


// Bot
const bot = new builder.UniversalBot(connector);
bot.dialog('/', function (session) {
   session.send('Hello World');
});

// Server
const restify = require('restify');
const server = restify.createServer();

server.post('/api/messages', connector.listen());

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});
