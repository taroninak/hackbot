const EventEmitter = require('events');
const util = require('util');
const WebSocket = require('ws');

class Socket extends EventEmitter {

    constructor () {
        super();
    }

    connect (url) {
        this.ws = new WebSocket(url);

        let self = this;
        self.url = url;

        this.ws.on('open', function open() {
            console.log('Connection established!');
            setInterval(function () {
                self.ping();
            }, 60000);

            self.timeout = setInterval(function () {
                self.ws.close();
            }, 6000000);
        });

        this.ws.on('close', function close() {
            console.log('Connection closed!');
            clearInterval(self.timeout);
            self.connect(self.url);
        });

        this.ws.on('message', function message(packet, flags) {
            console.log('>' + packet);
            packet = JSON.parse(packet);
            self.dispatch(packet);
        });
    }

    dispatch (packet) {
        switch(packet.type) {
            case 'CMD' : this.emit('message', packet);
                break;
            case 'reconnect_url': this.url = packet.url;
                break;
            default: return;
        }
    }

    send (message) {
        if(this.ws.readyState != WebSocket.OPEN) return;
        if(typeof message == 'string') {
            this.ws.send(message);
        } else {
            this.ws.send(JSON.stringify(message));
        }
    }

    ping () {
        if(this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(JSON.stringify({id: parseInt(new Date().getTime()), type: 'ping'}));
        }
    }
}

module.exports = new Socket();
module.exports.Socket = Socket;
