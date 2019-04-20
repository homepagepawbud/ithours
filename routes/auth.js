var Core = require('../core/core.js');
var ProcessFactory = require('ithours/core/core-factory');
var AppError = require('../core/app-error')
var mongoose = require('mongoose')

module.exports = function (app) {
    //Models Required
   
    app.post('/api/login', async function (req, res, next) {
        var Logs = mongoose.model('Logs');
        var param = {
            process_id: "AUTH",
            method_id: "Login",
            request_object: req.body,
            created_time: new Date()
        };

        var toReturn = null;
        var core = new Core();
        var incoming = new Logs(param);
        let incomingObj = await incoming.save(incoming);
        try {
            res.setHeader('Content-Type', 'application/json');
            var process = new ProcessFactory().getControllerManagerById(param.process_id); // core.getMangerByProcessId(cnt);
            console.log("here");
            try {
                let methodResponse = await process[param.method_id](param.request_object, {});
                toReturn = core.wrapResponse(methodResponse);
            } catch (ex) {

                if (ex instanceof AppError)
                    toReturn = core.wrapResponse(null, ex.code);
                else if (ex instanceof MongoError)
                    toReturn = core.wrapResponse(null, "PRC002");
                else
                    toReturn = core.wrapResponse(null, "PRC002");
                incomingObj.Exception = ex;
                incoming.save(incoming);
            }
        } catch (ex) {
            toReturn = core.wrapResponse(null, "PRC001");
            incomingObj.Exception = ex;
            incoming.save(incoming);
        }
        res.status(200).send(toReturn);
    });

    app.post('/api/register', async function (req, res, next) {
        var Logs = mongoose.model('Logs');
        var param = {
            process_id: "AUTH",
            method_id: "Register",
            request_object: req.body,
            created_time: new Date()
        };

        var toReturn = null;
        try {
            var core = new Core();
            var incoming = new Logs(param);
            let incomingObj = await incoming.save(incoming);

            res.setHeader('Content-Type', 'application/json');
            var process = new ProcessFactory().getControllerManagerById(param.process_id); // core.getMangerByProcessId(cnt);
            console.log("here");
            try {
                let methodResponse = await process[param.method_id](param.request_object, {});
                toReturn = core.wrapResponse(methodResponse);
            } catch (ex) {
                if (ex instanceof AppError)
                    toReturn = core.wrapResponse(null, ex.code);
                else if (ex instanceof MongoError)
                    toReturn = core.wrapResponse(null, "PRC002");
                else
                    toReturn = core.wrapResponse(null, "PRC002");
                incomingObj.Exception = ex;
                incoming.save(incoming);
            }
        } catch (ex) {
            toReturn = core.wrapResponse(null, "PRC001");
            incomingObj.Exception = ex;
            incoming.save(incoming);
        }
        res.status(200).send(toReturn);
    });

    app.post('/api/logout', async function (req, res, next) {
        var Logs = mongoose.model('Logs');
        var param = {
            process_id: "AUTH",
            method_id: "Logout",
            request_object: req.body,
            created_time: new Date()
        };

        var toReturn = null;
        try {
            var core = new Core();
            var incoming = new Logs(param);
            let incomingObj = await incoming.save(incoming);

            res.setHeader('Content-Type', 'application/json');
            var process = new ProcessFactory().getProcessManagerById(param.process_id); // core.getMangerByProcessId(cnt);
            console.log("here");
            try {
                let methodResponse = await process[param.method_id](param.request_object, {});
                toReturn = core.wrapResponse(methodResponse);
            } catch (ex) {
                toReturn = core.wrapResponse(null, "PRC002");
                incomingObj.Exception = ex;
            }
        } catch (ex) {
            toReturn = core.wrapResponse(null, "PRC001");
            incomingObj.Exception = ex;
        }
        res.status(200).send(toReturn);
    });
}