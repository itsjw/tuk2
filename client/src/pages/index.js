/* eslint-disable flowtype/require-valid-file-annotation */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from 'material-ui/Dialog';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import withRoot from '../components/withRoot';
import AppBar from '../components/AppBar';
import ReactHighcharts from 'react-highcharts'; // Expects that Highcharts was loaded in the code.

const map = require('../maps/world');

const styles = {
  root: {
    textAlign: 'center',
    paddingTop: 200,
  },
};

const config = {
  chart: {
      borderWidth: 1
  },

  colors: ['rgba(19,64,117,0.05)', 'rgba(19,64,117,0.2)', 'rgba(19,64,117,0.4)',
      'rgba(19,64,117,0.5)', 'rgba(19,64,117,0.6)', 'rgba(19,64,117,0.8)', 'rgba(19,64,117,1)'],

  title: {
      text: 'Population density by country (/km²)'
  },

  mapNavigation: {
      enabled: true
  },

  legend: {
      title: {
          text: 'Individuals per km²',
          style: {
              color: 'black'
          }
      },
      align: 'left',
      verticalAlign: 'bottom',
      floating: true,
      layout: 'vertical',
      valueDecimals: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      symbolRadius: 0,
      symbolHeight: 14
  },

  colorAxis: {
      dataClasses: [{
          to: 3
      }, {
          from: 3,
          to: 10
      }, {
          from: 10,
          to: 30
      }, {
          from: 30,
          to: 100
      }, {
          from: 100,
          to: 300
      }, {
          from: 300,
          to: 1000
      }, {
          from: 1000
      }]
  },

  series: [{
      data: null,
      mapData: map,
      joinBy: ['iso-a2', 'code'],
      animation: true,
      name: 'Population density',
      states: {
          hover: {
              color: '#a4edba'
          }
      },
      tooltip: {
          valueSuffix: '/km²'
      },
      shadow: false
  }]
}

class Index extends Component {
  state = {
    open: false,
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  handleClick = () => {
    this.setState({
      open: true,
    });
  };

  render() {
    return (
      <div className={this.props.classes.root}>
        <AppBar />
        <ReactHighcharts config = {config}></ReactHighcharts>
        <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
          <DialogTitle>Super Secret Password</DialogTitle>
          <DialogContent>
            <DialogContentText>1-2-3-4-5</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleRequestClose}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
        <Typography type="display1" gutterBottom>
          Material-UI
        </Typography>
        <Typography type="subheading" gutterBottom>
          example project
        </Typography>
        <Button raised color="accent" onClick={this.handleClick}>
          Super Secret Password
        </Button>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRoot(withStyles(styles)(Index));
