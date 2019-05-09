/** @jsx jsx */
import React from 'react';
import Dropzone from 'react-dropzone';

import { css, jsx } from '@emotion/core';

import {
  FREEDOM_RED_DARK,
  GRAY_300,
  OPTIMISTIC_BLUE_LIGHT,
  WHITE,
} from '../utilities/constants';

interface Props {
  /** Pass "true" if we should act like there’s a file but we don’t have a File
   * / preview for it */
  initialFile?: File | true | null;
  backgroundElement?: JSX.Element;
  buttonTitleUpload?: string;
  buttonTitleRemove?: string;
  buttonTitleCancel?: string;

  handleButtonClick: () => void;
  handleDrop: (file: File) => void;
  handleRemove: () => void;
  handleCancel?: () => void;

  uploadProgress?: number | null; // 0 - 100
  errorMessage?: string | null;

  acceptTypes: string;

  defaultPreviewUrl: string;
}

interface State {
  file: File | true | null;
  previewUrl: string | null;
}

/**
 * Component which allows a user to submit a photo via drag-and-drop, or
 * by choosing a file from their computer.
 *
 * Default appearance can be customized by passing an element into the
 * backgroundElement property; when an image has been selected, its preview
 * will be the same height as that initial element. You may also pass in a
 * static value for the previewHeight.
 *
 * adapted from /services-js/311/components/request/request/QuestionsPane.tsx
 */
export default class UploadPhoto extends React.Component<Props, State> {
  private readonly dropzoneRef = React.createRef<Dropzone>();
  private readonly previewRef = React.createRef<HTMLDivElement>();

  static defaultProps: Partial<Props> = {
    buttonTitleUpload: 'Upload photo',
    buttonTitleRemove: 'Remove photo',
    buttonTitleCancel: 'Cancel upload',
    acceptTypes: 'image/*',
    defaultPreviewUrl:
      'https://patterns.boston.gov/images/global/icons/experiential/pdf-doc.svg',
  };

  state: State = {
    file: this.props.initialFile || null,
    // jsdom doesn’t have a createObjectURL implementation
    previewUrl:
      this.props.initialFile &&
      this.props.initialFile !== true &&
      typeof URL.createObjectURL !== 'undefined'
        ? URL.createObjectURL(this.props.initialFile)
        : null,
  };

  private onDrop = (files: File[]): void => {
    if (files.length) {
      const file = files[0];
      this.setState(
        {
          file,
          previewUrl: URL.createObjectURL(file),
        },
        () => {
          this.props.handleDrop(file);
        }
      );
    }
  };

  private onRemove = (): void => {
    if (this.state.previewUrl) {
      URL.revokeObjectURL(this.state.previewUrl);
    }

    this.setState({ file: null, previewUrl: null }, () => {
      this.props.handleRemove();
    });
  };

  private handleButtonClick = (): void => {
    const isUploading =
      this.props.uploadProgress && this.props.uploadProgress < 100;

    if (!this.dropzoneRef.current) {
      return;
    }

    if (this.props.errorMessage) {
      this.onRemove();
      this.dropzoneRef.current.open();
    } else if (this.state.file) {
      // User may cancel an upload while it is in progress.
      if (isUploading && this.props.handleCancel) {
        this.props.handleCancel();
      }

      this.onRemove();
    } else {
      this.dropzoneRef.current.open();
    }

    this.props.handleButtonClick();
  };

  componentWillUnmount() {
    // see https://react-dropzone.netlify.com/#!/Previews
    // Make sure to revoke the data uris to avoid memory leaks
    if (this.state.previewUrl) {
      URL.revokeObjectURL(this.state.previewUrl);
    }
  }

