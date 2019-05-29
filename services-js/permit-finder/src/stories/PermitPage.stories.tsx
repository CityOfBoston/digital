import React from 'react';
import { storiesOf } from '@storybook/react';

import PermitPage from '../pages/permit';
import { PermitKind } from '../client/graphql/queries';
import { Permit } from '../client/graphql/load-permit';

const BASE_BUILDING_PERMIT: Permit = {
  permitNumber: 'A50582',
  kind: PermitKind.BUILDING,
  type: 'Amendment to a Long Form',

  address: '50 MILK ST.',
  city: 'Boston',
  state: 'MA',
  zip: '02110',

  milestones: [],
  reviews: [
    {
      isComplete: false,
      type: 'Building Review',
    },
    {
      isComplete: false,
      type: 'Zoning Review',
    },
  ],
};

const BASE_FIRE_PERMIT: Permit = {
  permitNumber: 'FDC123650',
  kind: PermitKind.FIRE,
  type: 'BFD Construction, Demo, Reno',

  address: '50 MILK ST.',
  city: 'Boston',
  state: 'MA',
  zip: '02110',

  milestones: [],
  reviews: [],
};

const CURRENT_TIME_MS = 1558725781099;

storiesOf('PermitPage.Building Permit', module)
  .add('intake', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'Intake',
            milestoneStartDate: '2019-05-01',
            cityContactName: null,
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('project review', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'PlanningZoning',
            milestoneStartDate: '2019-05-01',
            cityContactName: 'ERABELLE P. ICHAFIST',
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('zoning review', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'Waiting',
            milestoneStartDate: '2019-05-01',
            cityContactName: 'ERABELLE P. ICHAFIST',
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('issuance', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'Ready to Issue',
            milestoneStartDate: '2019-05-01',
            cityContactName: 'ERABELLE P. ICHAFIST',
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('inspection', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'ScheduleInspection',
            milestoneStartDate: '2019-05-01',
            cityContactName: 'ERABELLE P. ICHAFIST',
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('occupancy', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'OccNotOnFile',
            milestoneStartDate: '2019-05-01',
            cityContactName: 'ERABELLE P. ICHAFIST',
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('completed', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [
          {
            milestoneName: 'Complete',
            milestoneStartDate: '2019-05-01',
            cityContactName: '',
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('no milestones', () => (
    <PermitPage
      permitNumber="A50582"
      permit={{
        ...BASE_BUILDING_PERMIT,
        milestones: [],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ));

storiesOf('PermitPage.Fire Department Permit', module)
  .add('intake', () => (
    <PermitPage
      permitNumber="FDC123650"
      permit={{
        ...BASE_FIRE_PERMIT,
        milestones: [
          {
            milestoneName: 'Intake',
            milestoneStartDate: '2019-05-01',
            cityContactName: null,
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('permit review', () => (
    <PermitPage
      permitNumber="FDC123650"
      permit={{
        ...BASE_FIRE_PERMIT,
        milestones: [
          {
            milestoneName: 'District Review',
            milestoneStartDate: '2019-05-01',
            cityContactName: null,
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('issuance', () => (
    <PermitPage
      permitNumber="FDC123650"
      permit={{
        ...BASE_FIRE_PERMIT,
        milestones: [
          {
            milestoneName: 'Ready to Issue',
            milestoneStartDate: '2019-05-01',
            cityContactName: null,
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('inspection', () => (
    <PermitPage
      permitNumber="FDC123650"
      permit={{
        ...BASE_FIRE_PERMIT,
        milestones: [
          {
            milestoneName: 'Inspection',
            milestoneStartDate: '2019-05-01',
            cityContactName: null,
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('completed', () => (
    <PermitPage
      permitNumber="FDC123650"
      permit={{
        ...BASE_FIRE_PERMIT,
        milestones: [
          {
            milestoneName: 'Abandoned',
            milestoneStartDate: '2019-05-01',
            cityContactName: null,
          },
        ],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ))
  .add('no milestones', () => (
    <PermitPage
      permitNumber="FDC123650"
      permit={{
        ...BASE_FIRE_PERMIT,
        milestones: [],
      }}
      currentTimeMs={CURRENT_TIME_MS}
    />
  ));

storiesOf('PermitPage', module).add('missing permit', () => (
  <PermitPage
    permitNumber="A50582"
    permit={null}
    currentTimeMs={CURRENT_TIME_MS}
  />
));
