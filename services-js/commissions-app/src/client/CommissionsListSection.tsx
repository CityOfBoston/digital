// polyfill Array.includes() for IE
import 'core-js/fn/array/includes';

import React from 'react';
import { FieldArray, FormikErrors } from 'formik';
import { css } from 'emotion';

import {
  Checkbox,
  CollapsibleSection,
  FREEDOM_RED as A11Y_RED,
  MEDIA_MEDIUM,
  SectionHeader,
} from '@cityofboston/react-fleet';

import { Commission } from './graphql/fetch-commissions';
import { ApplyFormValues } from '../lib/validationSchema';

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
  selectedCommissionIds: string[];
  errors: FormikErrors<ApplyFormValues>;
  paragraphElement: React.ReactNode;
}

export default class CommissionsListSection extends React.Component<Props> {
  render() {
    return (
      <>
        <SectionHeader title="Boards and Commissions" />

        {this.props.paragraphElement}

        <CollapsibleSection title="Open Positions" subheader className="m-b100">
          <FieldArray
            name="commissionIds"
            render={({ push, remove }) => (
              <ul className={LIST_STYLING}>
                {this.props.commissionsWithOpenSeats.map(commission =>
                  renderCommission(
                    commission,
                    this.props.selectedCommissionIds,
                    push,
                    remove
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
            !this.props.commissionsWithoutOpenSeats.find(({ id }) =>
              this.props.selectedCommissionIds.includes(id.toString())
            )
          }
        >
          <FieldArray
            name="commissionIds"
            render={({ push, remove }) => (
              <ul className={LIST_STYLING}>
                {this.props.commissionsWithoutOpenSeats.map(commission =>
                  renderCommission(
                    commission,
                    this.props.selectedCommissionIds,
                    push,
                    remove
                  )
                )}
              </ul>
            )}
          />
        </CollapsibleSection>

        {commissionsSelectionError(this.props.errors)}
      </>
    );
  }
}

function renderCommission(
  commission: Commission,
  selectedCommissionIds: string[],
  push: (obj: string) => void,
  remove: (idx: number) => void
) {
  const id = commission.id.toString();
  const checked = selectedCommissionIds.includes(id);
  const uid = `commissionIds.${id}`;

  return (
    <li style={{ listStyleType: 'none' }} key={uid} className="m-b500">
      <Checkbox
        name="commissionIds"
        value={id}
        title={commission.name}
        onChange={() => {
          if (!checked) {
            push(id);
          } else {
            const idx = selectedCommissionIds.indexOf(id);
            remove(idx);
          }
        }}
        checked={checked}
      />
    </li>
  );
}

function commissionsSelectionError(errors: FormikErrors<ApplyFormValues>) {
  return (
    <p
      className="t--subinfo t--err"
      style={{ marginTop: '-0.5em', color: A11Y_RED }}
    >
      {errors.commissionIds} &nbsp;
    </p>
  );
}
