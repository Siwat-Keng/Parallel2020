import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./App.css";

import NavigationBar from "./Component/NavigationBar";
import LoginPage from "./Component/LoginPage";
import GroupList from "./Component/GroupList";
import ChatPanel from "./Component/ChatPanel";
import openSocket from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeText: "",
      currentPage: "Login",
      username: "",
      currentGroup: "Not in group.",
      isJoinGroupList: [],
      groupList: [],
      allChats: {
      }
    };

    this.socket = openSocket('http://localhost:8000');
    const me = this;
    
    this.socket.on('updateAllChats',function(data) {
      me.setState({...me.state, allChats:data});
    })
    this.socket.on('updateIsJoined', function(data){
      me.setState({...me.state, groupList:data.groupList, isJoinGroupList:data.isJoinGroupList })
    })
    this.socket.on('notifyNewGroup',function(data){
      me.socket.emit('getUpdateIsjoin',me.state.username)
    })
    this.SocketEmit = this.SocketEmit.bind(this);
    
    this.updateUsername = this.updateUsername.bind(this);
    this.updateCurrentPage = this.updateCurrentPage.bind(this);
    this.updateCurrentGroup = this.updateCurrentGroup.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.getRefsFromChild = this.getRefsFromChild.bind(this);
    this.getRefsFromChildChat = this.getRefsFromChildChat.bind(this);
    this.submitMessage = this.submitMessage.bind(this);
    this.userInput = this.userInput.bind(this);
    this.updateIsJoinGroupList = this.updateIsJoinGroupList.bind(this);
  }

  
  SocketEmit(event,value){
    this.socket.emit(event,value);
  }

  updateUsername(value) {
    this.setState({
      username: value
    });
  }
  updateCurrentPage(status) {
    this.setState({
      currentPage: status
    });
  }

  updateCurrentGroup(value) {
    this.setState({
      currentGroup: value
    });
  }
  onAddItem() {
    this.socket.emit('createGroup',{username:this.state.username, groupname:this.state.myRequestedRefs.groupName.value})
    this.state.myRequestedRefs.groupForm.reset();
  }
  createGroup(e) {
    e.preventDefault();
    var group = this.state.myRequestedRefs.groupName.value;
    if (typeof group === "string" && group.length > 0) {
      this.onAddItem();
    }
  }
  getRefsFromChild(childRef) {
    this.setState({
      myRequestedRefs: childRef
    });
  }

  updateIsJoinGroupList(newList){
    this.setState({isJoinGroupList:newList});
  }

  submitMessage(e) {
    e.preventDefault();
    var messagekub = {  userName: this.state.username,
      groupName: this.state.currentGroup, 
      text: ReactDOM.findDOMNode(this.state.myRequestedRefsChat.msg).value,
      timestamp: Date()
    };
    this.socket.emit('sendMessage',messagekub);
    ReactDOM.findDOMNode(this.state.myRequestedRefsChat.msg).value = "";
    this.userInput("");
  }
  userInput(value) {
    this.setState({
      typeText: value
    });
  }
  getRefsFromChildChat(chatRef) {
    this.setState({
      myRequestedRefsChat: chatRef
    });
  }

  render() {
    return (
      <div>
        {this.state.currentPage === "Chat" ? (
          <div>
            <NavigationBar
              updateUsername={this.updateUsername}
              username={this.state.username}
              currentGroup={this.state.currentGroup}
              updateCurrentPage={this.updateCurrentPage}
              currentPage={this.state.currentPage}
            />
            <GroupList
              updateCurrentGroup={this.updateCurrentGroup}
              currentGroup={this.state.currentGroup}
              username={this.state.username}
              createGroup={this.createGroup}
              isJoinGroupList={this.state.isJoinGroupList}
              groupList={this.state.groupList}
              onAddItem={this.onAddItem}
              passRefUpward={this.getRefsFromChild}
              updateIsJoinGroupList={this.updateIsJoinGroupList}
              SocketEmit={this.SocketEmit}
            />
            <ChatPanel
              username={this.state.username}
              currentGroup={this.state.currentGroup}
              isJoinGroupList={this.state.isJoinGroupList}
              groupList={this.state.groupList}
              allChats={this.state.allChats}
              typeText={this.state.typeText}
              submitMessage={this.submitMessage}
              userInput={this.userInput}
              passRefUpwardChat={this.getRefsFromChildChat}
            />
          </div>
        ) : this.state.currentPage === "Login" ? (
          <div>
            <LoginPage
              updateUsername={this.updateUsername}
              updateCurrentPage={this.updateCurrentPage}
              username={this.state.username}
              currentPage={this.state.currentPage}
              SocketEmit={this.SocketEmit}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
