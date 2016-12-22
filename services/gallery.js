const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

class GalleryService {

    getPopularImages (offset, limit) {
        var url = 'https://picsart.com/api/photos/show/recent.json?key=3ab00809-f4a4-4e15-a69a-86e1318712af&q=awesome&recent=1&limit=' +
            (limit ? limit : 5) + '&offset=' +
            (offset ?  + offset : 0);

        return request.getAsync(url).then(function (res) {
            res = JSON.parse(res.body);
            if(res.status != 'success') {
                throw new Error(res.message);
            }
            var response = res.response.filter(function (item) {
                return item ? true : false;
            });

            return res.response;
        });

    }
}



module.exports = new GalleryService();
module.exports.GalleryService = GalleryService;
