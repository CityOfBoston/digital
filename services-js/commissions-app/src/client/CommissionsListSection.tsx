// polyfill Array methods for IE
//
// TODO(finh): Can we do the auto-import for these?
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';

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
    const {
      paragraphElement,
      selectedCommissionIds,
      commissionsWithOpenSeats,
      commissionsWithoutOpenSeats,
      errors,
    } = this.props;

    return (
      <>
        <SectionHeader title="Boards and Commissions" />

        {paragraphElement}

        <CollapsibleSection title="Open Positions" subheader className="m-b100">
          <FieldArray
            name="commissionIds"
            render={({ push, remove }) => (
              <ul className={LIST_STYLING}>
                {commissionsWithOpenSeats.map(commission =>
                  renderCommission(
                    commission,
                    selectedCommissionIds,
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
            !commissionsWithoutOpenSeats.find(({ id }) =>
              selectedCommissionIds.includes(id.toString())
            )
          }
        >
          <FieldArray
            name="commissionIds"
            render={({ push, remove }) => (
              <ul className={LIST_STYLING}>
                {commissionsWithoutOpenSeats.map(commission =>
                  renderCommission(
                    commission,
                    selectedCommissionIds,
                    push,
                    remove
                  )
                )}
              </ul>
            )}
          />
        </CollapsibleSection>

        {/* We want to hide the error that comes up when nothing
          is selected, even though it is an error case. */}
        {commissionsSelectionError(errors, selectedCommissionIds.length > 0)}
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

function commissionsSelectionError(
  errors: FormikErrors<ApplyFormValues>,
  showError: boolean
) {
  return (
    <p
      className="t--subinfo t--err"
      style={{ marginTop: '-0.5em', color: A11Y_RED }}
    >
      {showError && errors.commissionIds} &nbsp;
    </p>
  );
}
