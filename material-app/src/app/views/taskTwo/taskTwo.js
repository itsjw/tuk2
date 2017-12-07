// @flow weak

import React, {
    PureComponent
  }                         from 'react';
import PropTypes          from 'prop-types';
import cx                 from 'classnames';
import {
  Card,
  CardActions,
  CardTitle,
  CardText
}                         from 'material-ui/Card';
import FlatButton         from 'material-ui/FlatButton';
import {getMostCommonDiseasesByYearOfBirth}           from '../../services/API/commonDiseases';
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
  
  class TaskTwo extends PureComponent {
    static propTypes = {
      // react-router 4:
      match:    PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      history:  PropTypes.object.isRequired
    };
  
    static contextTypes = {
      // for manual routing
      router: PropTypes.object.isRequired
    };
  
    enterAnimationTimer = null;
  
    state = {
      animated: true,
      viewEnters: false,
      categories: [],
      series: []
    };
  
    componentDidMount() {
      this.enterAnimationTimer = setTimeout(this.setViewEnters, 500);
      this.getData();
      
    }
  
    componentWillUnmount() {
      clearTimeout(this.enterAnimationTimer);
    }
  
    getData() {
      getMostCommonDiseasesByYearOfBirth()
        .then((data) => {
          console.log(data.data);
          this.setState({series: data.data.series});
          this.setState({categories: data.data.categories});
          console.log(this.state.series);
          console.log(this.state.categories);
          Highcharts.chart('highchart', { 
            chart: {
                type: 'line'
            },
            title: {
                text: 'Fruit Consumption'
            },
            xAxis: {
                categories: this.state.categories
            },
            yAxis: {
                title: {
                    text: 'Fruit eaten'
                }
            },
            series: this.state.series
           });
        });
    }

    render() {
      const { animated, viewEnters } = this.state;
  
      return(
        <section
          id="TaskTwo__container"
          className={
            cx({
              'content':       true,
              'animatedViews': animated,
              'invisible':     !viewEnters,
              'view-enter':    viewEnters
            })
          }>
          <div className="row">
            <div className="col-md-8 col-md-offset-2">
              <div className="box">
                <h1>Test</h1>
                <div id="highchart" className="highchart"></div>
              </div>
            </div>
          </div>
        </section>
      );
    }
  
    setViewEnters = () => {
      this.setState({viewEnters: true});
    }
  
    goPreviousRoute = () => {
      const { history } = this.props;
      history.goBack();
    }
  }
  
  export default TaskTwo;  