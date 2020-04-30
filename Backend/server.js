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
mongoose.connect('mongodb+srv://testds:@123456789@cluster0-4tpcn.mongodb.net/test',{ useNewUrlParser: true }); // test =  database name
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('DB connected!')});

function userEnter(data,socket) { //data = username "Dongglue"}
  User.find({name:data},function(err,users){
    if(err) {console.log(err);}
    // TODO [DB] : Create user if not existed
    if(!users.length) { // user == [] อันนี้เขียนๆไปก่อน ไม่รู้ js เช๊คไง
      console.log('>>> Create New User na')
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
    var isJoinGroupListkub = [];
    let k = 0;      
    groupListkub.forEach(function(element){
      JoinedGroupInfo.find({username:username,groupname:element},function(err,data){
        if (data.length == 0) {
          isJoinGroupListkub.push(false);
        } else {
          isJoinGroupListkub.push(true);
        }
        k += 1; 
        if(k==groupListkub.length){
          socket.emit("updateIsJoined",{groupList:groupListkub, isJoinGroupList:isJoinGroupListkub});
          console.log({groupList:groupListkub, isJoinGroupList:isJoinGroupListkub})
          console.log('emit groupListSomething lew!')
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

  // After click enter button , data = username 
  socket.on('enter', function (data) {
    userEnter(data,socket);
  });
  
  socket.on('sendMessage', function(data){ // data = {userName,GroupName,timestamp,text}
    var newMessage = new Message(data)
    newMessage.save(function(err){
      if (err) {return err;}
      BroadcastAllChats(socket);
    }); 
  })
  socket.on('joinGroup', function(data){ //data = {username:'dongglue',groupname:'3L'}
      var joinNewGroup = new JoinedGroupInfo({username:data.username,groupname:data.groupname})
      joinNewGroup.save(function(err){
        if (err) {return err;}
        EmitGroupInfo(data.username,socket);
      });
      
    })
    
  socket.on('leaveGroup', function(data){//data = {username:'dongglue',groupname:'3L'}
      JoinedGroupInfo.deleteMany(data,function(err){
        if (err) {return err;}
        EmitGroupInfo(data.username,socket);
      });
      
    })
  
  socket.on('createGroup', function(data){ //data = {username:'dongglue',groupname:'3L'}
      new Group({name:data.groupname}).save(function(err){
        if (err) {return err;}   
        io.emit('notifyNewGroup',"eiei")
      });
      var newGroupJoin = new JoinedGroupInfo({username:data.username,groupname:data.groupname});
      newGroupJoin.save();
      
  })
  socket.on('getUpdateIsjoin',function(data){ // data = username
      EmitGroupInfo(data,socket);
  })
  socket.on('disconnect', function () {
    io.emit('a user disconnected');
  });

});