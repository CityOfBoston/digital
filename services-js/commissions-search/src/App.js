/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import update from 'immutability-helper';

import Search from './Search';
import FacetList from './FacetList';
import ResultList from './ResultList';
/* eslint-enable no-unused-vars */

class App extends Component {
  /*
  Current state properties act as a buffer, holding changes made.   When the user clicks
  "apply", the hourglass, or hits Enter in the keyword input, the current state
  properties are copied to the submitted state, which may trigger a refresh of the
  result listing.
  */

  state = {
    currentKeywords: '',
    submittedKeywords: '',
    currentAreas: {},
    submittedAreas: {},
    currentSeats: 'seats-all',
    submittedSeats: 'seats-all',
  };

  handleCheckChange = event => {
    const target = event.target;
    const checked = target.checked;
    const name = target.name; //area id

    if (checked === false || checked === null) {
      // remove unchecked key
      const currentAreas = update(this.state.currentAreas, { $unset: [name] });
      this.setState({ currentAreas });
    } else {
      // add checked key
      const currentAreas = update(this.state.currentAreas, {
        [name]: { $set: checked }, // value checked
      });
      this.setState({ currentAreas });
    }
  };

  handleOptionChange = event => {
    this.setState({
      currentSeats: event.target.value,
    });
  };

  handleFacetSubmit = event => {
    event.preventDefault();
    this.setState({
      submittedAreas: this.state.currentAreas,
      submittedSeats: this.state.currentSeats,
    });
  };

  handleKeywordChange = event => {
    this.setState({
      currentKeywords: event.target.value,
    });
  };

  handleKeywordSubmit = event => {
    event.preventDefault();
    this.setState({
      submittedKeywords: this.state.currentKeywords,
    });
  };

  render() {
    return (
      <div className="App">
        <div className="b b--fw">
          <div className="b-c b-c--ntp">
            <div className="g">
              <div className="g--12 m-b300">
                <Search
                  keywords={this.state.currentKeywords}
                  handleKeywordChange={this.handleKeywordChange}
                  handleKeywordSubmit={this.handleKeywordSubmit}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="b b--fw b--g">
          <div className="b-c b-c--mh">
            <div className="g m-t000">
              <div className="g--3">
                <FacetList
                  handleCheckChange={this.handleCheckChange}
                  handleOptionChange={this.handleOptionChange}
                  handleFacetSubmit={this.handleFacetSubmit}
                  currentAreas={this.state.currentAreas}
                  currentSeats={this.state.currentSeats}
                />
              </div>
              <div className="g--9">
                <ResultList
                  submittedSeats={this.state.submittedSeats}
                  submittedKeywords={this.state.submittedKeywords}
                  submittedAreas={this.state.submittedAreas}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
