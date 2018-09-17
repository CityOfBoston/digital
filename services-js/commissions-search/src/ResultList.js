/* eslint-disable no-unused-vars */
import React, { Component } from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
/* eslint-enable no-unused-vars */

class ResultList extends Component {
  makeSearchQuery() {
    let getResults;

    // need to construct query based on policy ids
    // if the facet array is empty then send null else send array of keys
    if (
      Object.keys(this.props.submittedAreas) === undefined ||
      Object.keys(this.props.submittedAreas).length === 0
    ) {
      getResults = gql`{
          commissions(query: "${
            this.props.submittedKeywords
          }", policyTypeIds: ${null}, hasOpenSeats: ${
        this.props.submittedSeats === 'seats-open' ? true : null
      }) {
            id
            name
            policyType {
              name
            }
            homepageUrl
          }
        }`;
    } else {
      getResults = gql`{
          commissions(query: "${
            this.props.submittedKeywords
          }", policyTypeIds: [${Object.keys(
        this.props.submittedAreas
      )}], hasOpenSeats: ${
        this.props.submittedSeats === 'seats-open' ? true : null
      }) {
            id
            name
            policyType {
              name
            }
            homepageUrl
          }
        }`;
    }
    return getResults;
  }

  render() {
    /* eslint-disable no-unused-vars */
    function Result(props) {
      // Check for null policyType
      if (!props.policyName) {
        return (
          <li className="n-li">
            <a
              className="n-li-b n-li-b--r n-li-b--c n-li-b--fw n-li--in g g--mt0"
              href={props.homepageUrl}
            >
              <div className="n-li-t g--8">{props.name}</div>
              <div className="n-li-ty n-li-ty--r g--44" />
            </a>
          </li>
        );
      } else {
        return (
          <li className="n-li">
            <a
              className="n-li-b n-li-b--r n-li-b--c n-li-b--fw n-li--in g g--mt0"
              href={props.homepageUrl}
            >
              <div className="n-li-t g--8">{props.name}</div>
              <div className="n-li-ty n-li-ty--r g--44">
                {props.policyName.name}
              </div>
            </a>
          </li>
        );
      }
    }

    const ResultComponents = () => (
      <Query query={this.makeSearchQuery()}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading…';
          if (error) return `Error! ${error.message}`;

          if (data.commissions.length === 0) {
            return (
              <div className="b-c b-c--mh">
                <h2 className="h2 m-t000 m-b300">No Results Found</h2>
                <div className="intro-text supporting-text lh--200">
                  Thomas Paine noted "These are the times that try men's souls."
                  Well this is a time to try another search.
                </div>
              </div>
            );
          } else {
            return data.commissions.map(commission => (
              <Result
                key={'commission-' + commission.id}
                id={commission.id}
                name={commission.name}
                homepageUrl={commission.homepageUrl}
                policyName={commission.policyType}
              />
            ));
          }
        }}
      </Query>
    );
    /* eslint-enable no-unused-vars */

    return (
      <div>
        <ul className="m-a000 p-a000">
          <ResultComponents />
        </ul>
      </div>
    );
  }
}

export default ResultList;
