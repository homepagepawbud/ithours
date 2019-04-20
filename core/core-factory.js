
var CRUDManager = require('ithours/controllers/CRUD');
var AUTHManager = require('ithours/controllers/Auth');

module.exports = function () {
    this.getControllerManagerById = function (controllerId) {
        var manager = null;
        switch (controllerId) {
            case "CRUD":
                manager = new CRUDManager();
                break;
            case "AUTH":
                manager = new AUTHManager();
                break;
            default:
                var ControllerRef = require(process.cwd() + "/controllers/" + controllerId);
                manager = new ControllerRef();
                break;
        }
        return manager;
    },

        this.getOperatorManagerById = function (operatorId) {
            var manager = null;
            if (operatorId) {
                var ControllerRef = require(process.cwd() + "/operators/" + operatorId);
                manager = new ControllerRef();
            }
            return manager;
        }
}