// @flow weak

import React, { PureComponent } from 'react';
import Highcharts from 'highcharts';
import { Card, CardText, CardTitle, Slider } from 'material-ui';

import { getPatientVisits } from '../../services/API/patientVisits';
import linSpace from '../../data/linSpace';
import './patientVisit.scss';

require('highcharts/modules/exporting')(Highcharts);

class PatientVisits extends PureComponent {

  state = {
    data: null,
    degree: 8,
    mse: 0,
  };

  componentDidMount() {
    getPatientVisits().then(data => {
      this.setState({ data });
      this.setDegree(8);
    });
  }

  setDegree(degree) {
    this.setState({ degree: degree , mse: this.getMse() });
    this.updateChart();
  }

  updateChart() {
    this.generateChart(this.state.data, this.state.degree);
  }

  render() {
    return (
      <section id="PatientVisits__container" >
        <Card>
          <CardTitle title="Average Patient Visits Per Age Group" />
          <CardText>
            <div className="options">
              <span>Degree: {this.state.degree}</span>
              <span className="right">MSE: {this.state.mse}</span>
              <Slider min={1} max={10} step={1}
                      value={this.state.degree}
                      onChange={this.handleDegreeChange.bind(this)}
              />
            </div>
            <div id="patient-visits-chart" />
          </CardText>
        </Card>
      </section>
    );
  }

  handleDegreeChange(event, value) {
    this.setDegree(value);
  }


  getMse() {
    if (!this.state.data) return 0;
    const mse = this.state.data.interpolation[this.state.degree - 1].MSE;
    return mse.toFixed(4);
  }

  getAgeGroupVisitsPoints(ageGroups) {
    return ageGroups.map(ageGroup => [ageGroup.AGEGROUP * 10 - 5, Number(ageGroup.AVGVISITS)])
  }

  getInterpolationPoints(interpolation, degree) {
    interpolation = interpolation[degree - 1].INTERPOLATION;
    return interpolation.map((y, index) => [linSpace[index], y])
  }

  getAgeVisitsPoints(ageVisits) {
    return ageVisits.map(ageVisit => [ageVisit.AGE, Number(ageVisit.AVGVISITS)])
  }

  generateChart(data, degree) {
    Highcharts.chart('patient-visits-chart', {
      title: 'Average Patient Visits',
      xAxis: { title: 'Age', min: 10, max: 100 },
      yAxis: { title: 'Avg Visits', min: 5, max: 20 },
      series: [
        {
          type: 'line',
          name: 'Interpolation',
          data: this.getInterpolationPoints(data.interpolation, degree),
          color: 'blue',
          marker: { enabled: false },
          enableMouseTracking: false,
        },
        {
          type: 'scatter',
          name: 'Avg Visits Per Age',
          data: this.getAgeVisitsPoints(data.avgVisits),
          color: 'green',
          animation: false,
        },
        {
          type: 'scatter',
          name: 'Avg Visits Per Age Group',
          data: this.getAgeGroupVisitsPoints(data.ageGroups),
          color: 'red',
          animation: false,
        },
      ]
    })

  }
}

export default PatientVisits;
