/** @jsx jsx */

import { jsx } from '@emotion/core';
import Router from 'next/router';

import { REVIEW_CONTROL_STYLING } from './reviewStying';

/**
 * @name $ReviewControlHeader
 * @param {Object} params
 * @param {String} params.title Header title
 * @param {String} params.btnStr Button label/text
 * @param {String} params.routeStep Router param(step as string)
 * @returns JSX(HTML)
 */
export const $ReviewControlHeader = (params: {
  title: string;
  btnStr: string;
  routeStep: string;
  toggleDisclaimerModal: (val: boolean) => void;
  backTrackingDisclaimer: boolean;
}) => {
  const { title, btnStr, routeStep } = params;
  const stepBack = () => {
    const { toggleDisclaimerModal, backTrackingDisclaimer } = params;

    if (backTrackingDisclaimer === false && toggleDisclaimerModal) {
      toggleDisclaimerModal(true);
    } else {
      Router.push(`/marriageintention?step=${routeStep}`);
    }
  };

  return (
    <div css={REVIEW_CONTROL_STYLING}>
      <div className="wrapper-title">
        <h1>{title}</h1>
      </div>

      <div className="wrapper-btn">
        <button type="button" className="btn btn--b-sm" onClick={stepBack}>
          {btnStr}
        </button>
      </div>
    </div>
  );
};

/**
 * @name ReviewFieldValuePair
 * @param {Object} params
 * @param {String} params.field
 * @param {String} params.value
 * @returns JSX(HTML)
 */
export const $ReviewFieldValuePair = (params: {
  field: string;
  value: string;
}) => {
  const { field, value } = params;
  return (
    <div className="field-value-pair">
      <label className="field">{field}: </label>
      <span className="value">{value}</span>
    </div>
  );
};
