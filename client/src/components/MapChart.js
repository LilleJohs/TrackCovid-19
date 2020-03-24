
import React, { Component } from "react";
import axios from 'axios';
import { scaleLog } from "d3-scale";
import {
  Graticule,
  Sphere,
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";

const colorScale = scaleLog()
  .base(10)
  .domain([0.1, 1000])
  .range(["#ffedea", "#ff5233"]);

const geoUrl =
"https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

class MapChart extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      countrySummary: [],
      countryText: ''
    };
  }

  componentDidMount() {
    let baseURL;
    if (process.env.NODE_ENV === 'production') {
      baseURL = 'https://usenano.org/summary';
    } else {
      baseURL = 'http://localhost:5000/summary';
    }

    const url = baseURL;
    axios.get(url).then((res) => {
      let countrySummary = {};
      for (var i in res.data) {
        const country = res.data[i];
        if (country['infected'] == null) {
          countrySummary[country['country']] = -1;
        } else {
          countrySummary[country['country']] = country['infected'];
        }
      }
      this.setState({
        countrySummary: countrySummary
      });
    });
  }
  
  render() {
    if (this.state.countrySummary.length === 0) {
      return (<></>);
    }
    return (
      <div>
        <ComposableMap data-tip="" projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
          center: [0, 0]
        }}
        height={400}>
        <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name = geo.properties.NAME;
                const countrySummary = this.state.countrySummary;
                const d = countrySummary[name.toLowerCase()];
                const infected = (d != null) ? d : -1;
                return (<Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill = {infected !== -1 ? colorScale(parseInt(infected)/geo.properties.POP_EST*1000000) : '#dddddd'}
                  onMouseEnter={() => {
                    const infectedString = infected !== -1 ? parseInt(infected).toLocaleString() : 'No info';
                    this.setState({countryText: `${name} \n Infected: ${infectedString} Population ${geo.properties.POP_EST}`});
                  }}
                  onMouseLeave={() => {
                    this.setState({countryText: ""});
                  }}
                  onMouseDown={() => {
                    this.props.changeHighlightedCountry(name.toLowerCase())
                  }}
                  style={{
                    hover: {
                      fill: "#F53",
                      outline: "none"
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none"
                    }
                  }}
                />);}
              )
            }
          </Geographies>
        </ComposableMap>
        <ReactTooltip>{this.state.countryText}</ReactTooltip>
      </div>
    );
  }
}

export default MapChart;
