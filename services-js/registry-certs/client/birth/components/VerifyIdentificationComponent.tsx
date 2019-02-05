import React from 'react';

interface Props {}

/**
 * Component which allows a user to upload images and supporting files for
 * identification verification. User will also have the ability to take photos
 * with their current device, if possible.
 */
export default class VerifyIdentificationComponent extends React.Component<
  Props
> {
  render() {
    return (
      <div style={{ border: '1px dashed #000', backgroundColor: '#eee' }}>
        VerifyIdentificationComponent
      </div>
    );
  }
}
