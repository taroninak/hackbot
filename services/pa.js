const EventEmitter = require('events');
const util = require('util');
const co = require('coroutinify');
const socket = new (require('../services/socket')).Socket();
const luis = require('../services/luis');
const config = require('../config/main');

class PA extends EventEmitter {
    constructor() {
        super();
        return co(this);
    }

    *dispatch (message) {
        if(message.type == 'CMD' && message.action.toLowerCase() == 'get_message') {
            if(message.data.type == 'image') {
                let content = JSON.parse(message.data.content);
                content.url = 'http://cdn110.picsart.com/215180466000202.jpg';
                message.data.content = JSON.stringify(content);
            }
            let answer = yield luis.answer(message.data.content);
            if(typeof answer == 'object') {
                let packet = {
                    id: 'client:' + String(parseInt(new Date().getTime())),
                    type: 'CMD',
                    action: 'send_message'
                };
                packet.data = message.data;
                packet.data.type = 'plain';
                packet.data.content = answer.text;
                socket.send(packet);
                for(let idx in answer.attachments) {
                    packet.data.type = 'fte';
                    packet.data.content = JSON.stringify({ url: answer.attachments[idx].image_url });
                    socket.send(packet);
                }
            } else {
                message.data.content = answer;
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

    *start() {
        socket.connect(config.url);
        socket.on('message', (packet) => {
            if(packet && packet.type == 'CMD') {
                setImmediate(() => {
                    this.dispatch(packet);
                });
            }
        });
    }

}

module.exports = new PA();
module.exports.PA = PA;
