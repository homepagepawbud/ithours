var mongoose = require('mongoose');
var core = require('./core/core');
var coreObj = new core()
var process = require('process')
var _ = require('underscore');
socket_connection = null;

module.exports = function (app, server , cb) {
    
    app.get('/chat-test-page', function (req, res) {
        console.log("hrer");
        res.sendFile(__dirname + '/text.html');
    });

    var winston = require('winston');
    var applogger = winston.createLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: 'applogs.log'
            })
        ]
    });


    app.get('/GETUSERCHATGROUPS/:userId', async function (req, res) {
        var ChatGroupManager = require('./controllers/chatGroup.js');
        var chatmethods = new ChatGroupManager();
        let tosends = await chatmethods.GETUSERCHATGROUPS({ Id: req.params.userId })
        res.send(tosends);
    });

    var broadCst = require('./chats/broadCaster');
    var caster = new broadCst();
    var GroupModifier = require('./chats/groupModifier.js');
    var groupModifier = new GroupModifier();
    // var NotificationManager = require('./controllers/NotificationManager.js')
    // var notManager = new NotificationManager();
    var MessageManager = require('./chats/messageManager.js');
    var messageManager = new MessageManager();

    var Message = mongoose.model('Message');
    var ChatGroup = mongoose.model('ChatGroup');
    var User = mongoose.model('User')
    var socketio = require('socket.io').listen(server);
    console.log("after socket.io")

    socketio.on('connection', function (socket) {
        if(cb) cb(socket);

        console.log("socket details");

        socket.on('connectUser', function (msg) {
            console.log('userconnection Received: ', msg);
            // myEmitter.on('Notification', function(data){
            //     caster.sentToUser(data.targetId, data.title , 'BookingNotification');
            // });
            // myEmitter.on('UpdateNotification', function(data){
            //     caster.sentToUser(data.targetId, data.title , 'BookingNotification');
            // })
            caster.AddUserSocketTOCache(msg.UserId, socket);
            ChatGroup.find({ "Members.MemberId": msg.UserId }, function (err, result) {
                if (err) {
                    console.log(err);

                } else if (result.length > 0) {
                    for (var groupCounter = 0; groupCounter < result.length; groupCounter++) {
                        groupModifier.getGroup(result[groupCounter]._id.toString()).then(function (group) {
                            var messageToBroadCast = {
                                memberId: msg.UserId,
                                isonline: true,
                                groupId: group._id
                            };
                            caster.sentToClient(msg.UserId, group, messageToBroadCast, 'onUSerConnectionStatusChange');
                        });
                    }
                }

            });
        });
        socket.on('textMessage',  function (msg) { //groupId, senderId, msgText, clientMessageId) {
            console.log('Message Received: ', groupId + senderId + msgText + clientMessageId);
            var groupId = msg.GroupId;
            var senderId = msg.SenderId;
            var msgText = msg.MsgText;
            var clientMessageId = msg.ClientMessageId;
            var isNotification = msg.isNotification;
            try {
                groupModifier.getGroup(groupId).then(function (group) {
                    var messageInfo = messageManager.defaultMessageObject(groupId, senderId, msgText, clientMessageId, false, isNotification)
                    var messageToBroadCast = {
                        messageInfo: messageInfo
                    };

                    var message = new Message(messageInfo);
                    message.save(message, function (err, logresult) {
                        if (err) {
                            console.log("Error in adding user");
                        }
                        else {
                            //messageInfo._id = docsInserted;
                            var messageToBroadCast = {
                                messageInfo: logresult
                            };
                            console.log('Insert Successfully..')
                            caster.sentToClient(senderId, group, messageToBroadCast, 'onTextMessage');
                            caster.sentToSelf(senderId, group, messageToBroadCast, 'selfTextMessage', socket.id);
                            caster.sentToDevice(senderId, group, messageToBroadCast, 'deviceTextMessage', socket.id);
                            console.log(group);

                            console.log("adding push message");
                            var targetuser = _.find(group.Members, function (num) {
                                return num.MemberId != senderId;
                            });
                            var senderuser = _.find(group.Members, function (num) {
                                return num.MemberId == senderId;
                            });

                            try {
                                var notifObj = {
                                    targetId: mongoose.Types.ObjectId(targetuser.MemberId),
                                    title: senderuser.MemberName + " sent you a message",
                                    text: msg.MsgText,
                                    image: senderuser.MemberImage,
                                    type: 'CHATMESSAGE',
                                    // linkId: mongoose.Types.ObjectId(senderuser.MemberId),
                                    byId: mongoose.Types.ObjectId(senderuser.MemberId),
                                    isRead: false,
                                    refData: {
                                        GroupId: groupId
                                    }
                                }
                                // notManager.CREATEPUSHNOTIFICATION(notifObj);
                            } catch (err) { }
                        }
                    });

                });
            } catch (err) {

                console.log("fugajgjgfajfjgsa");
            }
        });

        socket.on('typing', function (msg) {

            var groupId = msg.GroupId;
            var senderId = msg.SenderId;
            groupModifier.getGroup(groupId).then(function (group) {
                var messageToBroadCast = {
                    GroupId: groupId,
                    SenderId: senderId
                };
                caster.sentToClient(senderId, group, messageToBroadCast, 'onTyping');
                caster.sentToSelf(senderId, group, messageToBroadCast, 'selfTyping', socket.id);
            });
        });

        socket.on('stopTyping', function (msg) {
            var groupId = msg.GroupId;
            var senderId = msg.SenderId;
            groupModifier.getGroup(groupId).then(function (group) {
                var messageToBroadCast = {
                    GroupId: groupId,
                    SenderId: senderId
                };
                caster.sentToClient(senderId, group, messageToBroadCast, 'onStopTyping');
                caster.sentToSelf(senderId, group, messageToBroadCast, 'selfStopTyping', socket.id);
            });
        });

        socket.on('mediaMessage', function (msg) { //groupId, senderId, msgText, clientMessageId) {
            console.log('Message Received: ', groupId + senderId + msgText + clientMessageId, taggedmessge);
            var groupId = msg.GroupId;
            var senderId = msg.SenderId;
            var msgText = msg.MsgText;
            var clientMessageId = msg.ClientMessageId;
            var taggedmessge = msg.TaggedMessge;
            var mediaMessage = msg.MediaType;
            var videoMessage = msg.VideoImage;

            try {
                groupModifier.getGroup(groupId).then(function (group) {
                    var messageInfo = messageManager.defaultMessageObject(groupId, senderId, msgText, clientMessageId, true, false, mediaMessage)
                    messageInfo.TaggedMessge = taggedmessge;
                    if (mediaMessage == "2") {
                        messageInfo.VideoUrl = videoMessage;
                    }
                    var messageToBroadCast = {
                        messageInfo: messageInfo
                    };

                    // const collection1 = DBConn.collection('Messages');
                    var message = new Message(messageInfo);
                    message.save(message, function (err, logresult) {
                        //  Message.insert(messageInfo, (err, docsInserted) => {
                        if (err) {
                            console.log("Error in adding user");
                        }
                        else {
                            //messageInfo._id = docsInserted;
                            var messageToBroadCast = {
                                messageInfo: messageInfo
                            };
                            console.log('Insert Successfully..')

                            caster.sentToClient(senderId, group, messageToBroadCast, 'onMediaMessage');
                            caster.sentToSelf(senderId, group, messageToBroadCast, 'selfMediaMessage', socket.id);

                            console.log("adding push message");
                            try {
                                var targetuser = _.find(group.Members, function (num) {
                                    return num.MemberId != senderId;
                                });
                                var senderuser = _.find(group.Members, function (num) {
                                    return num.MemberId == senderId;
                                });

                                var notifObj = {
                                    targetId: mongoose.Types.ObjectId(targetuser.MemberId),
                                    title: senderuser.MemberName + " sent you a message",
                                    text: msg.MsgText,
                                    image: senderuser.MemberImage,
                                    type: 'CHATMESSAGE',
                                    byId: mongoose.Types.ObjectId(senderuser.MemberId),
                                    isRead: false
                                }

                                // notManager.CREATEPUSHNOTIFICATION(notifObj);
                            } catch (err) {
                            }
                        }
                    });
                    try {
                        var membids = [];
                        for (var memb = 0; memb < group.Members.length; memb++) {
                            membids.push(mongoose.Types.ObjectId(group.Members[memb].MemberId));
                        }
                        //updatd ht \emedi to group object
                        var mediaobj = {
                            url: msgText,
                            type: mediaMessage,
                            linkedid: groupId,
                            linkedtype: 'GROUP',
                            targetids: membids,

                            created_by: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
                            updated_by: moment.utc().format("MM/DD/YYYY HH:mm:ss A"),
                            // MediaType: mediaMessage, url: msgText, memberId: senderId, groupId: groupId, linkedmessageid: clientMessageId
                        };
                        //const collection = DBConn.collection('Groups');
                        //collection.update({ "_id": ObjectId(groupId) }, { $push: { "Medias": mediaobj } }, function (err, result) {



                        // notManager.CREATEPUSHNOTIFICATION(mediaobj);
                    } catch (err) { }

                });
            } catch (err) { }
        });

        socket.on('readNotification', function (msg) {
            var groupId = msg.GroupId;
            var senderId = msg.SenderId;
            // var recieverId = msg.ReciverId;
            groupModifier.getGroup(groupId).then(function (group) {
                var messageToBroadCast = {
                    readby: senderId
                };

                //  const collection = DBConn.collection('Messages');
                Message.update({ "GroupId": groupId }, { $set: { "deleveryStatus": "Read" } }, { multi: true }, function (err, result) {

                    if (err) {
                        console.log(err);
                    }
                    else {
                        Message.update({ "GroupId": groupId, "ReadBy.userid": { $ne: senderId } }, { $push: { ReadBy: { userid: senderId, time: Date() } } }, { multi: true }, function (err, result) {
                            // collection.update({"_id":ObjectId(body.Data.memberid),"contacts.linkedmobile":body.Data.id.number }, { $set: { "contacts.$.status": 'connected'} }, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("fdggfsd");
                            }
                        });
                        console.log('update msg successfully');
                    }

                });

                caster.sentToClient(senderId, group, messageToBroadCast, 'onReadNotification');
                caster.sentToSelf(senderId, group, messageToBroadCast, 'selfReadNotification', socket.id);
            });
        });

        socket.on('createGroup', async function (msg) {
            applogger.info(msg)
            var members = msg.Members; //id of members
            //find members fron users coletion
            var Members = []
            var userResult = await User.find({ _id: { $in: members } });
            console.log(userResult)
            for (var count = 0; count < userResult.length; count++) {
                Members.push({
                    MemberId: userResult[count]._id,
                    MemberName: userResult[count].name,
                    MemberImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9EgDaEMwUgjlPlPi6G66dR7SyFsh2M6eEDYrHpByJxINpp7Nj9A",
                })
            }
            applogger.info(Members)
            var grp = {
                GroupInfo: {
                    GroupName: msg.GroupName,
                    OwnerId: msg.SenderId,
                    ProfileURLOfGroup: msg.ProfileURLOfGroup,
                },
                Admin: [{ MemberId: msg.SenderId }]
            }
            grp.Members = grp.Members || []
            grp.Members = Members
            console.log(grp)
            applogger.info(grp)

            //save to database 
            //get the group id 
            //get the admin id 
            var newChatGroups = new ChatGroup(grp);
            var chatGroupResult = await newChatGroups.save()

            applogger.info(chatGroupResult)
            var groupId = chatGroupResult._id; //created group id 

            var senderId = msg.SenderId;
            groupModifier.getGroup(groupId).then(function (group) {
                var messageToBroadCast = {};
                caster.sentToClient(senderId, group, messageToBroadCast, 'oncreateGroup');
                //caster.sentToSelf(senderId, group, messageToBroadCast, 'selfStopTyping', socket.id);
            });
        });

        socket.on('addMemberToGroup', async function (msg) {

            var members = msg.Members; //id of members
            //find members fron users coletion
            var Members = []
            var userResult = await User.find({ _id: { $in: members } });

            console.log(userResult)
            for (var count = 0; count < userResult.length; count++) {
                Members.push({
                    MemberId: userResult[count]._id,
                    MemberName: userResult[count].name,
                    MemberImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9EgDaEMwUgjlPlPi6G66dR7SyFsh2M6eEDYrHpByJxINpp7Nj9A",
                })
            }

            for (var i = 0; i < Members.length; i++) {
                var findchatgroup = await ChatGroup.findByIdAndUpdate(msg.GroupId, {
                    $push: {
                        "Members": Members[i]
                    }
                }, {
                        new: true
                    }

                );
            }

            var groupId = msg.GroupId; //created group id 

            var senderId = msg.SenderId;
            groupModifier.getGroup(groupId).then(function (group) {
                var messageToBroadCast = {};
                caster.sentToClient(senderId, group, messageToBroadCast, 'onaddMember');
                //caster.sentToSelf(senderId, group, messageToBroadCast, 'selfStopTyping', socket.id);
            });
        });
        socket.on('deleteMemberFromGroup', async function (msg) {

            var members = msg.Members; //id of members
            //find members fron users coletion
            // var Members = []
            // var userResult = await User.find({ _id: { $in: members } });

            // console.log(userResult)
            // for (var count = 0; count < userResult.length; count++) {
            //     Members.push({
            //         MemberId: userResult[count]._id,
            //         MemberName: userResult[count].name,
            //         MemberImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9EgDaEMwUgjlPlPi6G66dR7SyFsh2M6eEDYrHpByJxINpp7Nj9A",
            //     })
            // }

            for (var i = 0; i < members.length; i++) {
                var findchatgroup = await ChatGroup.findByIdAndUpdate(msg.GroupId, {

                    $pull: {
                        "Members": {
                            MemberId: members[i]
                        }

                    }
                },
                    {
                        //new: true
                        new: true
                    }

                );
                console.log(findchatgroup)
            }

            var groupId = msg.GroupId; //created group id 

            var senderId = msg.SenderId;
            groupModifier.getGroup(groupId).then(function (group) {
                var messageToBroadCast = {};
                caster.sentToClient(senderId, group, messageToBroadCast, 'ondeleteMember');
                //caster.sentToSelf(senderId, group, messageToBroadCast, 'selfStopTyping', socket.id);
            });
        });

        socket.on('deleteGroup', async function (msg) {
            var groupId = msg.GroupId;
            var senderId = msg.SenderId;

            groupModifier.getGroup(groupId).then(async function (group) {
                var messageToBroadCast = {
                    GroupId: groupId,
                    SenderId: senderId
                };
                var deletegroup = await ChatGroup.remove({ "_id": groupId });
                caster.sentToClient(senderId, group, messageToBroadCast, 'onDeleteGroup');
                caster.sentToSelf(senderId, group, messageToBroadCast, 'onDeleteGroup');
                // caster.sentToSelf(senderId, group, messageToBroadCast, 'selfStopTyping', socket.id);
            });

        });
    });



    // var configManager = require('./config/configManager.js');
    var chatport = coreObj.getEnvironmentVariable('chatport')
    server.listen(chatport, function () {
        console.log('Chat Listening at port: ' + chatport);
    });


}