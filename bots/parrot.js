const EventEmitter = require('events');
const util = require('util');
const socket = require('../services/socket');
const config = require('../config/main');

class Parrot extends EventEmitter {
    constructor() {
        super();
    }

    dispatch (message) {
        if(message.type == 'CMD' && message.action.toLowerCase() == 'get_message') {
            if(message.data.type == 'image') {
                let content = JSON.parse(message.data.content);
                content.url = 'http://cdn110.picsart.com/215180466000202.jpg';
                message.data.content = JSON.stringify(content);
            }
            let packet = {
                id: 'client:' + String(parseInt(new Date().getTime())),
                type: 'CMD',
                action: 'send_message',
                data: message.data
            };
            return socket.send(packet);
        }
    }

}

module.exports = new Parrot();
module.exports.Parrot = Parrot;
