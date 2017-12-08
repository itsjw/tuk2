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
import {
  getMostCommonDiseasesByYearOfBirth
}                         from '../../services/API/commonDiseases';

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
        .then((resp) => {
          let series = Object.keys(resp.data).map((disease) => ({
            name: disease,
            data: Object.values(resp.data[disease])
          }));
          let categories = [];
          if(series.length > 0) {
            categories = Object.keys(resp.data[series[0].name]); //all ears of birth
          }
          
          //don't need to save it in a state
          //this.setState({series: resp.data.series, categories: resp.data.categories});

          Highcharts.chart('highchart', { 
            chart: {
                type: 'line',
            },
            title: {
                text: 'Most Common Diseases by Year of Birth'
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Count'
                }
            },
            series: series,
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
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
          <Card style={{margin:20}}>
            <CardTitle
              title="10 Most Common Diseases"
            />
            <CardText>
              <div id="highchart" className="highchart"></div>
            </CardText>
          </Card>
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