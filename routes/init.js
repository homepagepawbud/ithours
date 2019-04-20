//var ProcessFactory = require('../Core/processFactory.js');
var mongoose = require('mongoose')
module.exports = function (app) {

    app.get('/ping/status', function (req, res, next) {
        res.send({ MSG: "Api running successfully at serer" });
    });

    app.get('/ithours-client-base', function (req, res, next) {
        res.sendfile(process.cwd()+ '/node_modules/ithours/assets/client-base.js');
    });

    app.post('/get-models', function (req, res) {
        var modalArray = []
        for (pro in mongoose.models) {
            modalArray.push(pro)

        }
        res.status(200).send(modalArray);

    })
    app.get('/ithours-api-setup', function (req, res, next) {
        res.sendfile(process.cwd()+ '/node_modules/ithours/assets/api-setup.html');
    });
}