import React from 'react';

import {
  FIXED_CC_STRING,
  PERCENTAGE_CC_STRING,
  SERVICE_FEE_URL,
} from '../../lib/costs';

export function ServiceFeeDisclosure() {
  return (
    <div className="b--g m-t700">
      <div id="service-fee" className="b-c b-c--smv t--subinfo">
        * {serviceFeeDisclosureText()}
      </div>
    </div>
  );
}

export function serviceFeeDisclosureText() {
  return (
    <>
      You will be charged an extra service fee of no more than {FIXED_CC_STRING}{' '}
      plus {PERCENTAGE_CC_STRING}. This fee goes directly to a third party to
      pay for the cost of card processing. Learn more about{' '}
      <a href={SERVICE_FEE_URL}>card service fees</a> at the City of Boston.
    </>
  );
}

export function researchFeeDisclosureText() {
  return (
    <>
      If you are requesting a certificate that is dated before 1870, there is an
      additional $10 research fee.
    </>
  );
}
