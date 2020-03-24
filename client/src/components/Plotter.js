
import React, { Component } from "react";
import Plotly from "plotly.js-basic-dist";

import createPlotlyComponent from "react-plotly.js/factory";
import axios from 'axios'

import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

const Plot = createPlotlyComponent(Plotly);

class Plotter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      highlightedCountry: props.highlightedCountry,
      data: [],
      toggleValues: [1,2],
      logPlot: true
    };   
  }

  componentWillReceiveProps(prevProps) {
    if(prevProps.highlightedCountry !== this.props.highlightedCountry) {
      this.fetchData(prevProps.highlightedCountry);
    }
  }

  fetchData(highlightedCountry) {
    let baseURL;
    if (process.env.NODE_ENV === 'production') {
      baseURL = 'https://usenano.org/country?name=';
    } else {
      baseURL = 'http://localhost:5000/country?name=';
    }
    axios.get(baseURL + highlightedCountry).then((res) => {
      this.setState({
        highlightedCountry: highlightedCountry,
        data: res.data
      });
      console.log(highlightedCountry);
    });
  }
  
  render() {
    const data = this.state.data;
    if (data.length === 0) {
      return <div>Pick a country</div>;
    } else if (data === 'NO_DATA') {
      return <div>No data available</div>;
    }

    let xAxis = [];
    let yAxisInfected = [];
    let yAxisDeaths = [];
    let plotData = [];

    for (var i in data) {
      xAxis.push(data[i]['date']);
      yAxisInfected.push(data[i]['infected'])
      yAxisDeaths.push(data[i]['deaths'])
    }

    const toggleValues = this.state.toggleValues;
    if (toggleValues.includes(1)) {
      plotData.push({
          x: xAxis,
          y: yAxisInfected,
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'red'},
          name: 'Infected'
        });
    }
    if (toggleValues.includes(2)) {
        plotData.push({
          x: xAxis,
          y: yAxisDeaths,
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'black'},
          name: 'Deaths'
        });
    }

    return (
      <div>
        <h2 class='capitalize'>{this.state.highlightedCountry}</h2>
        <div>
          <p>Infected: {yAxisInfected[0]} - Deaths: {yAxisDeaths[0] === ''? 'No Info' : yAxisDeaths[0]} - Mortality rate: {yAxisDeaths[0] === ''? 'No Info' : Math.round(yAxisDeaths[0]/yAxisInfected[0]*100*100)/100}%</p>
        </div>  
        <Plot
          className = 'plot'
          data={plotData}
          config ={{displayModeBar: false}}
          layout = {{
            yaxis: {type: this.state.logPlot ? 'log' : 'normal'},
            margin: {
              l: 50,
              r: 130,
              b: 50,
              t: 0,
              pad: 10
            }}
          }
        />
        <ToggleButton type="checkbox" checked={this.state.logPlot} onChange={() => this.setState({logPlot: !this.state.logPlot})}>Logarithmic</ToggleButton>
        <div>
          <ToggleButtonGroup type="checkbox" value={this.state.toggleValues} onChange={(val) => this.setState({toggleValues: val})}>
            <ToggleButton value={1}>Show Infected</ToggleButton>
            <ToggleButton value={2}>Show Deaths</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    );
  }
}

export default Plotter;
