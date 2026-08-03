/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { createRef, Component, DragEvent } from 'react';
import { observer } from 'mobx-react';

import {
  CloseButton,
  CHARLES_BLUE,
  ERROR_TEXT_COLOR,
  FOCUS_INDICATOR_COLOR,
  OPTIMISTIC_BLUE_LIGHT,
  SERIF,
  WHITE,
} from '@cityofboston/react-fleet';

import { CertificateType } from '../../types';
import AnswerIcon from '../../common/icons/AnswerIcon';
import UploadableFile from '../../models/UploadableFile';
import { handleBytes } from '../../common/SupportingDocumentsInput';

interface Props {
  uploadSessionId: string;
  selectedFiles: UploadableFile[];
  handleInputChange(files: UploadableFile[]): void;
  acceptTypes: string;
  certificateType: CertificateType;
  /**
   * Stored as Commerce attachment @label. Encode document-type / relationship
   * metadata here — there is no separate document-type column on OrderItems.
   */
  attachmentLabel: string;
  inputId: string;
  buttonText?: string;
  helpText?: string;
}

interface State {
  isFocused: boolean;
  isDragOver: boolean;
}

/**
 * Death-specific file upload UI for STEP 3 certificate options.
 * Custom chrome matching Figma (drop zone + labeled UploadableFile uploads).
 * Max size is 25MB (DB death attachment limit); birth/marriage stay at 10MB.
 */
@observer
export default class DeathDocumentsUpload extends Component<Props, State> {
  state: State = {
    isFocused: false,
    isDragOver: false,
  };

  private readonly inputRef = createRef<HTMLInputElement>();

  private checkFileSize = (file: File): boolean => {
    const sizeLimit = handleBytes.convert({ amount: 25, unit: 'MB' });
    const fileSize = handleBytes.format(file.size);

    if (file.size > sizeLimit) {
      alert(
        `There’s a 25MB size limit for documents, but ${
          file.name
        } is ${fileSize.amount.toFixed(2) + fileSize.unit}. Try a different file.`
      );
      return false;
    }

    return true;
  };

