// @flow weak

import React, { PureComponent } from 'react';

import './bloodPressure.scss';
import {Card, CardText, CardTitle} from "material-ui";

class BloodPressure extends PureComponent {
  render() {
    return (
      <section id="BloodPressure__container">
        <Card>
          <CardTitle title={"Regression on Blood Pressure"} />
          <CardText>
            <span>
              For modeling the <em>systolic</em> and <em>diastolic</em> blood pressure of patients
              the following features have been used:
            </span>
            <ul>
              <li>Age</li>
              <li>BMI (clamped between 10 and 50)</li>
              <li>Gender</li>
              <li>Smoker Status</li>
            </ul>
            <span>
              Using a linear regression model, the following R-squared scores could be determinded:
            </span>
            <ul>
              <li><em>R2 Systolic:</em> 0.18</li>
              <li><em>R2 Diastolic:</em> 0.11</li>
            </ul>
          </CardText>
        </Card>
      </section>
    );
  }
}

export default BloodPressure;
