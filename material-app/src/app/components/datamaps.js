import * as d3 from "d3";
import Datamap from 'datamaps/dist/datamaps.usa.min'
import React from 'react';
import ReactDOM from 'react-dom';
import statesDefaults from '../data/states-defaults';
import objectAssign from 'object-assign';

export default class DataMap extends React.Component {
  constructor(props){
    super(props);
    this.datamap = null;
  }
  linearPalleteScale(value){
    const dataValues = this.props.regionData.map(function(data) { return data.value });
    const minVal = Math.min(...dataValues);
    const maxVal = Math.max(...dataValues);
    return d3.scaleLinear().domain([minVal, maxVal]).range(["#EFEFFF","#02386F"])(value);
  }
  redducedData(){
    const newData = this.props.regionData.reduce((object, data) => {
      object[data.code] = { value: data.value, fillColor: this.linearPalleteScale(data.value) };
      return object;
    }, {});
    return objectAssign({}, statesDefaults, newData);
  }
  renderMap(){
    return new Datamap({
      element: ReactDOM.findDOMNode(this),
      scope: 'usa',
      height: 700,
      width: 1300,
      data: this.redducedData(),
      geographyConfig: {
        borderWidth: 0.5,
        highlightFillColor: '#FFCC80',
        popupTemplate: function(geography, data) {
          if (data && data.value) {
            return '<div class="hoverinfo"><strong>' + geography.properties.name + ', ' + data.value + '</strong></div>';
          } else {
            return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
          }
        }
      }
    });
  }
  currentScreenWidth(){
    return window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
  }
  componentDidMount(){
    const mapContainer = d3.select('#datamap-container');
    const initialScreenWidth = this.currentScreenWidth();
    const containerWidth =  { width: '900px', height: '600px', position:'absolute' };

    mapContainer.style(containerWidth);
    this.datamap = this.renderMap();
  }
  componentDidUpdate(){
    this.datamap.updateChoropleth(this.redducedData());
  }
  componentWillUnmount(){
    d3.select('svg').remove();
  }
  render() {
    return (
      <div id="datamap-container"></div>
    );
  }
}

DataMap.propTypes = {
    regionData: React.PropTypes.array.isRequired
};