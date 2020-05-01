import React from "react";

const Message = ({ chat, user }) => (
  <li className={`chat ${user === chat.username ? "right" : "left"}`}>
    <span className="profile">
      <img className={`${user === chat.username ? "right" : "left"}`} src={"https://avatars.dicebear.com/v2/male/"+chat.username+".svg"} alt="Avatar"/>
      <div className={`chatname ${user === chat.username ? "right" : "left"}`}>
        {chat.username}
      </div>
    </span>
    <div className={`content ${user === chat.username ? "right" : "left"}`}>
    <p>{chat.content}</p>
    </div>
    <div className={`time ${user === chat.username ? "left" : "right"}`}>
    {chat.timeStamp}
    </div>
  </li>
);

export default Message;
