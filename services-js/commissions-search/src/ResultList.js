/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

/**
 * This component will render the list of commissions based on the user's
 * current search or filter parameters.
 */
class ResultList extends React.Component {
  makeSearchQuery() {
    // need to construct query based on policy ids
    // if the facet array is empty then send null else send array of keys
    const submittedItems =
      this.props.submittedAreas &&
      Object.keys(this.props.submittedAreas).length > 0
        ? `[${Object.keys(this.props.submittedAreas)}]`
        : null;

    return gql`{
        commissions(query: 
            "${this.props.submittedKeywords}",
            policyTypeIds: ${submittedItems},
            hasOpenSeats: ${
              this.props.submittedSeats === 'seats-open' ? true : null
            }
        ) {
            id
            name
            policyType {
                name
            }
            homepageUrl
        }
    }`;
  }

  renderCommissionItem = ({ id, name, policyType, homepageUrl }) => {
    return (
      <li key={'commission-' + id} className="n-li" id={id}>
        <a
          className="n-li-b n-li-b--r n-li-b--c n-li-b--fw n-li--in g g--mt0"
          href={homepageUrl}
        >
          <div className="n-li-t g--8">{name}</div>
          <div className="n-li-ty n-li-ty--r">
            {policyType ? policyType.name : ''}
          </div>
        </a>
      </li>
    );
  };

  render() {
    return (
      <Query query={this.makeSearchQuery()}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading…';

          if (error) return `Error! ${error.message}`;

          if (data.commissions.length > 0) {
            return (
              <ul className="p-a000" style={{ marginTop: 0 }}>
                {data.commissions
                  .sort((current, next) =>
                    current.name.localeCompare(next.name)
                  )
                  .map(commission => this.renderCommissionItem(commission))}
              </ul>
            );
          } else {
            return (
              <div className="b-c b-c--mh">
                <h2 className="h2 m-t000 m-b300">No Results Found</h2>

                <div className="intro-text supporting-text lh--200">
                  <p>
                    Thomas Paine noted{' '}
                    <q style={{ fontStyle: 'italic' }}>
                      These are the times that try men’s souls.
                    </q>
                  </p>

                  <p>Well, this is a time to try another search.</p>
                </div>
              </div>
            );
          }
        }}
      </Query>
    );
  }
}

ResultList.propTypes = {
  submittedSeats: PropTypes.string.isRequired,
  submittedKeywords: PropTypes.string.isRequired,
  submittedAreas: PropTypes.object.isRequired,
};

export default ResultList;
