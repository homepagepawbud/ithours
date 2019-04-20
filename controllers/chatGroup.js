
var mongoose = require('mongoose');
var GroupModifier = require('ithours/chats/groupModifier');
var groupModifier = new GroupModifier();

module.exports = function () {
    //setting default value
    // var Core = require('../Core/core.js')
    var fs = require('fs');
    var ObjectId = require('mongodb').ObjectId;
    var ChatGroup = mongoose.model('ChatGroup');
    var Message = mongoose.model('Message');
    var User = mongoose.model('User');
    var _ = require('underscore');
    // this.CREATGROUP = function (body, res, resCallback) {
    //    var mediaobj = new ChatGroup(body.Data);
    //    mediaobj.save(mediaobj, function (err, logresult) {
    //        console.log(logresult);
    //        resCallback(res, null, logresult);
    //    });
    //}



    this.GETUSERCHATGROUPS = async function (body, results) {
        //const collection1 = DBConn.collection('Groups');
        var toReturn = {};
        var result = await ChatGroup.find({ "Members.MemberId": body.Id })//, function (err, result) {
        console.log(result);
        if (result.length == 0) {
            toReturn = { groups: [], messages: [] };
            return toReturn
        } else if (result.length > 0) {
            var groupsToSend = [];
            var msgGroupId = [];
            for (var groupCounter = 0; groupCounter < result.length; groupCounter++) {
                groupsToSend.push(groupModifier.modifyGroup(body.Id, result[groupCounter]));
                msgGroupId.push(result[groupCounter]._id.toString());
            }
            //const collection = DBConn.collection('Messages');
            var result = await Message.find({ GroupId: { $in: msgGroupId } })//,function (err, result) {
            if (result.length == 0) {
                toReturn = { groups: groupsToSend, messages: [] }
                return toReturn
            } else if (result.length > 0) {
                var obj = {
                    groups: groupsToSend,
                    messages: result
                }
                toReturn = obj;
                return toReturn
            } else {
                toReturn = { groups: groupsToSend, messages: [] };
                return toReturn
            }
            // });
        } else {
            toReturn = { groups: [], messages: [] };
            return toReturn
        }
        //   });

    }

    this.GETUSERCHATGROUPSREMAINGMESSAGE = function (body, res, resCallback) {
        //var func = function (date) {

        //    if (new Date(this.SendTime) > new Date(date))
        //        return true;
        //    else
        //        return false;
        //}
        //const collection1 = DBConn.collection('Groups');
        var toReturn = {
            IsUserExist: false,
            Data: null
        }
        ChatGroup.find({ "Members.MemberId": body.Data.Id }, function (err, result) {
            console.log(result);
            if (err) {
                toReturn.Data = { groups: [], messages: [] };
                resCallback(res, null, toReturn);
            } else if (result.length > 0) {
                var groupsToSend = [];
                var msgGroupId = [];
                for (var groupCounter = 0; groupCounter < result.length; groupCounter++) {
                    groupsToSend.push(groupModifier.modifyGroup(body.Data.Id, result[groupCounter]));
                    msgGroupId.push(result[groupCounter]._id.toString());
                }
                //const collection = DBConn.collection('Messages');
                Message.find({ GroupId: { $in: msgGroupId } }, function (err, result) {
                    if (err) {
                        toReturn.Data = { groups: groupsToSend, messages: [] }
                        resCallback(res, null, toReturn);
                    } else if (result.length > 0) {

                        var fil = _.filter(result, function (num) {
                            if (new Date(num.SendTime) > new Date(body.Data.date))
                                return true;
                        });
                        if (fil) { }
                        else { fil = [] }
                        var obj = {
                            groups: groupsToSend,
                            messages: fil
                        }

                        toReturn.Data = obj;
                        resCallback(res, null, toReturn);
                    } else {
                        toReturn.Data = { groups: groupsToSend, messages: [] };
                        resCallback(res, null, toReturn);
                    }
                });
            } else {
                toReturn.Data = { groups: [], messages: [] };
                resCallback(res, null, toReturn);
            }
        });

    }

    this.UPDATELASTACTIVESTATUS = function (body, res, resCallback) {
        console.log(body);

        User.findById(body.Data.Id, function (err, userobj) {
            if (userobj) {
                userobj.lastActiveTime = body.Data.time;
                userobj.save(userobj, function (err, logresult) {
                    if (err)
                        resCallback(res, "ACC002", { Message: "USER ALREADY EXIST" });
                    else
                        resCallback(res, null, logresult);
                });
            }
        });

    }
    this.GETLASTACTIVESTATUS = function (body, res, resCallback) {

        User.findById(body.Data.Id, function (err, userobj) {
            if (err) {

                resCallback(res, null, null);
            } else {

                resCallback(res, null, userobj);
            }
        });
    }

}