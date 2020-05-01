import React, { Component } from "react";
import "../CSS/LoginPage.css";
import { NavLink } from "react-router-dom";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class LoginPage extends Component {
  constructor() {
    super();
    this.submitHandler = this.submitHandler.bind(this);
  }
  submitHandler(e) {
    if (this.props.username.trim().length > 0)
      this.props.updateCurrentPage("Chat");
    else return false;
  }
  render() {
    return (
      <div className="Login-Page">
        <div className="Field-Container">
          <h1 className="enterText">Ohm and his friends</h1>
          <br />
          <form onSubmit={this.submitHandler}>
            <TextField 
            id="nameField"
            label="Enter name here" 
            variant="filled" 
            error={this.props.username.trim().length > 0}
            helperText={this.props.username.trim().length > 0?'':'Do not let your name blank.'}            
            onChange={e => {
              this.props.updateUsername(e.target.value);
            }}
            />
          </form>
          <br />
          <div>
            <NavLink to="/ChatRoom">
              <Button
              disabled={!this.props.username.trim().length > 0}
              variant="contained"
              onClick={e => {
                this.props.updateCurrentPage("Chat");
                this.props.SocketEmit('enter',this.props.username)
              }}
              >
                Login
              </Button>
            </NavLink>
          </div>
      </div>
    </div>
    );
  }
}
export default LoginPage;
