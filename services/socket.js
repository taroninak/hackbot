const EventEmitter = require('events');
const util = require('util');
const WebSocket = require('ws');

class Socket extends EventEmitter {

    constructor () {
        super();
    }

    setUrl(url) {
        this.url = url;
    }

    connect (url) {
        this.ws = new WebSocket(url);

        this.url = url;

        this.ws.on('open', () => {
            console.log('Connection established!');
            setInterval(() => {
                this.ping();
            }, 60000);

            this.timeout = setInterval(() => {
                this.ws.close();
            }, 6000000);
        });

        this.ws.on('close', () => {
            console.log('Connection closed!');
            clearInterval(this.timeout);
            this.connect(this.url);
        });

        this.ws.on('message', (packet, flags) => {
            console.log('>' + packet);
            packet = JSON.parse(packet);
            this.dispatch(packet);
        });
    }

    dispatch (packet) {
        switch(packet.type) {
            case 'message' : this.emit('message', packet);
            break;
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
