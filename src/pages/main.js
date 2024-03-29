import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './Home'
import Edit from './Edit'
import About from './About'

import Profile from './Profile'

// order for blogs matters. the individual blogs must come before the base /blogs Route.
const Main = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/home" component={Home} />
    <Route path="/edit" component={Edit} />
    <Route path="/about" component={About} />

    <Route path="/profile" component={Profile} />

  </Switch>
)

export default Main;