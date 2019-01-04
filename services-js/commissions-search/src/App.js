/* eslint-disable no-unused-vars */
import React from 'react';
import update from 'immutability-helper';
import Search from './Search';
import FacetList from './FacetList';
import ResultList from './ResultList';

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
      checkedNames: {},
      currentSeats: 'seats-all',
      submittedSeats: 'seats-all',
    };
  }

  handleCheckChange = event => {
    const target = event.target;
    const checked = target.checked;
    const name = target.name; //area id
    const nameval = target.getAttribute('nameval'); //input label name

    let currentAreas;
    let checkedNames;

    if (checked === false || checked === null) {
      // remove unchecked key
      currentAreas = update(this.state.currentAreas, { $unset: [name] });
      //remove unchecked name
      checkedNames = update(this.state.checkedNames, { $unset: [name] });
    } else {
      // add checked key
      currentAreas = update(this.state.currentAreas, {
        [name]: { $set: checked }, // value checked
      });
      // add checked key name
      checkedNames = update(this.state.checkedNames, {
        [name]: { $set: nameval }, // value checked
      });
    }

    this.setState({ currentAreas });
    this.setState({ checkedNames });
  };

  handleOptionChange = event => {
    this.setState({ currentSeats: event.target.value });
  };

  //get checkbox names from state and send to GA
  findCheckedBoxes4GA = event => {
    const chkArr = { ...this.state.checkedNames };
    Object.keys(chkArr).forEach(key => {
      const nameValue = chkArr[key];
      this.sendEvent2GA('Search Filter', 'Commissions Search', nameValue);
    });
  };

  sendEvent2GA = (actionV, categoryV, labelV) => {
    window.dataLayer.push({
      event: 'boards_commissions',
      eventCategory: categoryV,
      eventAction: actionV,
      eventLabel: labelV,
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
