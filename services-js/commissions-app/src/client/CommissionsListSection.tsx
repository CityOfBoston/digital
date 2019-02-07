import React, { ChangeEvent } from 'react';
import { css } from 'emotion';

import {
  Checkbox,
  CollapsibleSection,
  MEDIA_MEDIUM,
  SectionHeader,
} from '@cityofboston/react-fleet';

import { Commission } from './graphql/fetch-commissions';
import { PARAGRAPH_STYLING } from './common/style-common';

const LIST_STYLING = css`
  padding: 0;
  margin-bottom: 3rem;

  label > div {
    margin-left: 0.75em;
  }

  ${MEDIA_MEDIUM} {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    li {
      flex: 0 0 48%;
    }
  }
`;

const COMMISSION_STYLE = css({
  fontSize: '17px',
  display: 'flex',
  alignItems: 'center',
  span: {
    flex: 1,
  },
  '& a': {
    display: 'block',
    background: 'url(./assets/external-link.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 20,
    width: 20,
    overflow: 'hidden',
    textIndent: 20,
  },
});

export interface Props {
  commissions: Commission[];
  selectedCommissionIds: string[];
  setSelectedIds: (ids: string[]) => void;
  testExpanded?: boolean;
}

export default class CommissionsListSection extends React.Component<Props> {
  onCheckboxChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { selectedCommissionIds, setSelectedIds } = this.props;
    if (ev.target.checked) {
      setSelectedIds([ev.currentTarget.value].concat(selectedCommissionIds));
    } else {
      setSelectedIds(
        selectedCommissionIds.filter(id => id !== ev.currentTarget.value)
      );
    }
  };

  render() {
    const { commissions, selectedCommissionIds, testExpanded } = this.props;

    const commissionsWithoutOpenSeats = commissions.filter(
      commission => commission.openSeats === 0
    );

    const commissionsWithOpenSeats = commissions.filter(
      commission => commission.openSeats > 0
    );

    const selectedCommissions = commissions.filter(({ id }) =>
      selectedCommissionIds.includes(id.toString())
    );

    const tooManyCommissions = selectedCommissions.length > 5;

    return (
      <section aria-labelledby="sh-form-boards-and-commissions">
        <SectionHeader
          title="Boards and Commissions"
          id="sh-form-boards-and-commissions"
        />

        {selectedCommissions.length === 0 ? (
          <>
            <p className={PARAGRAPH_STYLING}>
              Choose up to 5 boards and commissions from the list below.
            </p>
          </>
        ) : (
          <>
            <p className={PARAGRAPH_STYLING}>
              You’ve chosen to apply to these boards and commissions:
            </p>

            <ul className="ul">
              {selectedCommissions.map(({ id, name }, i) => (
                <li
                  key={id}
                  className="t--info"
                  style={{ paddingTop: i !== 0 ? '0.5em' : 0 }}
                >
                  {name}
                </li>
              ))}
            </ul>

            <p className={PARAGRAPH_STYLING}>
              You can change your selection by expanding the list below.{' '}
              <span className={tooManyCommissions ? 't--err' : ''}>
                You may apply for up to 5 boards or commissions at once.
              </span>
            </p>
          </>
        )}

        <CollapsibleSection
          title="Available Positions"
          subheader
          className="m-v500"
          startCollapsed={selectedCommissions.length > 0 && !testExpanded}
        >
          <ul
            className={LIST_STYLING}
            aria-label={'Commissions with open positions'}
          >
            {commissionsWithOpenSeats.map(commission =>
              renderCommission(
                commission,
                selectedCommissionIds,
                this.onCheckboxChange,
                tooManyCommissions
              )
            )}
          </ul>
        </CollapsibleSection>
        {/* if user arrives from a commissions page that does not have open seats, we still want that commission checked off, and we also want that section to start off expanded */}
        <CollapsibleSection
          title="No Open Positions"
          className="m-v300"
          subheader
          startCollapsed
        >
          <p className={PARAGRAPH_STYLING}>
            You can apply for a board or commission that does not currently have
            any open positions. We will review your application when a seat
            opens.
          </p>

          <ul
            className={LIST_STYLING}
            aria-label={'Commissions without open positions'}
          >
            {commissionsWithoutOpenSeats.map(commission =>
              renderCommission(
                commission,
                selectedCommissionIds,
                this.onCheckboxChange,
                tooManyCommissions
              )
            )}
          </ul>
        </CollapsibleSection>
      </section>
    );
  }
}

function renderCommission(
  commission: Commission,
  selectedCommissionIds: string[],
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void,
  error: boolean
) {
  const id = commission.id.toString();
  const checked = selectedCommissionIds.includes(id);
  const uid = `commissionIds.${id}`;

  return (
    <li style={{ listStyleType: 'none' }} key={uid} className="m-b500">
      <Checkbox
        name="commissionIds"
        aria-label={commission.name}
        value={id}
        error={checked && error}
        onChange={onChange}
        checked={checked}
      >
        <span className={COMMISSION_STYLE}>
          <span aria-hidden>{commission.name}</span>
          {commission.homepageUrl && (
            <a href={commission.homepageUrl} title="Homepage" target="_blank">
              Homepage
            </a>
          )}
        </span>
      </Checkbox>
    </li>
  );
}
