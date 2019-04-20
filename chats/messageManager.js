

module.exports = function (socketio) {
    //setting default value
    var moment = require('moment');
    var ObjectId = require('mongodb').ObjectId;
    //var GroupModifier = require('./server/chats/groupModifier.js');
    //var groupModifier = new GroupModifier();
    //var socketio = require('socket.io');
   

    this.defaultMessageObject = function (groupId, senderId ,message, clientMessageId, isMedia,isNotification,mediaMessage) {
        var dateObject = new Date();
        return {
            GroupId: groupId,
            SenderId: senderId,
            TextMessage: message,
            ImageUrl: message,
            VideoUrl: message,
            SendTime: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
            IsActive: "1",
            CreatedBy: senderId,
            ModifiedBy: senderId,
            CreatedOn: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
            ModifiedOn: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
            MediaType:mediaMessage,
            ClientMessageId: clientMessageId,
            ReadStatus: false,
            BlurURL : "",
            PushStatus: "ServerRecieved",
            deleveryStatus:"New",
            ReadBy: [{ userid: senderId, time: moment.utc().format("MM/DD/YYYY HH:mm:ss A") }],
            DeleverTo: [],
            isMedia: isMedia,
            isnotification:isNotification
        }
    };
    this.defaultMessageObjectForRoom = function (groupId, senderId, message, clientMessageId, isMedia, isNotification, mediaMessage,user) {
        var dateObject = new Date();
        return {
            GroupId: groupId,
            SenderId: senderId,
            TextMessage: message,
            ImageUrl: message,
            VideoUrl: message,
            SendTime: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
            IsActive: "1",
            CreatedBy: senderId,
            ModifiedBy: senderId,
            CreatedOn: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
            ModifiedOn: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
            MediaType: mediaMessage,
            ClientMessageId: clientMessageId,
            ReadStatus: false,
            BlurURL: "",
            PushStatus: "ServerRecieved",
            deleveryStatus: "New",
            ReadBy: [{ userid: senderId, time: moment.utc().format("MM/DD/YYYY HH:mm:ss A") }],
            DeleverTo: [],
            isMedia: isMedia,
            isnotification: isNotification,
            User:user
        }
    };
   
}