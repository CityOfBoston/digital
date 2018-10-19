import React from 'react';
import { storiesOf } from '@storybook/react';

import ApplyPage from '../pages/commissions/apply';

storiesOf('ApplyPage', module)
  .add('default', () => (
    <ApplyPage
      commissions={[
        {
          name: 'Aberdeen Architectural Conservation District Commission',
          id: 0,
          openSeats: 2,
        },
        {
          name:
            'Back Bay West/Bay State Road Architectural Conservation District Commission',
          id: 1,
          openSeats: 1,
        },
        {
          name: 'Living Wage Advisory Committee',
          id: 2,
          openSeats: 1,
        },
        {
          name: 'Licensing Board for the City of Boston',
          id: 3,
          openSeats: 0,
        },
      ]}
      commissionID="1"
    />
  ))
  .add('submitted successfully', () => (
    <ApplyPage commissions={[]} testSubmittedPage />
  ));
