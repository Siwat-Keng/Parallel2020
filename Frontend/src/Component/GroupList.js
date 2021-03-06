import React, { Component } from "react";
import "../CSS/GroupList.css";

class GroupList extends Component {
  checkJoinStatus(value,leave,join) {
    var groupList = this.props.groupList;
    var isJoin = this.props.isJoinGroupList;
    return isJoin[groupList.indexOf(value)] ? leave : join;
  }
  componentDidMount() {
    this.props.passRefUpward(this.refs)
  }
  
  render() {
    return (
      <div className="groupList-container">
        <form
          className="form-inline"
          ref="groupForm"
          onSubmit={this.props.createGroup}
          id="formPanel"
        >
          <div className="form-group">
            <label className="addLabel">
              <input
                type="text"
                id="groupItem"
                placeholder="Create New Group Here"
                ref="groupName"
                className="form-control"
              />
            </label>
          </div>
          <button
            type="submit"
            id="addButton"
            className="btn btn-primary btn-sm"
          >
            <i className="fas fa-plus" />
          </button>
        </form>

        <ul className="list-group">
          {this.props.groupList.map(function(listvalue) {
            return (
              <div key={listvalue}>
                <li
                  className="list-group-item list-group-item-info"
                  id="eachGroupItem"
                  onClick={e => {
                    this.props.updateCurrentGroup(listvalue);
                  }}
                >
                  {listvalue}{this.checkJoinStatus(listvalue,' (Joined)',' (Not-Join)')}
                </li>
                <button
                  type="submit"
                  className={this.checkJoinStatus(listvalue,'leave','join')}
                  value={this.checkJoinStatus(listvalue,'leave','join') +'_'+ listvalue} 
                  onClick={e => {
                    var tmp = e.target.value.split("_");
                    if(tmp[0] === "leave") {
                      this.props.SocketEmit('leaveGroup',{username:this.props.username,groupname:tmp[1]})
                    } else if (tmp[0] === "join"){
                      this.props.SocketEmit('joinGroup',{username:this.props.username,groupname:tmp[1]})
                      this.props.updateCurrentGroup(tmp[1])
                    }
                  }}
                >
                {this.checkJoinStatus(listvalue,'leave','join')}
                </button>
              </div>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}

export default GroupList;
