import React, { Component } from "react";
import MapChart from "./components/MapChart";
import Plotter from "./components/Plotter";

import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from 'react-bootstrap/Navbar';

export default class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      name: 'italy'
    };
  }

  changeHighlightedCountry(country) {
    console.log(country);
    this.setState({
        name: country
    });
  }

  render() {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand className='navbar'>
            Corona Tracker
          </Navbar.Brand>
        </Navbar>
        <div className="row">
          <div className="columnMap"><MapChart changeHighlightedCountry={(name) => this.setState({ name: name })}/></div>
          <div className="columnPlot"><Plotter highlightedCountry={this.state.name}/></div>
        </div>
      </div>
    );
  }
}