import React from 'react';
import { Route, IndexRoute } from 'react-router';
import "./App.css";

import App from '../App';
import ChatBox from './Components/ChatBox';
import ChatRoom from './Components/ChatRoom';

export default (
  <Route path="/" component={App}>
    <Route path="/ChatBox" component={ChatBox} />
    <Route path="/ChatRoom" component={ChatRoom} />
  </Route>
);