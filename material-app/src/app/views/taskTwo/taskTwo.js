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
  queryEndpoint
}                         from '../../services/API/queryEndpoint';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import './taskTwo.scss';

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
      corr: [],
      corrRange: []
    };
  
    componentDidMount() {
      this.enterAnimationTimer = setTimeout(this.setViewEnters, 500);
      this.getData();
      this.getDataCorr();      
      this.getDataCorrRange();  
    }
  
    componentWillUnmount() {
      clearTimeout(this.enterAnimationTimer);
    }
  
    getData() {
      queryEndpoint('most-common-diseases-by-year-of-birth')
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
                text: 'Most Common Diseases by Age Group'
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

    getDataCorr() {
      queryEndpoint('most-common-diseases-correlations')
      .then((resp)=> {
        this.setState({corr: resp.data});
        console.log(resp.data);
      });
    };

    getDataCorrRange() {
      queryEndpoint('most-common-diseases-correlations-per-range')
      .then((resp)=> {
        this.setState({corrRange: resp.data});
        console.log(resp.data);
      });
    };

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
          <Card style={{margin:20}}>
            <CardTitle
              title="10 Most Common Diseases Appearing together"
            />
            <CardText>
                <Table height="300px">
                  <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                    <TableRow>
                      <TableHeaderColumn>Occurences</TableHeaderColumn>
                      <TableHeaderColumn>Disease #1</TableHeaderColumn>
                      <TableHeaderColumn>Disease #2</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                    {this.state.corr.map( (row, index) => (
                      <TableRow key={index}>
                        <TableRowColumn>{row.COUNT}</TableRowColumn>
                        <TableRowColumn>{row.DISEASE1}</TableRowColumn>
                        <TableRowColumn>{row.DISEASE2}</TableRowColumn>
                      </TableRow>
                      ))}
                  </TableBody>
                </Table>
            </CardText>
          </Card>

          <Card style={{margin:20}}>
            <CardTitle
              title="Most Common Diseases Appearing together per ICD9 Code Range"
            />
            <CardText>
                <Table height="300px">
                  <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                    <TableRow>
                      <TableHeaderColumn>ICD9 Code Range</TableHeaderColumn>
                      <TableHeaderColumn>Disease #1</TableHeaderColumn>
                      <TableHeaderColumn>Disease #2</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                    {this.state.corrRange.map( (row, index) => (
                      <TableRow key={index}>
                        <TableRowColumn>{row.ICD9RANGE}</TableRowColumn>
                        <TableRowColumn>{row.DISEASE1}</TableRowColumn>
                        <TableRowColumn>{row.DISEASE2}</TableRowColumn>
                      </TableRow>
                      ))}
                  </TableBody>
                </Table>
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