//var common = require('../helpers/common.js');

module.exports = function () {
    //setting default value
    var mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
   // var ObjectId = require('mongodb').ObjectId;
    var ChatGroup = mongoose.model('ChatGroup');
    this.modifyGroup = function (userId, groupObject) {
        if ((groupObject && groupObject.GroupInfo.GroupType.toString() == "1") || (groupObject && groupObject.GroupInfo.GroupType.toString() == "3")) {
            var uone = groupObject.Members[0];
            if (uone.MemberId != userId) {
                groupObject.GroupInfo.GroupName = uone.MemberName;
                groupObject.GroupInfo.ProfileURLOfGroup = uone.MemberImage;
                 groupObject.GroupInfo.Role=uone.Role;
                return groupObject;
            } else {
                var utwo = groupObject.Members[1];
                groupObject.GroupInfo.GroupName = utwo.MemberName;
                groupObject.GroupInfo.ProfileURLOfGroup = utwo.MemberImage;
                 groupObject.GroupInfo.Role=utwo.Role;
                return groupObject;
            }
        } else {
            return groupObject;
        }
    };

    this.getGroup = function (groupId) {
    
        return new Promise(function (resolve, reject) {
           // const collection1 = DBConn.collection('Groups');
            ChatGroup.findById(groupId, function (err, group) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(group);
                }
            });
        });
    }
    
}







