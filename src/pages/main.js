import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './Home'


// order for blogs matters. the individual blogs must come before the base /blogs Route.
const Main = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/home" component={Home} />

  </Switch>
)

export default Main;