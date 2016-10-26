module.exports = function (app) {
    app.get('/', getHome);
};

function getHome(req, res) {
    res.send('Home page');
}