  render() {
    const { errorMessage, uploadProgress, acceptTypes } = this.props;
    const { file } = this.state;

    const previewUrl = file
      ? this.state.previewUrl || this.props.defaultPreviewUrl
      : null;

    const isUploading = uploadProgress && uploadProgress < 100;
    const hasError = !!errorMessage;

    let buttonTitle: string;

    if (isUploading) {
      buttonTitle = this.props.buttonTitleCancel || 'Cancel upload';
    } else if (errorMessage) {
      buttonTitle = errorMessage;
    } else if (file) {
      buttonTitle = this.props.buttonTitleRemove || 'Remove photo';
    } else {
      buttonTitle = this.props.buttonTitleUpload || 'Upload photo';
    }

    return (
      <div className="br br-a200">
        <Dropzone
          ref={this.dropzoneRef}
          accept={acceptTypes}
          multiple={false}
          onDrop={this.onDrop}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div {...getRootProps()} css={INPUT_CONTAINER_FOCUS_STYLING}>
              <input {...getInputProps()} />

              <div
                ref={this.previewRef}
                css={[
                  PREVIEW_CONTAINER_STYLING,
                  isDragActive && DRAG_RING_STYLING,
                ]}
              >
                {/* We keep the background element in the flow to preserve height / width */}
                <div style={{ visibility: previewUrl ? 'hidden' : 'visible' }}>
                  {this.props.backgroundElement || defaultInitialAppearance()}
                </div>

                {previewUrl && (
                  <div
                    css={PREVIEW_IMAGE_STYLING}
                    style={{
                      backgroundImage: `url(${previewUrl})`,
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </Dropzone>

        <div className="br br-t200" style={{ position: 'relative' }}>
          <button
            className={`btn btn--w btn--b ${isUploading ? 'btn--r-hov' : ''}`}
            css={[BUTTON_FOCUS_STYLING, hasError && ERROR_MESSAGE_STYLING]}
            style={{ width: '100%' }}
            type="button"
            onClick={this.handleButtonClick}
          >
            {buttonTitle}
          </button>

          {!!isUploading && (
            <div
              css={PROGRESS_STYLING}
              style={{ width: `${uploadProgress}%` }}
            />
          )}
        </div>
      </div>
    );
  }
}

/**
 * Defaults to a camera icon.
 */
function defaultInitialAppearance(): JSX.Element {
  return (
    <div css={DEFAULT_IMAGE_STYLING}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 22 144 100"
        aria-hidden="true"
        focusable="false"
      >
        <polygon points="93.58 51.5 87.75 41.5 59.55 41.5 54.35 51.5 27.18 51.5 27.18 102.5 116.82 102.5 116.82 51.5 93.58 51.5" />
        <rect x="31.48" y="44.49" width="15.23" height="7.01" />
        <circle cx="74" cy="74.38" r="22.88" />
        <circle cx="74" cy="74.38" r="17.47" />
        <circle cx="38.63" cy="60.15" r="3.24" />
        <line x1="96.12" y1="67.86" x2="116.82" y2="67.86" />
        <line x1="27.18" y1="67.86" x2="51.88" y2="67.86" />
      </svg>
    </div>
  );
}

const DEFAULT_IMAGE_STYLING = css({
  backgroundColor: GRAY_300,
  color: WHITE,
  svg: {
    strokeWidth: 3,
    strokeLinecap: 'round',
    fill: 'none',
    stroke: 'currentColor',
  },
});

const INPUT_CONTAINER_FOCUS_STYLING = css({
  '&:focus > div': {
    outline: `4px solid #000`,
    outlineOffset: '-5px',
  },
});

const BUTTON_FOCUS_STYLING = css({
  '&:focus': {
    outline: `3px solid #000`,
    outlineOffset: '-4px',
  },
});

const PREVIEW_CONTAINER_STYLING = css({
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: 'currentColor',
});

const PREVIEW_IMAGE_STYLING = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
});

const DRAG_RING_STYLING = css({
  '&::before': {
    display: 'block',
    position: 'absolute',
    content: '""',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    borderStyle: 'dashed',
    borderColor: WHITE,
  },
});

const PROGRESS_STYLING = css({
  position: 'absolute',
  left: 0,
  bottom: 0,
  height: 6,
  backgroundColor: OPTIMISTIC_BLUE_LIGHT,
});

const ERROR_MESSAGE_STYLING = css({
  color: FREEDOM_RED_DARK,
});
