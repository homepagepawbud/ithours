module.exports = function (app) {
    require('./init')(app); // for all public routes
    require('./auth')(app); // for authentication
    require('./shared')(app); // for all api to get data 
}