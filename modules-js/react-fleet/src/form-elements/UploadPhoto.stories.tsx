import React from 'react';
import { storiesOf } from '@storybook/react';

import { css } from 'emotion';

import UploadPhoto from './UploadPhoto';

import { BLACK, OPTIMISTIC_BLUE_LIGHT, WHITE } from '../react-fleet';

storiesOf('Form Elements/Upload photo', module)
  .add('default', () => (
    <div style={{ width: 400 }}>
      <UploadPhoto handleDrop={() => {}} handleRemove={() => {}} />
    </div>
  ))
  .add('custom background element', () => (
    <div style={{ width: 400 }}>
      <UploadPhoto
        backgroundElement={<IdImage />}
        buttonTitleUpload="Upload front of ID"
        handleDrop={() => {}}
        handleRemove={() => {}}
      />
    </div>
  ))
  .add('uploading: 60% complete', () => (
    <div style={{ width: 400 }}>
      <UploadPhoto
        uploadProgress={60}
        handleDrop={() => {}}
        handleRemove={() => {}}
      />
    </div>
  ))
  .add('upload error', () => (
    <div style={{ width: 400 }}>
      <UploadPhoto
        errorMessage="server error"
        handleDrop={() => {}}
        handleRemove={() => {}}
      />
    </div>
  ))
  .add('displaying image File from data store', () => (
    <>
      <div style={{ width: 400 }}>
        <UploadPhoto
          errorMessage="server error"
          handleDrop={() => {}}
          handleRemove={() => {}}
        />
      </div>
      <img
        src="https://placebear.com/400/300"
        id="samplePhoto"
        alt=""
        style={{ visibility: 'hidden' }}
      />
    </>
  ));

function IdImage(): JSX.Element {
  return (
    <div className={ID_IMAGE_STYLING}>
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
    </div>
  );
}

const ID_IMAGE_STYLING = css({
  backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  color: BLACK,

  padding: '2rem 4rem',
});
