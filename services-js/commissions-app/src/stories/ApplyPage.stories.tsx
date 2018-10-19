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
          homepageUrl: 'http://',
        },
        {
          name:
            'Back Bay West/Bay State Road Architectural Conservation District Commission',
          id: 1,
          openSeats: 1,
          homepageUrl: 'http://',
        },
        {
          name: 'Living Wage Advisory Committee',
          id: 2,
          openSeats: 1,
          homepageUrl: 'http://',
        },
        {
          name: 'Licensing Board for the City of Boston',
          id: 3,
          openSeats: 0,
          homepageUrl: 'http://',
        },
      ]}
      commissionID="1"
    />
  ))
  .add('submitted successfully', () => (
    <ApplyPage commissions={[]} testSubmittedPage />
  ));
