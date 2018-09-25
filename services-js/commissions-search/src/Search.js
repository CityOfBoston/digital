/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
/* eslint-enable no-unused-vars */

class Search extends Component {
  _handleKeyPress = event => {
    if (event.keyCode === 13) {
      this.props.handleKeywordSubmit(event);
    }
  };

  render() {
    return (
      <div className="sf">
        <div className="sf-i">
          <input
            type="text"
            placeholder="Search boards and commissions"
            className="sf-i-f"
            value={this.props.tempKeywords}
            onChange={this.props.handleKeywordChange}
            onKeyUp={this._handleKeyPress}
          />
          <button
            type="button"
            className="sf-i-b"
            onClick={this.props.handleKeywordSubmit}
          >
            Search
          </button>
        </div>
      </div>
    );
  }
}

export default Search;
