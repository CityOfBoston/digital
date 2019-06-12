/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { createRef, Component } from 'react';

import { observer } from 'mobx-react';

// todo: prevent next/back while uploads pending

import {
  CloseButton,
  CHARLES_BLUE,
  ERROR_TEXT_COLOR,
  FOCUS_INDICATOR_COLOR,
  OPTIMISTIC_BLUE_LIGHT,
  VISUALLY_HIDDEN,
  MEDIA_SMALL,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import { CertificateType } from '../types';

import AnswerIcon from './icons/AnswerIcon';

import UploadableFile from '../models/UploadableFile';

interface Props {
  uploadSessionId: string;
  selectedFiles: UploadableFile[];
  handleInputChange(files: UploadableFile[]): void;
  acceptTypes: string;
  certificateType: CertificateType;
}

interface State {
  isFocused: boolean;
}

interface FileSize {
  amount: number;
  unit: 'B' | 'KB' | 'MB' | 'GB';
}

/**
 * Component that allows a user to select one or more files from their computer.
 *
 * Selected files can be individually removed, and additional files can be
 * added to the group of already-selected files. Duplicate files are identified
 * by filename, and will be discarded.
 *
 * todo: update
 */

@observer
export default class SupportingDocumentsInput extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isFocused: false,
    };
  }

  private readonly inputRef = createRef<HTMLInputElement>();

  // Check to see if a file does not exceed the file size limit, if defined.
  private checkFileSize = (file: File): boolean | void => {
    const sizeLimit = handleBytes.convert({ amount: 10, unit: 'MB' });
    const fileSize = handleBytes.format(file.size);

    if (file.size > sizeLimit) {
      alert(
        `There’s a 10MB size limit for documents, but
${file.name} is ${fileSize.amount.toFixed(2) +
          fileSize.unit}. Try a different file.`
      );

      return false;
    } else {
      return true;
    }
  };

  // Add or remove focus styling for the label element.
  private setFocus = (isFocused: boolean): void => {
    this.setState({ isFocused });
  };

  private addFilesFromInput = (files: FileList) => {
    const { certificateType, selectedFiles } = this.props;

    // Create an array from the FileList.
    const fileArray: UploadableFile[] = [];

    for (let i = 0; i < files.length; i++) {
      // Do not allow duplicate filenames, or files that are too large.
      if (
        !selectedFiles.find(
          uploadableFile => uploadableFile.name === files[i].name
        ) &&
        this.checkFileSize(files[i])
      ) {
        const uploadableFile = new UploadableFile(
          files[i],
          this.props.uploadSessionId
        );

        uploadableFile.upload(certificateType);

        fileArray.push(uploadableFile);
      }
    }

    // Clear native input after each change. This will cause handleFileChange
    // to be called immediately.
    if (this.inputRef.current) {
      this.inputRef.current.value = null as any;
    }

    // We put this at the end to emphasize that its effect on
    // this.props.selectedFiles won’t be seen immediately, but rather after it
    // has a chance to propagate back down.
    //
    // Because we call handleInputChange based on the current value of
    // selectedFiles, this method is *not* re-entrant. If it’s called
    // recursively, the first added files will be thrown away.
    this.props.handleInputChange([...selectedFiles, ...fileArray]);
  };

  // Clear a file from the list, and delete from server.
  private deleteFile = async (
    file: UploadableFile,
    didCancel?: boolean
  ): Promise<void> => {
    const { certificateType, selectedFiles } = this.props;

    await file.delete(certificateType, didCancel);

    this.props.handleInputChange(
      selectedFiles.filter(fileObject => fileObject !== file)
    );
  };

  private handleFileChange = (): void => {
    const input = this.inputRef.current;

    // The 0 file check is for IE. Because this will get triggered from within
    // addFilesFromInput when it clears the input, we want to be extra-sure that
    // we don't cause a recursive call to addFilesFromInput.
    if (input && input.files && input.files.length) {
      this.addFilesFromInput(input.files);
    }
  };

  // Remove any and all failed uploads from the selectedFiles list.
  private clearFailures = (): void => {
    this.props.handleInputChange(
      this.props.selectedFiles.filter(
        file => file.status !== 'uploadError' && file.status !== 'deletionError'
      )
    );
  };

  render() {
    return (
      <div className="m-b300">
        <input
          css={VISUALLY_HIDDEN}
          ref={this.inputRef}
          type="file"
          accept={this.props.acceptTypes}
          multiple
          id="uploadSupportingDocuments"
          onChange={this.handleFileChange}
          onBlur={() => this.setFocus(false)}
          onFocus={() => this.setFocus(true)}
        />

        <label
          htmlFor="uploadSupportingDocuments"
          className="btn btn--sm btn--200"
          css={this.state.isFocused && LABEL_FOCUSED_STYLING}
          style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
          onClick={this.clearFailures}
        >
          Upload Supporting Documents
        </label>

        <div className="t--subinfo m-v200">
          Files should be PDF format, and under 10MB each.
        </div>

        <ul className="t--s400" css={FILE_LIST_STYLING}>
          {this.props.selectedFiles.map(uploadedFile => (
            <li key={uploadedFile.name}>
              {/* this instead of list-style to avoid ie11 formatting issue */}
              <span className="name">
                <span aria-hidden="true">•</span>

                <span>{uploadedFile.name}</span>
              </span>

              {uploadedFile.status === 'canceling' ||
              uploadedFile.status === 'deleting' ? (
                <span css={STATUS_TEXT_STYLING}>{uploadedFile.status}…</span>
              ) : (
                <FileButton
                  uploadableFile={uploadedFile}
                  deleteFile={this.deleteFile}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

interface FileButtonProps {
  uploadableFile: UploadableFile;
  deleteFile: (file: UploadableFile, didCancel?: boolean) => void;
}

function FileButton(props: FileButtonProps): JSX.Element {
  const { name, status } = props.uploadableFile;

  if (status === 'success') {
    return (
      <CloseButton
        handleClick={() => props.deleteFile(props.uploadableFile)}
        css={DELETE_BUTTON_STYLING}
        size="1.7em"
        title={`Remove file: ${name}`}
      />
    );
  } else if (status === 'uploading') {
    return (
      <div css={UPLOADING_CONTAINER_STYLING}>
        <progress
          max="100"
          aria-hidden="true"
          value={props.uploadableFile.progress}
          css={UPLOADING_PROGRESS_STYLING}
          title={`${props.uploadableFile.progress.toFixed(0)}% uploaded`}
        />

        <CloseButton
          handleClick={() => props.deleteFile(props.uploadableFile, true)}
          css={DELETE_BUTTON_STYLING}
          size="1.7em"
          title={`Cancel upload: ${name}`}
        />
      </div>
    );
  } else if (status === 'uploadError') {
    return (
      <button
        type="button"
        onClick={() => props.uploadableFile.upload('birth')}
        css={ERROR_CONTAINER_STYLING}
      >
        <AnswerIcon iconName="excl" />
        <span>Upload failed. Retry?</span>
      </button>
    );
  } else if (status === 'deletionError') {
    return (
      <button
        type="button"
        onClick={() => props.uploadableFile.upload('birth')}
        css={ERROR_CONTAINER_STYLING}
      >
        <AnswerIcon iconName="excl" />
        <span>Failed to delete. Retry?</span>
      </button>
    );
  } else {
    return <></>;
  }
}

export const handleBytes = {
  values: {
    b: null,
    kb: 1024,
    mb: 1048576,
    gb: 1073741824,
  },

  // Takes in a number of bytes, converts to the largest binary prefix, and
  // returns an object containing the unit of measurement, and the amount
  format: function(bytes: number): FileSize {
    const fileSize: FileSize = {
      amount: 0,
      unit: 'B',
    };

    if (bytes < this.values.kb) {
      fileSize.amount = bytes;
      fileSize.unit = 'B';
    } else if (bytes < this.values.mb) {
      fileSize.amount = bytes / this.values.kb;
      fileSize.unit = 'KB';
    } else if (bytes < this.values.gb) {
      fileSize.amount = bytes / this.values.mb;
      fileSize.unit = 'MB';
    } else {
      fileSize.amount = bytes / this.values.gb;
      fileSize.unit = 'GB';
    }

    return fileSize;
  },

  // Converts back to bytes
  convert: function(fileSize: FileSize): number {
    if (fileSize.unit === 'KB') {
      return fileSize.amount * this.values.kb;
    } else if (fileSize.unit === 'MB') {
      return fileSize.amount * this.values.mb;
    } else if (fileSize.unit === 'GB') {
      return fileSize.amount * this.values.gb;
    } else {
      return fileSize.amount;
    }
  },
};

const LABEL_FOCUSED_STYLING = css({
  outline: `3px solid ${FOCUS_INDICATOR_COLOR}`,
  outlineOffset: '1px',
});

// originally, ie11 was rendering the list-style disc vertically misaligned
// with its list item, so we simulate the appearance by using an addt’l <span>
const FILE_LIST_STYLING = css({
  paddingLeft: 0,
  color: CHARLES_BLUE,
  li: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '1rem',
    marginLeft: '0.5rem',

    [MEDIA_SMALL]: {
      marginLeft: '1rem',
    },

    '.name > span:last-of-type': {
      margin: '0 0.5rem',

      [MEDIA_SMALL]: {
        margin: '0 1rem',
      },
    },
  },
});

const STATUS_TEXT_STYLING = css({
  textTransform: 'capitalize',
  fontStyle: 'italic',
  color: ERROR_TEXT_COLOR,
});

const UPLOADING_CONTAINER_STYLING = css({
  display: 'flex',
  alignItems: 'center',
});

const UPLOADING_PROGRESS_STYLING = css({
  marginRight: '0.5rem',
  height: '0.5rem',
  border: `1px solid ${CHARLES_BLUE}`,
  backgroundColor: WHITE,

  '::-webkit-progress-bar': {
    backgroundColor: WHITE,
  },

  '::-webkit-progress-value': {
    transition: 'width 0.5s',

    backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  },

  '::-moz-progress-bar': {
    backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  },

  '::-ms-fill': {
    backgroundColor: OPTIMISTIC_BLUE_LIGHT,
  },
});

const ERROR_CONTAINER_STYLING = css({
  padding: 0,
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: 'inherit',
  cursor: 'pointer',

  display: 'flex',
  alignItems: 'center',
  fontFamily: SERIF,
  fontStyle: 'italic',
  color: ERROR_TEXT_COLOR,

  svg: {
    height: '1.2em',
    width: '1.2em',
    marginRight: '0.5rem',
  },
});

const DELETE_BUTTON_STYLING = css({
  opacity: 0.6,
  transition: 'opacity 0.15s',

  '&:hover': {
    opacity: 1,
  },
});
