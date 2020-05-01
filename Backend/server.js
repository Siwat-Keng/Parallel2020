// const express = require('express');
const APP_PORT = 8000;
const io = require('socket.io').listen(APP_PORT);
console.log('listening on port ', APP_PORT);
const mongoose = require('mongoose');
const User = require('./models/user');
const Group = require('./models/group');
const JoinedGroupInfo = require('./models/groupjoinedinfo');
const Message = require('./models/message');

// DB ---------------------------------------------------------------------------
mongoose.connect('mongodb://heroku_zc4mlqgb:2ct3dvil75tcolpffo6jaipvmi@ds047335.mlab.com:47335/heroku_zc4mlqgb',{ useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('DB connected!')});

function userEnter(data,socket) {
  User.find({name:data},function(err,users){
    if(err) {console.log(err);}
    if(!users.length) {
      var newUser = new User({name:data});
      newUser.save();
    }
    EmitAllChats(socket);
    EmitGroupInfo(data,socket)
  })
}

function EmitGroupInfo(username,socket){
  var groupListkub = [] ;
  Group.find({},function(err,data){
    data.forEach(function(element) { 
      groupListkub.push(element.name);
    })
    var isJoinGroupListkub = new Array(groupListkub.length);
    isJoinGroupListkub.fill(false)
    let k = 0;      
    groupListkub.forEach(function(element){
      JoinedGroupInfo.find({username:username,groupname:element},function(err,data){
        if (data.length > 0) {
          isJoinGroupListkub[groupListkub.indexOf(element)] = true
        }
        k += 1; 
        if(k==groupListkub.length){
          socket.emit("updateIsJoined",{groupList:groupListkub, isJoinGroupList:isJoinGroupListkub});
        }
      })
    })
  })

}

function EmitAllChats(socket){
  var allChats = {};
  var allChat = [];
  Group.find({},function(err,allGroups) {
    allGroups.forEach(function(data){
      allChat.push(data.name);
    })
    let j = 0;
    allChat.forEach(function(data){
      Message.find({groupName:data}).sort('timestamp').exec(function(err,msg){
        allChats[data] = msg.map(function(item,index){
          return {username:item.userName, content:item.text, timeStamp:item.timestamp.getHours()+":"+item.timestamp.getMinutes() }
        });
        j+=1
        if(j==allChat.length){
          socket.emit('updateAllChats',allChats);
        }
      })
    })
  })
}

function BroadcastAllChats(socket){
  var allChats = {};
  var allChat = [];
  Group.find({},function(err,allGroups) {
    allGroups.forEach(function(data){
      allChat.push(data.name);
    })
    let j = 0;
    allChat.forEach(function(data){
      Message.find({groupName:data}).sort('timestamp').exec(function(err,msg){
        allChats[data] = msg.map(function(item,index){
          return {username:item.userName, content:item.text, timeStamp:item.timestamp.getHours()+":"+item.timestamp.getMinutes() }
        });
        j+=1
        if(j==allChat.length){
          io.emit('updateAllChats',allChats);
        }
      })
    })
  })
}

io.on('connection', function (socket) {

  socket.on('enter', function (data) {
    userEnter(data,socket);
  });
  
  socket.on('sendMessage', function(data){
    var newMessage = new Message(data)
    newMessage.save(function(err){
      if (err) {return err;}
      BroadcastAllChats(socket);
    }); 
  })
  socket.on('joinGroup', function(data){
      var joinNewGroup = new JoinedGroupInfo({username:data.username,groupname:data.groupname})
      joinNewGroup.save(function(err){
        if (err) {return err;}
        EmitGroupInfo(data.username,socket);
      });
      
    })
    
  socket.on('leaveGroup', function(data){
      JoinedGroupInfo.deleteMany(data,function(err){
        if (err) {return err;}
        EmitGroupInfo(data.username,socket);
      });
      
    })
  
  socket.on('createGroup', function(data){
      new Group({name:data.groupname}).save(function(err){
        if (err) {return err;}   
        io.emit('notifyNewGroup',"eiei")
      });
      var newGroupJoin = new JoinedGroupInfo({username:data.username,groupname:data.groupname});
      newGroupJoin.save();
      
  })
  socket.on('getUpdateIsjoin',function(data){
      EmitGroupInfo(data,socket);
  })
  socket.on('disconnect', function () {
    io.emit('a user disconnected');
  });

});