const Promise = require('bluebird');
const co = require('coroutinify');
const EventEmitter = require('events');
const request = Promise.promisifyAll(require('request'));
const bot_id = "U2V0FV0F2";
const bot_token = process.env.SLACK_TOKEN;
const socket = new (require('../services/socket')).Socket();

const luis = require('../services/luis');

class User {
    static info (token, id) {
        return request.getAsync('https://slack.com/api/users.info?token=' + token + '&user=' + id)
        .then(function (res) {
            res = JSON.parse(res.body);
            if (!res.ok) throw new Error('Bad request');
            return res.user;
        });
    }
}

class Auth {
    static test (token) {
        return request.getAsync('https://slack.com/api/auth.test?token=' + token)
        .then(function (res) {
            res = JSON.parse(res.body);
            if (!res.ok) throw new Error('Bad request');
            return res;
        });
    }

    static revoke (token, test) {
        return request.getAsync('https://slack.com/api/auth.revoke?token=' + token + '&test=' + test ? true : false)
        .then(function (res) {
            res = JSON.parse(res.body);
            if (!res.ok) throw new Error('Bad request');
            return res;
        });
    }

}

class Rtm {
    static start () {
        return request.getAsync('https://slack.com/api/rtm.start?token=' + bot_token)
        .then(function (res) {
            res = JSON.parse(res.body);
            if (!res.ok) throw new Error('Bad request');
            return res;
        });
    }
}

class Slack extends EventEmitter {
    constructor() {
        super();
        this.started = false;
        return co(this);
    }

    *dispatch(message) {
        if(message.user == bot_id || message.type != 'message' || !message.text) return;
        luis.answer(message.text).then((res) => {
            let packet;
            if(typeof res == 'object') {
                console.dir(res);
                packet = {
                    id: parseInt(message.ts),
                    type: 'message',
                    channel: message.channel,
                    text: res.text
                }
                socket.send(packet);
                for(let idx in res.attachments) {
                    packet.text = res.attachments[idx].image_url;
                    socket.send(packet);
                }
            } else {
                packet = {
                    id: parseInt(message.ts),
                    type: 'message',
                    channel: message.channel,
                    text: res
                };
                socket.send(packet);
            }
            //this.sendMessage(packet);
        });
    }

    *start () {
        console.log('start');
        let url = (yield Rtm.start()).url;
        socket.connect(url);
        socket.on('message', (packet) => {
            if(packet && packet.type == 'message') {
                setImmediate(() => {
                    this.dispatch(packet);
                });
            }
        });
        socket
    }

    *sendMessage(packet) {
        return request.postAsync({ url: 'https://slack.com/api/chat.postMessage?token=' + bot_token, qs: packet}).then((res)=>console.log(res.body)).catch((res)=>console.log(res));
    }
}

module.exports = new Slack();
module.exports.Slack = Slack;
