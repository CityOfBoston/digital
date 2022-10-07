/** @jsx jsx */
import { css } from '@emotion/core';

export const SHOWPASSWORD_WRAPPER_STYLING = css({
  display: 'flex',
  justifyContent: 'center',
});

export const SHOWPASSWORD_STYLING = css({
  textAlign: 'center',
  marginTop: '0',
  marginBottom: '1.25em',
  borderBottom: '2px solid red',
  cursor: 'pointer',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: '#091f2f',
  fontFamily: 'Montserrat,Arial,sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
});

export default SHOWPASSWORD_WRAPPER_STYLING;
