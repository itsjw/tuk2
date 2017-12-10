// @flow weak

/* eslint no-process-env:0 */

import React from 'react';
import {
  Route,
  Switch
} from 'react-router';
import { App } from '../containers';
import {
  InteractiveMap,
  TaskTwo,
  PatientVisits,
  PageNotFound
} from '../views';

const Routes = () => {
  return (
    <Switch path="/" component={App} >
      <Route exact path="/" component={InteractiveMap} />
      <Route path="/map/:entity/:year/:gender" component={InteractiveMap} />
      <Route path="/task-two" component={TaskTwo} />
      <Route path="/patient-visits" component={PatientVisits} />
      <Route component={PageNotFound} />
    </Switch>
  );
};

export default Routes;
