/* eslint-disable no-unused-vars */
import React from 'react';
import update from 'immutability-helper';
import Search from './Search';
import FacetList from './FacetList';
import ResultList from './ResultList';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-2187282-27');

class App extends React.Component {
  /*
  Current state properties act as a buffer, holding changes made.   When the user clicks
  "apply", the hourglass, or hits Enter in the keyword input, the current state
  properties are copied to the submitted state, which may trigger a refresh of the
  result listing.
  */
  constructor(props) {
    super(props);

    this.state = {
      currentKeywords: '',
      submittedKeywords: '',
      currentAreas: {},
      submittedAreas: {},
      currentSeats: 'seats-all',
      submittedSeats: 'seats-all',
    };
  }

  handleCheckChange = event => {
    const target = event.target;
    const checked = target.checked;
    const name = target.name; //area id

    let currentAreas;

    if (checked === false || checked === null) {
      // remove unchecked key
      currentAreas = update(this.state.currentAreas, { $unset: [name] });
    } else {
      // add checked key
      currentAreas = update(this.state.currentAreas, {
        [name]: { $set: checked }, // value checked
      });
    }

    this.setState({ currentAreas });
  };

  handleOptionChange = event => {
    this.setState({ currentSeats: event.target.value });
  };

  findCheckedBoxes4GA = event => {
    var chk_arr = document.getElementsByClassName('cb');
    var chklength = chk_arr.length;
    for (var k = 0; k < chklength; k++) {
      var checkit = chk_arr[k].firstChild.checked ? true : false;
      if (checkit === true) {
        var children = chk_arr[k].childNodes;
        this.sendEvent2GA(
          'Search Filter',
          'Commissions Search',
          children[1].innerText
        );
      }
    }
  };

  sendEvent2GA = (actionV, categoryV, labelV) => {
    ReactGA.event({
      category: categoryV,
      action: actionV,
      label: labelV,
    });
  };

  handleFacetSubmit = event => {
    event.preventDefault();

    this.setState({
      submittedAreas: this.state.currentAreas,
      submittedSeats: this.state.currentSeats,
    });

    //send search terms to GA Event Tracking
    this.findCheckedBoxes4GA();
  };

  handleKeywordChange = event => {
    this.setState({ currentKeywords: event.target.value });
  };

  handleKeywordSubmit = event => {
    event.preventDefault();

    this.setState({
      submittedKeywords: this.state.currentKeywords,
    });
    //send search terms to GA Event Tracking
    this.sendEvent2GA(
      'Search Box',
      'Commissions Search',
      this.state.currentKeywords
    );
  };

  render() {
    return (
      <React.Fragment>
        <div className="b-c b-c--ntp m-b300 b--fw">
          <Search
            keywords={this.state.currentKeywords}
            handleKeywordChange={this.handleKeywordChange}
            handleKeywordSubmit={this.handleKeywordSubmit}
          />
        </div>

        <div className="b--g b--fw">
          <div className="b-c b-c--mh g">
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
      </React.Fragment>
    );
  }
}

export default App;