  private addFiles = (files: FileList | File[]) => {
    const { certificateType, selectedFiles, attachmentLabel } = this.props;
    const fileArray: UploadableFile[] = [];
    const list = Array.from(files);

    for (let i = 0; i < list.length; i++) {
      if (
        !selectedFiles.find(
          uploadableFile => uploadableFile.name === list[i].name
        ) &&
        this.checkFileSize(list[i])
      ) {
        const uploadableFile = new UploadableFile(
          list[i],
          this.props.uploadSessionId,
          attachmentLabel
        );

        uploadableFile.upload(certificateType);
        fileArray.push(uploadableFile);
      }
    }

    if (this.inputRef.current) {
      this.inputRef.current.value = null as any;
    }

    if (fileArray.length) {
      this.props.handleInputChange([...selectedFiles, ...fileArray]);
    }
  };

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
    if (input && input.files && input.files.length) {
      this.addFiles(input.files);
    }
  };

  private handleDragOver = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    this.setState({ isDragOver: true });
  };

  private handleDragLeave = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    this.setState({ isDragOver: false });
  };

  private handleDrop = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    this.setState({ isDragOver: false });
    if (ev.dataTransfer.files && ev.dataTransfer.files.length) {
      this.addFiles(ev.dataTransfer.files);
    }
  };

  private clearFailures = (): void => {
    this.props.handleInputChange(
      this.props.selectedFiles.filter(
        file => file.status !== 'uploadError' && file.status !== 'deletionError'
      )
    );
  };

  render() {
    const {
      acceptTypes,
      inputId,
      buttonText = 'Upload file',
      helpText = 'Supports: JPEG, JPG, PDF (25 MB Max)',
      selectedFiles,
    } = this.props;
    const { isFocused, isDragOver } = this.state;

    return (
      <div className="m-b300">
        <input
          css={VISUALLY_HIDDEN}
          ref={this.inputRef}
          type="file"
          accept={acceptTypes}
          multiple
          id={inputId}
          onChange={this.handleFileChange}
          onBlur={() => this.setState({ isFocused: false })}
          onFocus={() => this.setState({ isFocused: true })}
        />

        <div
          css={[
            DROPZONE_STYLING,
            isDragOver && DROPZONE_ACTIVE_STYLING,
            isFocused && DROPZONE_FOCUSED_STYLING,
          ]}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
        >
          <img
            src="/assets/images/death-upload-icon.svg"
            alt=""
            width={24}
            height={24}
            css={UPLOAD_ICON_STYLING}
          />
          <p css={DROPZONE_TITLE_STYLING}>
            Click to upload file or drag and drop
          </p>
          <p css={DROPZONE_HELP_STYLING}>{helpText}</p>
          <label
            htmlFor={inputId}
            className="btn"
            css={UPLOAD_BUTTON_STYLING}
            onClick={this.clearFailures}
          >
            {buttonText}
          </label>
        </div>

        <ul className="t--s400" css={FILE_LIST_STYLING}>
          {selectedFiles.map(uploadedFile => (
            <li key={uploadedFile.name}>
              <span className="name">
                <span>
                  {uploadedFile.name}
                  {uploadedFile.file
                    ? ` (${handleBytes
                        .format(uploadedFile.file.size)
                        .amount.toFixed(0)}${
                        handleBytes.format(uploadedFile.file.size).unit
                      })`
                    : ''}
                </span>
              </span>

              {uploadedFile.status === 'canceling' ||
              uploadedFile.status === 'deleting' ? (
                <span css={STATUS_TEXT_STYLING}>{uploadedFile.status}…</span>
              ) : (
                <ObservedFileButton
                  uploadableFile={uploadedFile}
                  deleteFile={this.deleteFile}
                  certificateType={this.props.certificateType}
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
  certificateType: CertificateType;
  deleteFile: (file: UploadableFile, didCancel?: boolean) => void;
}

function FileButton(props: FileButtonProps): JSX.Element {
  const { name, status, errorMessage } = props.uploadableFile;

  if (status === 'success') {
    return (
      <CloseButton
        handleClick={() => props.deleteFile(props.uploadableFile)}
        css={DELETE_BUTTON_STYLING}
        size="1.7em"
        title={`Remove file: ${name}`}
      />
    );
  }

  if (status === 'uploading') {
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
  }

  if (status === 'uploadError' || status === 'deletionError') {
    return (
      <div css={ERROR_ACTIONS_STYLING}>
        <button
          type="button"
          onClick={() =>
            status === 'uploadError'
              ? props.uploadableFile.upload(props.certificateType)
              : props.deleteFile(props.uploadableFile)
          }
          css={ERROR_CONTAINER_STYLING}
          title={errorMessage || undefined}
        >
          <AnswerIcon iconName="excl" />
          <span>
            {status === 'uploadError'
              ? errorMessage
                ? `Upload failed: ${errorMessage} Retry?`
                : 'Upload failed. Retry?'
              : 'Failed to delete. Retry?'}
          </span>
        </button>
        <CloseButton
          handleClick={() => props.deleteFile(props.uploadableFile)}
          css={DELETE_BUTTON_STYLING}
          size="1.7em"
          title={`Remove file: ${name}`}
        />
      </div>
    );
  }

  return <></>;
}

const ObservedFileButton = observer(FileButton);

const VISUALLY_HIDDEN = css({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  border: 0,
});

const DROPZONE_STYLING = css({
  border: '2px dashed #d2d2d2',
  backgroundColor: '#F2F2F2',
  padding: '2rem 1.5rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '195px',
  justifyContent: 'center',
  boxSizing: 'border-box',
});

const DROPZONE_ACTIVE_STYLING = css({
  borderColor: OPTIMISTIC_BLUE_LIGHT,
  backgroundColor: '#f0f8ff',
});

const DROPZONE_FOCUSED_STYLING = css({
  outline: `3px solid ${FOCUS_INDICATOR_COLOR}`,
  outlineOffset: '1px',
});

const UPLOAD_ICON_STYLING = css({
  display: 'block',
  marginBottom: '0.75rem',
  width: 24,
  height: 24,
});

const DROPZONE_TITLE_STYLING = css({
  margin: '0 0 0.5rem',
  fontFamily: SERIF,
  fontSize: '1rem',
  fontWeight: 700,
  color: CHARLES_BLUE,
});

const DROPZONE_HELP_STYLING = css({
  margin: '0 0 1rem',
  fontFamily: SERIF,
  fontSize: '0.875rem',
  color: '#58585b',
});

const UPLOAD_BUTTON_STYLING = css({
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  minWidth: '10rem',
});

const FILE_LIST_STYLING = css({
  paddingLeft: 0,
  color: CHARLES_BLUE,
  marginTop: '1rem',
  listStyle: 'none',
  li: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e0e0e0',
    '.name': {
      fontFamily: SERIF,
      fontSize: '1rem',
    },
  },
});

const STATUS_TEXT_STYLING = css({
  textTransform: 'capitalize' as 'capitalize',
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
});

const ERROR_ACTIONS_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexWrap: 'wrap' as 'wrap',
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
