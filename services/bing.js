const Promise = require('bluebird');
const express = require('express');
const request = Promise.promisifyAll(require('request'));
const co = require('coroutinify');

class BingService {
    constructor () {
        this.url = 'https://api.cognitive.microsoft.com/bing/v5.0/search?q=';
        this.key = process.env.BING_SUBSCRIPTION_KEY;
        console.log('key',process.env.BING_SUBSCRIPTION_KEY);
        return co(this);
    }

    *webSearch (text) {
        let res = JSON.parse((yield request.getAsync({url: this.url + text, headers:{'Ocp-Apim-Subscription-Key': this.key} })).body);
        console.log(text, res);
        return res.webPages && res.webPages.value && res.webPages.value[0] ? { text: res.webPages.value[0].snippet, url: res.webPages.value[0].displayUrl }: null;
    }

    *parse (data) {

    }
}

module.exports = new BingService();
module.exports.LuisService = BingService;
