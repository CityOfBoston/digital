/** @jsx jsx */

import { storiesOf } from '@storybook/react';

import { css, jsx } from '@emotion/core';

import { BLACK, OPTIMISTIC_BLUE_LIGHT, WHITE } from '../utilities/constants';

import UploadPhoto from './UploadPhoto';

const mockHandlerFunctions = {
  handleDrop: () => {},
  handleRemove: () => {},
  handleButtonClick: () => {},
  handleCancel: () => {},
};

storiesOf('Form Elements|UploadPhoto', module)
  .addDecorator(s => (
    <div className="g">
      <div className="g--4">{s()}</div>
    </div>
  ))
  .add('default', () => <UploadPhoto {...mockHandlerFunctions} />)
  .add('custom background element', () => (
    <UploadPhoto
      backgroundElement={ID_IMAGE}
      buttonTitleUpload="Upload front of ID"
      {...mockHandlerFunctions}
    />
  ))
  .add('uploading: 60% complete', () => (
    <UploadPhoto uploadProgress={39.232312} {...mockHandlerFunctions} />
  ))
  .add('upload error', () => (
    <UploadPhoto errorMessage="server error" {...mockHandlerFunctions} />
  ))
  .add('existing photo', () => (
    <UploadPhoto
      initialFile={new File(SVG_BITS, 'img.svg', { type: 'image/svg+xml' })}
      {...mockHandlerFunctions}
    />
  ))
  .add('existing photo (reloaded)', () => (
    <UploadPhoto initialFile={true} {...mockHandlerFunctions} />
  ));

const ID_IMAGE_STYLING = css({
  backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  color: BLACK,

  padding: '2rem 4rem',
});

const SVG_BITS = [
  `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
    <path fill="#5BCEFA" d="M0 0h800v480H0z"/>
    <path fill="#F5A9B8" d="M0 96h800v288H0z"/>
    <path fill="#FFF" d="M0 192h800v96H0z"/>
  </svg>
  `,
];

const ID_IMAGE: JSX.Element = (
  <header css={ID_IMAGE_STYLING}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 181 134"
      aria-hidden="true"
      focusable="false"
    >
      <path fill={WHITE} d="M2 2h176v130H2z" />

      <g fill="currentColor">
        <path d="M181 134H0V0h181zM4 130h172V4H4z" />
        <path d="M95 30h63v4H95z" />
        <path d="M95 48h63v4H95z" />
        <path d="M95 66h63v4H95z" />
        <path d="M95 83h63v4H95z" />
        <path d="M95 101h63v4H95z" />
      </g>

      <g fill={WHITE} stroke="currentColor" strokeWidth="3">
        <path d="M25 32h51v71H25z" />
        <path d="M57 70H44l-10 7v25h33V77z" />
        <ellipse cx="9" cy="9" rx="9" ry="9" transform="translate(41 46)" />
      </g>
    </svg>
  </header>
);
