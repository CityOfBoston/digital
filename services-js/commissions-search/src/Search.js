import React from 'react';
import PropTypes from 'prop-types';

function Search(props) {
  const handleKeyUp = event => {
    if (event.keyCode === 13) {
      props.handleKeywordSubmit(event);
    }
  };

  return (
    <div className="sf">
      <div className="sf-i">
        <input
          type="text"
          aria-label="Search boards and commissions"
          placeholder="Search boards and commissions"
          className="sf-i-f"
          onChange={props.handleKeywordChange}
          onKeyUp={handleKeyUp}
        />

        <button
          type="button"
          className="sf-i-b"
          onClick={props.handleKeywordSubmit}
        >
          Search
        </button>
      </div>
    </div>
  );
}

Search.propTypes = {
  keywords: PropTypes.string.isRequired,
  handleKeywordChange: PropTypes.func.isRequired,
  handleKeywordSubmit: PropTypes.func.isRequired,
};

export default Search;
