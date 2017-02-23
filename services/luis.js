const Promise = require('bluebird');
const express = require('express');
const request = Promise.promisifyAll(require('request'));
const co = require('coroutinify');
const bing = require('../services/bing');
const gallery = require('../services/gallery');

const answers = {
    thanks: [
        'You are welcome.',
        'I\'m glad to help you.',
        'Don’t mention it.',
        'No worries.',
        'Not a problem.',
        'My pleasure.',
        'I’m happy to help.',
        'Anytime.',
        'That\'s all right'
    ],
    greeting: [
        'Hi!',
        'Hello!',
        'Hi, what\'s up?',
        'Hey, how are things?',
        'Hi, what’s going on?',
        'Good to see you.',
        'Nice to see you.',
        'Yo!'
    ],
    jobs: [
        'Here are some open positions right now: Backend Developer, Frontend Developer, IOS Developer, IT Technical Support Engineer, JAVA Developer, Research Scientist: Machine Learning. \nFor the full list and further details please visit https://picsart.com/jobs/',
        'Open positions are Backend Developer, Frontend Developer, IOS Developer, IT Technical Support Engineer, JAVA Developer, Research Scientist: Machine Learning.'
    ],
    curse: [
        'Why you are so rude. Are you OK?',
        'What\'s up? Why are you so offensive?'
    ],
    none: [
        'I\'m afraid I don\'t understand. I\'m sorry!',
        'What did you say?',
        'What do you mean?',
        'I don\'t understand.',
        'Sorry, I did not catch that.',
        'Sorry, that went right over my head.',
        'I missed that.',
        'I don\'t get it.',
        'Do you mind explaining it again?',
        'I’m afraid it is not clear what you saying.',
        'Would you mind clarifying what you said?',
        'I don’t catch what you said. Sorry.'
    ],
    me: [
        'Me. I\'m not LUIS, I\'m a bot.',
        'I\'m sure only that I\'m not Tom Brady.'
    ]
}

class LuisService {
    constructor () {
        this.url = process.env.LUIS_URL;
        return co(this);
    }

    *request (text) {
        let res = JSON.parse((yield request.getAsync(this.url + text)).body);
        let winner = res.intents.reduce((pre, cur) => { return pre.score > cur.score ? pre: cur });
        res.winner = winner;
        return res;
    }

    *answer (text) {
        let res = yield this.request(text);
        if(!res || !res.winner || res.winner.score < 0.1) return this.none();
        switch(res.winner.intent.toLowerCase()) {
            case 'greeting':
                return this.greet(res);
            break;
            case 'help':
                return this.help(res)
            break;
            case 'suggestion':
                return this.suggest(res);
            break;
            case 'job':
                return this.getJobs(res);
            break;
            case 'thanks': return this.thank(res);
            break;
            case 'search': return this.search(res);
            break;
            case 'curse': return this.curse(res);
            break;
            case 'me': return this.me(res);
            break;
            case 'preference': return this.prefer(res);
            break;
            case 'news':
                return 'Soon you\'ll be able to chat with your friends, send images and challenge each other. Isn\'t it AWESOME?!'
            break;
            default: return this.none();
        }
    }

    *help(res) {
        if(res.winner && res.winner.actions && res.winner.actions[0] && res.winner.actions[0].triggered && res.winner.actions[0].parameters) {
            let result = yield bing.webSearch(res.query);
            console.dir(res.winner.actions[0].parameters);
            if(result) return result;
            if(parsed.actions[0].parameters.question == 'who') {
                let result = yield bing.webSearch(res.query);
                return result;
            }
        }
        return 'How can I help you?';
    }

    *greet(res) {
        return this.randomPhrase(answers.greeting);
    }

    *suggest(res) {
        let subject = this.getEntity(res, 'subject');
        console.log(subject);
        if(/(photo|image|picture)/.test(subject)) {
            let photos = yield gallery.getPopularImages();
            let attachments = photos.map((el) => { return { image_url: el.url, fallback: el.title }; });//.join('\n');
            return {text: 'Here are some AWESOME ' + subject + '.',  attachments: attachments};
        }
        return this.none();//'Do you want to watch some Awesome photos?';
    }

    *thank(res) {
        return this.randomPhrase(answers.thanks);
    }

    *getJobs(res) {
        return this.randomPhrase(answers.jobs);
    }

    *search(res) {
        let result = yield bing.webSearch(res.query);
        return result.text + '\n For further details go to ' + result.url;
    }

    *prefer(res) {

    }

    *curse(res) {
        return this.randomPhrase(answers.curse);
    }

    *me(res) {
        return this.randomPhrase(answers.me);
    }

    *none() {
        return this.randomPhrase(answers.none);
    }

    randomPhrase (phrases) {
        let length = phrases.length;
        let idx = Math.floor(Math.random()*length);
        return phrases[idx];
    }

    getEntity(res, type) {
        if(res && res.entities && res.entities.length > 0) {
            let entity = res.entities.filter((el) => {
                return el.type == type;
            });
            return entity && entity[0] ? entity[0].entity : '';
        }
        return '';
    }
}

module.exports = new LuisService();
module.exports.LuisService = LuisService;
