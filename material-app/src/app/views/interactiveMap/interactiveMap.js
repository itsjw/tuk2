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
import TextField          from "material-ui/TextField";
import AppBar             from 'material-ui/AppBar';
import FlatButton         from 'material-ui/FlatButton';
import SelectField        from 'material-ui/SelectField';
import MenuItem           from 'material-ui/MenuItem';
import DropDownMenu       from 'material-ui/DropDownMenu';
import RaisedButton       from 'material-ui/RaisedButton';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle}           from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import DataMaps           from '../../components/datamaps.js';
import statesData         from '../../data/states-data';
import createHistory      from 'history/createBrowserHistory';
import {getKPI}           from '../../services/API/getKPI';
import './interactiveMap.scss';

class InteractiveMap extends PureComponent {
  static propTypes = {
    // react-router 4:
    match:    PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history:  PropTypes.object.isRequired
  };

  enterAnimationTimer= null;

  state = {
    animated: true,
    viewEnters: false,
    entity: this.props.match.params.entity,
    year: this.props.match.params.year*1,
    gender: this.props.match.params.gender,
    data: statesData
  };

  history = createHistory();
  getKPI = getKPI;

  setEntity(event, key, value) {
    this.setState({entity: value});
    this.getData();
  }
  setYear(event, value) {
    this.setState({year: value * 1});
    this.getData();
  }
  setGender(event, key, value) {
    this.setState({gender: value});
    this.getData();
  }

  getData() {
    this.history.push('/map/' + [this.state.entity, this.state.year, this.state.gender].join('/'));
    this.getKPI(this.state.entity, this.state.year, this.state.gender)
      .then((data) => {
        console.log(data);
        this.setState(data);
      });
  }

  componentDidMount() {
    this.enterAnimationTimer = setTimeout(this.setViewEnters, 500);
    this.getData();
  }

  componentWillUnmount() {
    clearTimeout(this.enterAnimationTimer);
  }

  render() {
    const { animated, viewEnters } = this.state;

    return(
      <section
        id="interactiveMap__container"
        className={
          cx({
            'content':       true,
            'animatedViews': animated,
            'invisible':     !viewEnters,
            'view-enter':    viewEnters
          })
        }>
        <div>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <DropDownMenu value={this.state.entity} onChange={this.setEntity.bind(this)}>
                <MenuItem value={'patients-count'} primaryText="Count of patients" />
                <MenuItem value={'visits-count'} primaryText="Count of visits" />
                <MenuItem value={'patients-relative'} primaryText="Patients per 1 Mio" />
                <MenuItem value={'visits-relative'} primaryText="Visits per 1 Mio" />
                <MenuItem value={'average-bmi'} primaryText="Average BMI" />
                <MenuItem value={'smoker-relative'} primaryText="Share of Smokers" />
              </DropDownMenu>
            </ToolbarGroup>
            <ToolbarGroup>
              <ToolbarTitle text="Filter" />
              <TextField
                  hintText="Year"
                  type="number"
                  value={this.state.year}
                  onChange={this.setYear.bind(this)}
              />
              <DropDownMenu
                  value={this.state.gender}
                  onChange={this.setGender.bind(this)}
                >
                <MenuItem value={'all'} primaryText="Both" />
                <MenuItem value={'F'} primaryText="Female" />
                <MenuItem value={'M'} primaryText="Male" />
              </DropDownMenu>
              <ToolbarSeparator />
              <RaisedButton label="Update" primary={true} onClick={this.getData.bind(this)}/>
            </ToolbarGroup>
          </Toolbar>
          <DataMaps regionData={this.state.data}/>
          </div>
      </section>
    );
  }

  setViewEnters = () => {
    this.setState({viewEnters: true});
  }

  routeToHome = event => {
    event.preventDefault();
    const { history } = this.props;
    history.push({pathname: '/'});
  }

  goPreviousRoute = () => {
    const { history } = this.props;
    history.goBack();
  }
}

InteractiveMap.propTypes= {

};

InteractiveMap.contextTypes = {
  // for manual routing
  router: React.PropTypes.object.isRequired
};

export default InteractiveMap;
