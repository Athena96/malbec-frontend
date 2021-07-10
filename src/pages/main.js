import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './Home'

import Profile from './Profile'
import Times from './Times'

// order for blogs matters. the individual blogs must come before the base /blogs Route.
const Main = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/home" component={Home} />

    <Route path="/update/profile" component={Profile} />
    <Route path="/times" component={Times} />

  </Switch>
)

export default Main;