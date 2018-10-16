// polyfill Array.includes() for IE
import 'core-js/fn/array/includes';

import React from 'react';
import { FieldArray } from 'formik';
import { css } from 'emotion';

import {
  Checkbox,
  CollapsibleSection,
  FREEDOM_RED as A11Y_RED,
  MEDIA_MEDIUM,
  SectionHeader,
} from '@cityofboston/react-fleet';

import { Commission } from './graphql/fetch-commissions';

const LIST_STYLING = css`
  padding: 0;
  margin-bottom: 3rem;

  label span {
    margin-left: 0.75em;
  }

  ${MEDIA_MEDIUM} {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    li {
      flex: 0 0 48%;
    }

    label span {
      font-size: 17px;
    }
  }
`;

interface Props {
  commissionsWithOpenSeats: Commission[];
  commissionsWithoutOpenSeats: Commission[];
  selectedCommissions: Commission[];
  errors: object;
  touched: object;
  paragraphElement: JSX.Element;
  handleBlur(e: any): void;
}

export default class CommissionsListSection extends React.Component<Props> {
  render() {
    return (
      <>
        <SectionHeader title="Boards and Commissions" />

        {this.props.paragraphElement}

        <CollapsibleSection title="Open Positions" subheader className="m-b100">
          <FieldArray
            name="selectedCommissions"
            render={({ push, remove }) => (
              <ul className={LIST_STYLING}>
                {this.props.commissionsWithOpenSeats.map(commission =>
                  renderCommission(
                    commission,
                    this.props.selectedCommissions,
                    true,
                    push,
                    remove,
                    this.props.handleBlur
                  )
                )}
              </ul>
            )}
          />
        </CollapsibleSection>

        {/* if user arrives from a commissions page that does not have open seats, we still want that commission checked off, and we also want that section to start off expanded */}
        <CollapsibleSection
          title="No Open Positions"
          subheader
          startCollapsed={
            !this.props.commissionsWithoutOpenSeats.includes(
              this.props.selectedCommissions[0]
            )
          }
        >
          <FieldArray
            name="selectedCommissions"
            render={({ push, remove }) => (
              <ul className={LIST_STYLING}>
                {this.props.commissionsWithoutOpenSeats.map(commission =>
                  renderCommission(
                    commission,
                    this.props.selectedCommissions,
                    false,
                    push,
                    remove,
                    this.props.handleBlur
                  )
                )}
              </ul>
            )}
          />
        </CollapsibleSection>

        {commissionsSelectionError(this.props.touched, this.props.errors)}
      </>
    );
  }
}

function renderCommission(
  commission,
  selectedCommissions,
  isAvailable,
  push,
  remove,
  handleBlur
) {
  const checked = selectedCommissions.includes(commission);
  const uid = `commissionIds.${commission.id}`;

  return (
    <li style={{ listStyleType: 'none' }} key={uid} className="m-b500">
      <Checkbox
        name={`commissionIds-${isAvailable ? 'openSeats' : 'noSeats'}`}
        value={commission.id.toString()}
        title={commission.name}
        onChange={() => {
          if (!checked) {
            push(commission);
          } else {
            remove(commission);
          }
        }}
        onBlur={handleBlur}
        checked={checked}
      />
    </li>
  );
}

function commissionsSelectionError(touched, errors) {
  return (
    <p
      className="t--subinfo t--err"
      style={{ marginTop: '-0.5em', color: A11Y_RED }}
    >
      {touched.selectedCommissions && errors.selectedCommissions} &nbsp;
    </p>
  );
}
