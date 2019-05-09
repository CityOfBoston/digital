/** @jsx jsx */

import React from 'react';
import { css, jsx, ClassNames } from '@emotion/core';

import { VISUALLY_HIDDEN } from '../../utilities/css';

import { MEDIA_SMALL, FOCUS_INDICATOR_COLOR } from '../../utilities/constants';

import CloseButton from '../buttons/CloseButton';

interface Props {
  name: string;
  title: string;
  fileTypes?: string[] | string;
  sizeLimit: FileSize;
  handleChange(name: string, file: any): void;
}

interface State {
  selectedFile: File | null;
  isFocused: boolean;
}

interface FileSize {
  amount: number;
  unit: 'B' | 'KB' | 'MB' | 'GB';
}

const INPUT_CONTAINER_STYLE = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  ${MEDIA_SMALL} {
    flex-wrap: nowrap;
  }

  label {
    margin-bottom: 0.5em;

    ${MEDIA_SMALL} {
      margin-bottom: 0;
    }
  }

  div {
    flex-basis: 80%;

    ${MEDIA_SMALL} {
      flex-basis: auto;
      padding-left: 1em;
    }
  }
`;

const LABEL_FOCUSED_STYLE = css({
  outline: `3px solid ${FOCUS_INDICATOR_COLOR}`,
  outlineOffset: '1px',
});

const FILE_PREVIEW_STYLE = css({
  position: 'relative',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  cursor: 'default',
});

const DELETE_BUTTON_STYLE = css(`
  margin-left: 0.2em;
  
  opacity: 0.6;
  transition: opacity 0.15s;
  
  &:hover {
    opacity: 1;
  }
`);

const DEFAULT_PREVIEW_TEXT = 'No file selected';

/**
 * Component that allows a user to select a file. Defaults to accept any file
 * type or size. To restrict the types of files to accept, assign a string or
 * array of strings to “fileTypes” that contains the allowed MIME type(s).
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Limiting_accepted_file_types
 *
 * To disallow large files, pass an object to “sizeLimit” to define the limit:
 *
 * { amount: 20, unit: 'MB' }
 */
export default class FileInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedFile: null,
      isFocused: false,
    };
  }

  private inputRef: any = React.createRef<HTMLInputElement>();

  // Only accept the file if it doesn’t exceed the specified limit
  private checkFileSize = (file: File): boolean | void => {
    const sizeLimit = handleBytes.convert(this.props.sizeLimit);
    const fileSize = handleBytes.format(file.size);

    if (file.size > sizeLimit) {
      // todo: consider handling via callback: https://github.com/CityOfBoston/digital/pull/41#discussion_r218545231

      // prettier-ignore
      // without the lack of indentation on the second line, horizontal whitespace occurs
      alert(
        `File size limit of ${this.props.sizeLimit.amount}${this.props.sizeLimit.unit} exceeded.
Your file is ${fileSize.amount.toFixed(2) + fileSize.unit}. Please select a different file.`
      );

      return false;
    } else {
      return true;
    }
  };

  // Ensure file is cleared in the state, as well as in the input element itself
  private clearFile = (): void => {
    this.setState({ selectedFile: null }, () => {
      this.inputRef.current.value = null;
      this.props.handleChange(this.props.name, null);
    });
  };

  // Add or remove focus styling for the label element
  private setFocus = (isFocused: boolean): void => {
    this.setState({ isFocused });
  };

  private updateFile = (file: any): void => {
    this.setState({ selectedFile: file }, () =>
      this.props.handleChange(this.props.name, file)
    );
  };

  private handleFileChange = (): void => {
    if (!this.inputRef.current.files.length) {
      this.clearFile();

      // If a size limit hasn’t been specified, allow the file to be selected
    } else if (!this.props.sizeLimit) {
      this.updateFile(this.inputRef.current.files[0]);

      // If size limit IS specified, ensure file doesn’t exceed it before accepting
    } else if (this.checkFileSize(this.inputRef.current.files[0])) {
      this.updateFile(this.inputRef.current.files[0]);
    }
  };

  // Default to “fileType: any” if no file types have been specified
  private fileTypesString = (
    fileTypes: string[] | string | undefined
  ): string => {
    let resultString = '*';

    if (typeof fileTypes === 'string') {
      resultString = fileTypes;
    } else if (Array.isArray(fileTypes)) {
      resultString = fileTypes.join(', ');
    }

    return resultString;
  };

  render() {
    const { selectedFile, isFocused } = this.state;

    return (
      <div className="txt m-b300" css={INPUT_CONTAINER_STYLE}>
        <input
          css={VISUALLY_HIDDEN}
          ref={this.inputRef}
          type="file"
          accept={this.fileTypesString(this.props.fileTypes)}
          id={`FileInput-${this.props.name}`}
          name={this.props.name}
          onChange={this.handleFileChange}
          onBlur={() => this.setFocus(false)}
          onFocus={() => this.setFocus(true)}
        />

        <label
          htmlFor={`FileInput-${this.props.name}`}
          className="btn btn--sm btn--100"
          css={isFocused && LABEL_FOCUSED_STYLE}
          style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
        >
          Choose {this.props.title} file
        </label>

        <div css={FILE_PREVIEW_STYLE}>
          <span title={selectedFile ? 'Selected file: ' : undefined}>
            {selectedFile ? selectedFile.name : DEFAULT_PREVIEW_TEXT}
          </span>
        </div>

        {selectedFile && (
          <ClassNames>
            {({ css }) => (
              <CloseButton
                className={css(DELETE_BUTTON_STYLE)}
                size="1.8em"
                title={`Remove file: ${selectedFile.name}`}
                handleClick={this.clearFile}
              />
            )}
          </ClassNames>
        )}
      </div>
    );
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
