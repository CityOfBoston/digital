import React from 'react';
import Dropzone from 'react-dropzone';

import { css } from 'emotion';

import {
  FREEDOM_RED_DARK,
  GRAY_300,
  OPTIMISTIC_BLUE_LIGHT,
  WHITE,
} from '../utilities/constants';

interface DropzoneFile extends File {
  preview: string;
}

interface Props {
  backgroundElement?: JSX.Element;
  buttonTitleUpload?: string;
  buttonTitleRemove?: string;
  buttonTitleCancel?: string;

  handleDrop: (file: DropzoneFile) => void;
  handleRemove: () => void;
  handleCancel?: () => void;

  uploadProgress?: number | null; // 0 - 100
  errorMessage?: string | null;
}

interface State {
  file: DropzoneFile | null;
  previewHeight: number;
}

/**
 * Component which allows a user to submit a photo via drag-and-drop, or
 * by choosing a file from their computer.
 *
 * Default appearance can be customized by passing an element into the
 * backgroundElement property; when an image has been selected, its’ preview
 * will be the same height as that initial element.
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
  };

  state: State = {
    file: null,
    previewHeight: 0,
  };

  // In order to maintain the height of the component, we measure the initial
  // appearance element when the component mounts. If the browser window is
  // resized, the height is remeasured and updated.
  private getPreviewElementInformation = () => {
    const domRect =
      this.previewRef.current &&
      this.previewRef.current.getBoundingClientRect();

    if (domRect) {
      this.setState({ previewHeight: domRect.height });
    }
  };

  private onDrop = (files: File[]): void => {
    this.setState(
      {
        file: Object.assign(files[0], {
          preview: URL.createObjectURL(files[0]),
        }),
      },
      () => {
        this.state.file && this.props.handleDrop(this.state.file);
      }
    );
  };

  private onRemove = (): void => {
    this.setState({ file: null }, () => {
      this.props.handleRemove();
    });
  };

  private handleButtonClick = (): void => {
    const isUploading =
      this.props.uploadProgress && this.props.uploadProgress < 100;

    if (!this.dropzoneRef.current) {
      return;
    }

    if (this.state.file) {
      // User may cancel an upload while it is in progress.
      if (isUploading && this.props.handleCancel) {
        this.props.handleCancel();
      }

      this.onRemove();
    } else {
      this.dropzoneRef.current && this.dropzoneRef.current.open();
    }
  };

  componentDidMount() {
    this.getPreviewElementInformation();

    window.addEventListener('resize', this.getPreviewElementInformation);
  }

  componentWillUnmount() {
    // see https://react-dropzone.netlify.com/#!/Previews
    // Make sure to revoke the data uris to avoid memory leaks
    if (this.state.file) {
      URL.revokeObjectURL(this.state.file.preview);
    }

    window.removeEventListener('resize', this.getPreviewElementInformation);
  }

  render() {
    const { errorMessage, uploadProgress } = this.props;
    const { file } = this.state;

    const isUploading = uploadProgress && uploadProgress < 100;
    const hasError = errorMessage;

    let buttonTitle: string;

    if (isUploading) {
      buttonTitle = this.props.buttonTitleCancel || 'Cancel upload';
    } else if (this.state.file) {
      buttonTitle = this.props.buttonTitleRemove || 'Remove photo';
    } else {
      buttonTitle = this.props.buttonTitleUpload || 'Upload photo';
    }

    return (
      <>
        <div className="br br-a200">
          <Dropzone
            ref={this.dropzoneRef}
            accept="image/*"
            multiple={false}
            onDrop={this.onDrop}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                style={{ height: this.state.previewHeight }}
              >
                <input {...getInputProps()} />

                <div
                  ref={this.previewRef}
                  className={`${PREVIEW_CONTAINER_STYLING} ${
                    isDragActive ? DRAG_RING_STYLING : ''
                  }`}
                >
                  {file ? (
                    <img
                      src={file.preview}
                      alt=""
                      className={PREVIEW_IMAGE_STYLING}
                      style={{ maxHeight: this.state.previewHeight }}
                    />
                  ) : (
                    <>
                      {this.props.backgroundElement ||
                        defaultInitialAppearance()}
                    </>
                  )}
                </div>
              </div>
            )}
          </Dropzone>

          <div className="br br-t200" style={{ position: 'relative' }}>
            <button
              className={`btn btn--w btn--b ${isUploading ? 'btn--r-hov' : ''}`}
              style={{ width: '100%' }}
              type="button"
              onClick={this.handleButtonClick}
            >
              {buttonTitle}
            </button>

            {isUploading && (
              <div
                className={PROGRESS_STYLING}
                style={{ width: `${uploadProgress}%` }}
              />
            )}
          </div>
        </div>

        {hasError && (
          <div className={`t--info p-a300 ${ERROR_MESSAGE_STYLING}`}>
            Error: {errorMessage}
          </div>
        )}
      </>
    );
  }
}

/**
 * Defaults to a camera icon.
 */
function defaultInitialAppearance(): JSX.Element {
  return (
    <div className={DEFAULT_IMAGE_STYLING}>
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

const PREVIEW_CONTAINER_STYLING = css({
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: 'currentColor',
});

const PREVIEW_IMAGE_STYLING = css({
  display: 'block',
  margin: '0 auto',
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
