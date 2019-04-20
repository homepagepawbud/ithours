//var common = require('../helpers/common.js');
var Core = require('../core/core.js');
var ProcessFactory = require('ithours/core/core-factory');
var AppError = require('../core/app-error')
module.exports = function (app) {

    var mongoose = require('mongoose');
    var jwt = require('jsonwebtoken');
    //var bcrypt = require('bcryptjs');
    //var Logs = common.mongoose.model('Logs');
    //var env = process.env.NODE_ENV || 'dev';
    //var config = require('../config/' + env + '.config');

  

    async function verifyToekn(req) {
        return new Promise((resolve, reject) => {
            var coreObj = new Core();
            const security = coreObj.getEnvironmentVariable('security');
            if (security && security.generate) {
                var token = req.headers['x-access-token'];
                if (!token) resolve(401);
                jwt.verify(token, security.secret, function (err, decoded) {
                    if (err) resolve(500);
                    else resolve(200);
                });
            } else {
                resolve(200);
            }
        });
    }

    app.post('/api/shared', async function (req, res, next) {
        var Logs = mongoose.model('Logs');
        let isVerified = await verifyToekn(req);
        if (isVerified == 401) {
            res.status(401).send({
                auth: false,
                message: 'No token provided.'
            });
        } else if (isVerified == 500) {
            res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
            return;
        } else {
            var param = {
                process_id: req.body.PRCID,
                method_id: req.body.Method,
                request_object: req.body.Data,
                created_time: new Date()
            };

            var toReturn = null;
            try {
                var core = new Core(req);
                var incoming = new Logs(param);
                let incomingObj = await incoming.save(incoming);

                res.setHeader('Content-Type', 'application/json');
                var process = new ProcessFactory().getControllerManagerById(param.process_id); // core.getMangerByprocess_id(cnt);
                try {

                    let additionalData = {
                        pagination: {
                            skip: 0,
                            limit: 9999999999
                        }
                    };
                    if (req.headers.pagesize && req.headers.pagenumber) {
                        additionalData.pagination = {
                            skip: req.headers.pagesize * (req.headers.pagenumber - 1),
                            limit: req.headers.pagesize,

                        }
                    }
                    let methodResponse = await process[param.method_id](param.request_object, additionalData);
                    toReturn = core.wrapResponse(methodResponse);
                } catch (ex) {
                    if (ex instanceof AppError) {
                        toReturn = core.wrapResponse(null, ex.code);
                    }
                    else {
                        toReturn = core.wrapResponse(null, "ERR000");
                        console.log(ex)
                    }
                    try{
                    incomingObj.Exception = ex;
                    incomingObj.message = ex.message
                    incomingObj.stack = ex.stack;
                    incomingObj.save();
                    }catch(err){
                        console.log("Exception save error");
                    }
                }
            } 
            catch (ex){
                if (ex instanceof AppError || (ex && ex.name === "AppError")) {
                   toReturn = core.wrapResponse(null, ex.code);
               }
               else {
                   toReturn = core.wrapResponse(null, "ERR000");
                   console.log(ex)
               }
               try{
               incomingObj.Exception = ex;
               incomingObj.message = ex.message
               incomingObj.stack = ex.stack;
               incomingObj.save();
               }catch(err1){
                   console.log("Exception save error");
               }}
            res.status(200).send(toReturn);
        }
    });



    app.post('/api/crud/:method_id', async function (req, res, next) {
        var Logs = mongoose.model('Logs');
        let isVerified = await verifyToekn(req);
        if (isVerified == 401) {
            res.status(401).send({
                auth: false,
                message: 'No token provided.'
            });
        } else if (isVerified == 500) {
            res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
            return;
        } else {
            var param = {
                process_id: "CRUD",
                method_id: req.params.method_id,
                request_object: req.body,
                created_time: new Date()
            };

            var toReturn = null;
            try {
                var core = new Core(req);
                var incoming = new Logs(param);
                //let incomingObj = await incoming.save(incoming);

                res.setHeader('Content-Type', 'application/json');
                var process = new ProcessFactory().getControllerManagerById(param.process_id); // core.getMangerByprocess_id(cnt);
                try {

                    let additionalData = {
                        pagination: {
                            skip: 0,
                            limit: 9999999999
                        }
                    };
                    if (req.headers.pagesize && req.headers.pagenumber) {
                        additionalData.pagination = {
                            skip: req.headers.pagesize * (req.headers.pagenumber - 1),
                            limit: req.headers.pagesize,

                        }
                    }
                    
                    var operator = new ProcessFactory().getOperatorManagerById(req.body.operatorId);
                    let methodResponse = await process[param.method_id](param.request_object, additionalData, operator);
                    toReturn = core.wrapResponse(methodResponse);
                } catch (ex) {
                    if (ex instanceof AppError) {
                        toReturn = core.wrapResponse(null, ex.code);
                    }
                    else {
                        toReturn = core.wrapResponse(null, "ERR000");
                        console.log(ex)
                    }
                    try{
                    incomingObj.Exception = ex;
                    incomingObj.message = ex.message
                    incomingObj.stack = ex.stack;
                    incomingObj.save();
                    }catch(err){
                        console.log("Exception save error");
                    }
                }
            } catch (ex){
             if (ex instanceof AppError || (ex && ex.name === "AppError")) {
                toReturn = core.wrapResponse(null, ex.code);
            }
            else {
                toReturn = core.wrapResponse(null, "ERR000");
                console.log(ex)
            }
            try{
            incomingObj.Exception = ex;
            incomingObj.message = ex.message
            incomingObj.stack = ex.stack;
            incomingObj.save();
            }catch(err1){
                console.log("Exception save error");
            }}
            res.status(200).send(toReturn);
        }
    });
}