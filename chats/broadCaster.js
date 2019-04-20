
connections = [];
module.exports = function () {
    var ObjectId = require('mongodb').ObjectId;
    var GroupModifier = require('./groupModifier.js');
    var groupModifier = new GroupModifier();

    this.AddUserSocketTOCache = function (userId, socket) {
        if (connections.length > 0) {
            var findDate = connections;
            var isUserConnectionExist = false;
            var isSocketExist = false;

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == userId) {
                    isUserConnectionExist = true;
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        if (con1.Sockets[i].id == socket.id) {
                            isSocketExist = true;
                        }
                    }
                    if (!isSocketExist) {
                        connections[count].Sockets.push(socket);

                    }
                }
            }

            if (!isUserConnectionExist) {
                connections.push({
                    UserId: userId,
                    Sockets: [socket]
                });
            }
        } else {
            var obj = {
                UserId: userId,
                Sockets: [socket]
            }
            connections.push(obj);
        }
        console.log('broadCaster AddUserSocketTOCache = ', connections);
    }

    this.DeleteUserSocketTOCache = function (socket) {
        if (connections.length > 0) {
            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (connections[count].Sockets != undefined && connections[count].Sockets) {
                    for (var i = 0; i < con1.Sockets.length; i++) {
                        if (con1.Sockets[i].id == socket.id) {
                            isSocketExist = true;
                            connections[count].Sockets.splice(i, 1);
                            if (connections[count].Sockets.length == 0) {

                                connections.splice(count, 1);
                            }
                        }

                    }
                }
            }


        }

    }

    this.DeleteUserSocketTOCacheByMemberId = function (memberId) {
        if (connections.length > 0) {
            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    connections.splice(count, 1);
                }
            }
        }
    }

    this.sentToAll = function (senderId, group, messageToBroadCast, eventName, senttome) {

        function broadCastToClient(memberId, messageToBroadCast, eventName) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (senttome) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        console.log("using socket id -" + connections[count].Sockets[i].id);
                        connections[count].Sockets[i].emit(eventName, messageToBroadCast)
                    }
                } else
                    if (con1.UserId != memberId) {
                        for (var i = 0; i < connections[count].Sockets.length; i++) {
                            console.log("using socket id -" + connections[count].Sockets[i].id);
                            connections[count].Sockets[i].emit(eventName, messageToBroadCast)
                        }
                    }
            }
        }


        messageToBroadCast.groupInfo = groupModifier.modifyGroup(senderId, group);
        broadCastToClient(senderId, messageToBroadCast, eventName, senttome)

    }

    this.sentInfoToAll = function (messageToBroadCast, eventName) {

        function broadCastToClient(messageToBroadCast, eventName) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                for (var i = 0; i < connections[count].Sockets.length; i++) {
                    console.log("using socket id -" + connections[count].Sockets[i].id);
                    connections[count].Sockets[i].emit(eventName, messageToBroadCast)
                }
            }
        }

        broadCastToClient(messageToBroadCast, eventName)
    }

    this.sentToClient = function (senderId, group, messageToBroadCast, eventName) {

        function broadCastToClient(memberId, messageToBroadCast, eventName) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        console.log("using socket id -" + connections[count].Sockets[i].id);
                        connections[count].Sockets[i].emit(eventName, messageToBroadCast)
                    }
                }
            }
        }
        try {
            for (var memberCounter = 0; memberCounter < group.Members.length; memberCounter++) {
                var member = group.Members[memberCounter];
                if (member.MemberId != senderId) {
                    messageToBroadCast.groupInfo = groupModifier.modifyGroup(member.MemberId, group);
                    broadCastToClient(member.MemberId, messageToBroadCast, eventName)
                }
            }
        } catch (err) { }
    }

    this.sentToSelf = function (senderId, group, messageToBroadCast, eventName, selfSocketId) {

        function broadCastToClient(memberId, messageToBroadCast, eventName, selfSocketId) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        //connections[i].Sockets.emit(eventName, 'user is typing');
                        if (connections[count].Sockets[i].id != selfSocketId)
                            connections[count].Sockets[i].emit(eventName, messageToBroadCast);
                    }
                }
            }
        }
        try {
            for (var memberCounter = 0; memberCounter < group.Members.length; memberCounter++) {
                var member = group.Members[memberCounter];
                if (member.MemberId == senderId) {
                    messageToBroadCast.groupInfo = group; //groupManager.modifyGroup(member.MemberId, group);
                    broadCastToClient(member.MemberId, messageToBroadCast, eventName, selfSocketId);
                }
            }
        } catch (err) { }
    }
    this.sentToAllGroupMember = function (group, messageToBroadCast, eventName, selfSocketId) {

        function broadCastToClient(memberId, messageToBroadCast, eventName, selfSocketId) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        //connections[i].Sockets.emit(eventName, 'user is typing');
                        if (connections[count].Sockets[i].id != selfSocketId)
                            connections[count].Sockets[i].emit(eventName, messageToBroadCast);
                    }
                }
            }
        }
        try {
            for (var memberCounter = 0; memberCounter < group.Members.length; memberCounter++) {
                var member = group.Members[memberCounter];
                //if (member.MemberId == senderId) {
                messageToBroadCast.groupInfo = group; //groupManager.modifyGroup(member.MemberId, group);
                broadCastToClient(member.MemberId, messageToBroadCast, eventName, selfSocketId);
                //}
            }
        } catch (err) { }
    }

    this.sentToDevice = function (senderId, group, messageToBroadCast, eventName, selfSocketId) {

        function broadCastToClient(memberId, messageToBroadCast, eventName, selfSocketId) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        //connections[i].Sockets.emit(eventName, 'user is typing');
                        if (connections[count].Sockets[i].id == selfSocketId)
                            connections[count].Sockets[i].emit(eventName, messageToBroadCast);
                    }
                }
            }
        }

        for (var memberCounter = 0; memberCounter < group.Members.length; memberCounter++) {
            var member = group.Members[memberCounter];
            if (member.MemberId == senderId) {
                messageToBroadCast.groupInfo = group; //groupManager.modifyGroup(member.MemberId, group);
                broadCastToClient(member.MemberId, messageToBroadCast, eventName, selfSocketId);
            }
        }
    }
    this.getAllsocket = function (senderId, group, messageToBroadCast, eventName, selfSocketId) {
        // console.log('broadCaster getAllsocket params = ', senderId);
        return connections;
    }
    this.sentToSelfConnection = function (senderId, group, messageToBroadCast, eventName, selfSocketId) {

        console.log('sentToSelfConnection = ', group);

        function broadCastToClient(memberId, messageToBroadCast, eventName, selfSocketId) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        //connections[i].Sockets.emit(eventName, 'user is typing');
                        //  if (connections[count].Sockets[i].id != selfSocketId)
                        connections[count].Sockets[i].emit(eventName, messageToBroadCast);
                    }
                }
            }
        }

        // for (var memberCounter = 0; memberCounter < group.Members.length; memberCounter++) {
        // var member = group.Members[memberCounter];
        // if (member.MemberId == senderId) {
        messageToBroadCast = group; //groupManager.modifyGroup(member.MemberId, group);
        broadCastToClient(senderId, messageToBroadCast, eventName, selfSocketId);
        // }
        //  }
    }

    this.sentToUser = function (targetId, messageToBroadCast, eventName) {

        console.log('sentToUSER = ');

        function broadCastToClient(memberId, messageToBroadCast, eventName) {

            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        connections[count].Sockets[i].emit(eventName, messageToBroadCast);
                    }
                }
            }
        }

        broadCastToClient(targetId, messageToBroadCast, eventName);
    }
}