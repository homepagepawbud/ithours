//var common = require('../helpers/common.js');
//var mongoose = require('mongoose');
const mongoose = require('mongoose');
const ithuors = require('ithours');
const appError = require('ithours/core/app-error');
var data = {};
module.exports = function () {
    isArray = function (a) {
        return (!!a) && (a.constructor === Array);
    };

    isObject = function (a) {
        return (!!a) && (a.constructor === Object);
    };
    this.getEmitter = function () {
        return myEmitter;
    }
    handleArray = function (array) {
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            if (isArray(obj)) {
                handleArray(obj);
            } else {
                handleObject(obj);
            }
        }
    }

    handleObject = function (obj) {
        for (var p in obj) {
            propExist = true;
            var objnew = obj[p];
            if (isArray(objnew)) {
                handleArray(objnew);
            } else if (isObject(objnew)) {
                handleObject(objnew);
            } else {
                try{ 
                    if (mongoose.Types.ObjectId.isValid(mongoose.Types.ObjectId.createFromHexString(objnew))) {
                        obj[p] =  mongoose.Types.ObjectId(objnew)
                    }
                }catch(err){
                   console.log(err)
                }
               
            }
        }
    }

    getModelObject = function (data) {
        var modelName = data.modelName;
        if (mongoose.models[modelName])
            return mongoose.models[modelName];
        else
            throw new appError('ACC012');
    }

    this.ADD = async function (data, options,operator) {
        if (operator && operator.validate)
            await operator.validate(data);

        var modelObj = getModelObject(data);
        if (isArray(data)) {
            handleArray(data);
        } else {
            handleObject(data);
        }
        if (operator && operator.PREFETCH)
            data = await operator.PREFETCH(data);
        
        var modelRef1 = new modelObj(data);
        let toReturn = null;
        toReturn = await modelRef1.save(modelRef1);
        if (operator && operator.POSTFETCH)
            toReturn = await operator.POSTFETCH(toReturn);

        return toReturn;
    }

    this.GET = async function (data, options,operator) {
        var modelObj = getModelObject(data);


        console.log('getmodel')
        data.findQuery = data.findQuery || {};
        if (operator && operator.PREFETCH)
            data = await operator.PREFETCH(data);

            if (isArray(data)) {
                handleArray(data);
            } else {
                handleObject(data);
            }

        let toReturn = null;
        if (data.path) {
            toReturn = await modelObj.find(data.findQuery).populate(data.path);
        }
        else {
            toReturn = await modelObj.find(data.findQuery)
        }

        if (operator && operator.POSTFETCH)
            toReturn = await operator.POSTFETCH(toReturn);

        return toReturn;
    }

    this.GETONE = async function (data, options ,operator) {
        var alls = await this.GET(data, options ,operator);
        if (alls && alls.length > 0)
            return alls[0];
        else
            return null;
    }

    this.DELETE = async function (data, options,operator) {
        var modelObj = getModelObject(data);
        if (operator && operator.PREFETCH)
            data = await operator.PREFETCH(data);

            if (isArray(data)) {
                handleArray(data);
            } else {
                handleObject(data);
            }

        let toReturn = null;
        var result = await modelObj.findById(data.id);
        toReturn = await result.remove();
        if (operator && operator.POSTFETCH)
            toReturn = await operator.POSTFETCH(toReturn);

        return toReturn
    }

    this.UPDATE = async function (data, options, operator) {
            if (operator && operator.validate)
                await operator.validate(data);

                if (isArray(data)) {
                    handleArray(data);
                } else {
                    handleObject(data);
                }
        
         var modelObj = getModelObject(data);
        if (operator && operator.PREFETCH)
            data = await operator.PREFETCH(data);

        let toReturn = null;
        data.findQuery = data.findQuery || {};
        toReturn = await modelObj.update(data.findQuery, data.updateQuery, {
            upsert: true,
            multi: true
        });
        if (operator && operator.POSTFETCH)
            toReturn = await operator.POSTFETCH(toReturn);

        return toReturn
    }
}