/* eslint-disable no-undef */
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

function returnArea(props, policy_area) {
  // to conserve horizontal space, convert "and" to an ampersand; Oxford comma
  // looks odd in this case, and the Chicago Manual of Style agrees - jm
  const labelText = policy_area.name.replace(/(and|, and)/, '&');

  return (
    <Checkbox
      key={`checkbox-area-${policy_area.id}`}
      name={policy_area.id}
      onChange={props.handleCheckChange}
      title={labelText}
      style={{
        marginBottom: '1.5rem',
        letterSpacing: 'initial'
      }}
    />
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
    const { currentSeats, handleOptionChange } = this.props;

    const radioGroup = [
      {
        labelText: 'All',
        value: 'seats-all',
        checked: currentSeats === 'seats-all'
      },
      {
        labelText: 'Have open seats',
        value: 'seats-open',
        checked: currentSeats === 'seats-open'
      }
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
                  .sort((current, next) => current.name.localeCompare(next.name))
                  .map(policy_area => returnArea(this.props, policy_area));
              }}
            </Query>

            <div className="t--intro m-b200 m-t500">Open Seats</div>

            <RadioGroup
              items={radioGroup}
              name="seats"
              className="m-b200"
              handleChange={handleOptionChange}
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
  currentSeats: PropTypes.string.isRequired
};

export default FacetList;
