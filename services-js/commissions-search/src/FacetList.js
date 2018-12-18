/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { Checkbox, RadioGroup } from '@cityofboston/react-fleet';

const GET_AREAS = gql`
  {
    policyTypes {
      id
      name
    }
  }
`;

function renderAreaCheckbox(props, policyArea) {
  // to conserve horizontal space, convert "and" to an ampersand; Oxford comma
  // looks odd in this case, and the Chicago Manual of Style agrees - jm
  const labelText = policyArea.name.replace(/( and|, and)/, ' &');

  return (
    <Checkbox
      key={`checkbox-area-${policyArea.id}`}
      name={policyArea.id}
      nameval={labelText}
      onChange={props.handleCheckChange}
      style={{
        marginBottom: '1.5rem',
        letterSpacing: 'initial',
      }}
    >
      {labelText}
    </Checkbox>
  );
}

/**
 * This component controls the filtering options for commissions results.
 */
class FacetList extends React.Component {
  constructor(props) {
    super(props);

    this.filterVisibilityRef = React.createRef();
  }

  handleSubmit = e => {
    this.props.handleFacetSubmit(e);

    // If visible, close drawer after applying filters;
    // this is only relevant with narrow/mobile viewports.
    this.filterVisibilityRef.current.checked = false;
  };

  render() {
    const radioGroup = [
      {
        label: 'All',
        value: 'seats-all',
      },
      {
        label: 'Have open seats',
        value: 'seats-open',
      },
    ];

    return (
      <div className="co">
        <input
          ref={this.filterVisibilityRef}
          id="collapsible"
          type="checkbox"
          className="co-f d-n"
          aria-hidden="true"
        />
        <label htmlFor="collapsible" className="co-t">
          Filter
        </label>

        <div className="co-b co-b--pl">
          <div className="t--intro m-b200">Policy Area</div>

          <div className="m-b300">
            <Query query={GET_AREAS}>
              {({ loading, error, data }) => {
                if (loading) return 'Loading…';
                if (error) return `Error! ${error.message}`;

                return data.policyTypes
                  .sort((current, next) =>
                    current.name.localeCompare(next.name)
                  )
                  .map(policyArea =>
                    renderAreaCheckbox(this.props, policyArea)
                  );
              }}
            </Query>

            <div className="t--intro m-b200 m-t500">Open Seats</div>

            <RadioGroup
              items={radioGroup}
              name="seats"
              checkedValue={this.props.currentSeats}
              className="m-b400"
              handleItemChange={this.props.handleOptionChange}
              itemsClassName={'m-t300'}
              itemsStyle={{ marginBottom: 0 }}
            />

            <button
              type="submit"
              className="btn btn--sb"
              onClick={e => this.handleSubmit(e)}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }
}

FacetList.propTypes = {
  handleCheckChange: PropTypes.func.isRequired,
  handleOptionChange: PropTypes.func.isRequired,
  handleFacetSubmit: PropTypes.func.isRequired,
  currentAreas: PropTypes.object.isRequired,
  currentSeats: PropTypes.string.isRequired,
};

export default FacetList;
