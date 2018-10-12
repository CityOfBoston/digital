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

const LIST_STYLING = css({
  padding: 0,
  marginBottom: '3rem',
});

const CONTAINER_STYLING = css`
  label span {
    margin-left: 0.75em;
  }

  ${MEDIA_MEDIUM} {
    display: flex;
    justify-content: space-between;

    section {
      flex: 0 0 49%;
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
  paragraphClassName: string;
  handleBlur(e: any): void;
}

export default class CommissionsListSection extends React.Component<Props> {
  render() {
    return (
      <>
        <SectionHeader title="Boards and Commissions" />

        <p className={this.props.paragraphClassName}>
          Please note that many of these Boards and Commissions require City of
          Boston residency.
        </p>

        <p className={this.props.paragraphClassName}>
          You can still apply for a board or commission that does not currently
          have any open positions, and we will review your application when a
          seat opens.
        </p>

        <div className={CONTAINER_STYLING}>
          {/*todo: This list should start expanded if the preselected commission is in it, or alternately the collapsed title should say something like (1 selected)*/}
          <CollapsibleSection
            title="Open Positions"
            subheader
            className="m-b100"
          >
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

          <CollapsibleSection
            title="No Open Positions"
            subheader
            startCollapsed
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
        </div>

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
