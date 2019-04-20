
var express = require('express')
var process = require('process');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var mongoose = require('mongoose');
var chatserver = require('http').Server(express)
var broad_caster = require('./chats/broadCaster')
var group_modifier = require('./chats/groupModifier')
var message_manager = require('./chats/messageManager')

var appError = require('./core/app-error');
//var config = require('./config/dev.config')
module.exports.bootstrap = async function (app, config, socketcb) {
    app.use(bodyParser.json({ limit: '500mb' }));
    app.use(bodyParser.urlencoded({
        limit: '500mb',
        extended: true,
        parameterLimit: 50000
    }));
    app.use(cookieParser());
    app.use('/', serveStatic(__dirname + '/dist')); // serve static files
    app.use('/public', serveStatic(__dirname + '/public')); // serve static files
    app.use('/vendors', serveStatic(__dirname + '/vendors')); // serve static files
    app.use('/dist', serveStatic(__dirname + '/dist')); // serve static files

    if (!config) {
        //throw error
    } else {

        config.routes = config.routes || 'routes';
        config.controllers = config.controllers || 'controllers';
        config.models = config.models || 'models';

        //load models 
        var isExist = false;
        var modelsPath = process.cwd() + "/" + config.models;
        var fs = require('fs');
        fs.readdirSync(modelsPath).forEach(name => {
            if (!name.match(/\.js$/)) return;
            require(modelsPath + '/' + name);
            if (name === "User.js")
                isExist = true;
        });
        if (!isExist)
            throw new Error('User Model does not exist');
        require('./models/Log');
        require('./models/API')


        //load routes
        require('./routes')(app);

        var coreRef = require('./core/core');
        var coreObj = new coreRef();
        coreObj.loadSystem(config);

        async function connectToDB() {
            var coreRef1 = require('./core/core');
            var coreObj1 = new coreRef1();
            coreObj1.loadSystem(config);
            await mongoose.connect(coreObj1.getEnvironmentVariable('database'), { useNewUrlParser: true }, function (err) {
                if (err) {
                    console.log("Error connecting in database");
                    try { console.log(JSON.stringify(err)); }
                    catch (dberr) { console.log(dberr); }
                    setTimeout(function () {
                        connectToDB();
                    }, 1000);
                }
                else {
                    console.log(coreObj1.getEnvironmentVariable('database'))

                }
            });
        }
        await connectToDB();

        if (config.loadSocket) {
        require('./chat')(app, chatserver, socketcb)
}
        return {
            app: app,
            config: config,
            core: coreObj
        }

    }

}


module.exports.initilaize = function (app, config, socketcb) {

    if (!config) {
        //throw error
    } else {

        config.routes = config.routes || 'routes';
        config.controllers = config.controllers || 'controllers';
        config.models = config.models || 'models';

        //load models
        if (config.loadModels) {
            var modelsPath = process.cwd() + "/" + config.models;
            var fs = require('fs');
            fs.readdirSync(modelsPath).forEach(name => {
                if (!name.match(/\.js$/)) return;
                require(modelsPath + '/' + name);
            });
            require('./models/Log');
            require('./models/API')
            console.log(mongoose.models)
        }
        //load routes
        require('./routes')(app);

        var coreRef = require('./core/core');
        var coreObj = new coreRef();
        coreObj.loadSystem(config);

        if (config.loadSocket) {
            require('./chat')(app, chatserver, socketcb);
        }
        return {
            app: app,
            config: config,
            core: coreObj
        }
    }

}



module.exports.AppError = appError;
module.exports.group_modifier = group_modifier;
module.exports.broad_caster = broad_caster
module.exports.message_manager = message_manager;
//module.exports.Config = config;