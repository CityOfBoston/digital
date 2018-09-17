/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import './FacetList.css';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_AREAS = gql`
  {
    policyTypes {
      id
      name
    }
  }
`;

class FacetList extends Component {
  renderArea() {
    function Area(props) {
      return (
        <label className="cb">
          <input
            id={`checkbox-area-${props.id}`}
            name={props.id}
            type="checkbox"
            value={props.id}
            className="cb-f"
            checked={props.checked}
            onChange={props.handleCheckChange}
          />
          <span className="cb-l">{props.name}</span>
        </label>
      );
    }

    const PolicyAreaComponents = () => (
      <Query query={GET_AREAS}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading…';
          if (error) return `Error! ${error.message}`;

          return data.policyTypes.map(policy_area => (
            <Area
              key={policy_area.id}
              id={policy_area.id}
              name={policy_area.name}
              checked={this.props.currentAreas[policy_area.id]}
              handleCheckChange={this.props.handleCheckChange}
            />
          ));
        }}
      </Query>
    );

    return (
      <div className="co">
        <input
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
            <PolicyAreaComponents />

            <div className="t--intro m-b200">Open Seats</div>
            <div className="m-b300">
              <label className="cb">
                <input
                  id="checkbox-seats-all"
                  name="seats"
                  type="radio"
                  value="seats-all"
                  checked={this.props.currentSeats === 'seats-all'}
                  className="cb-f"
                  onChange={this.props.handleOptionChange}
                />
                <span className="cb-l">All</span>
              </label>
              <label className="cb">
                <input
                  id="checkbox-seats-open"
                  name="seats"
                  type="radio"
                  value="seats-open"
                  checked={this.props.currentSeats === 'seats-open'}
                  className="cb-f"
                  onChange={this.props.handleOptionChange}
                />
                <span className="cb-l">Have open seats</span>
              </label>
            </div>
            <button
              type="submit"
              onClick={this.props.handleFacetSubmit}
              className="btn btn--sb"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return this.renderArea();
  }
}

export default FacetList;
/* eslint-enable no-unused-vars */
