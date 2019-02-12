import React from 'react';
import { css } from 'emotion';

import {
  CloseButton,
  FOCUS_INDICATOR_COLOR,
  VISUALLYHIDDEN,
} from '@cityofboston/react-fleet';

interface Props {
  name: string;
  title: string;
  fileTypes?: string[] | string;
  sizeLimit: FileSize;
  handleChange(documents: File[]): void;
}

interface State {
  selectedFiles: File[];
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
 * Defaults to accept any file type or size. To restrict the types of files to
 * accept, assign a string or array of strings to “fileTypes” that contains the
 * allowed MIME type(s).
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Limiting_accepted_file_types
 *
 * To disallow large files, pass an object to “sizeLimit” to define the limit:
 *
 * { amount: 20, unit: 'MB' }
 */
export default class SupportingDocumentsInput extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedFiles: [],
      isFocused: false,
    };
  }

  private readonly inputRef = React.createRef<HTMLInputElement>();

  // Check to see if a file does not exceed the file size limit, if defined.
  private checkFileSize = (file: File): boolean | void => {
    const sizeLimit = handleBytes.convert(this.props.sizeLimit);
    const fileSize = handleBytes.format(file.size);

    if (file.size > sizeLimit) {
      // todo: consider handling via callback: https://github.com/CityOfBoston/digital/pull/41#discussion_r218545231

      alert(
        `There’s a ${this.props.sizeLimit.amount}${
          this.props.sizeLimit.unit
        } size limit for documents, but
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

  private updateFiles = (files: FileList): void => {
    const { selectedFiles } = this.state;

    // Create an array from the FileList.
    const fileArray: File[] = [];

    for (let i = 0; i < files.length; i++) {
      // Do not allow duplicate filenames, or files that are too large.
      if (isUnique(files[i]) && this.checkFileSize(files[i])) {
        fileArray.push(files[i]);
      }
    }

    this.setState(
      { selectedFiles: [...this.state.selectedFiles, ...fileArray] },
      () => {
        this.props.handleChange(this.state.selectedFiles);

        // Clear actual input after each change.
        if (this.inputRef.current) {
          this.inputRef.current.value = null as any;
        }
      }
    );

    // Check to see if a file is already in this.state.selectedFiles.
    function isUnique(newFile: File): boolean {
      const result = selectedFiles.filter(file => file.name === newFile.name);

      return result.length === 0;
    }
  };

  // Clear a file from the list.
  private clearFile(fileToClear: File): void {
    const filteredList = this.state.selectedFiles.filter(file => {
      return file.name !== fileToClear.name;
    });

    this.setState({ selectedFiles: filteredList }, () => {
      this.props.handleChange(this.state.selectedFiles);
    });
  }

  private handleFileChange = (): void => {
    if (this.inputRef.current && this.inputRef.current.files) {
      this.updateFiles(this.inputRef.current.files);
    }
  };

  // Default to “fileType: any” if file types have not been specified.
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
    return (
      <div className={`m-b300 m-t700 ${INPUT_CONTAINER_STYLING}`}>
        <input
          className={VISUALLYHIDDEN}
          ref={this.inputRef}
          type="file"
          accept={this.fileTypesString(this.props.fileTypes)}
          multiple
          id={`FileInput-${this.props.name}`}
          name={this.props.name}
          onChange={this.handleFileChange}
          onBlur={() => this.setFocus(false)}
          onFocus={() => this.setFocus(true)}
        />

        <label
          htmlFor={`FileInput-${this.props.name}`}
          className={`btn ${this.state.isFocused && LABEL_FOCUSED_STYLING}`}
          style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
        >
          {this.props.title}
        </label>

        <ul className={FILE_LIST_STYLING}>
          {this.state.selectedFiles.map(file => (
            <li key={file.name}>
              <span className="txt">
                {file.name}

                <CloseButton
                  handleClick={() => this.clearFile(file)}
                  className={DELETE_BUTTON_STYLING}
                  size="1.7em"
                  title={`Remove file: ${file.name}`}
                />
              </span>
            </li>
          ))}
        </ul>
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

const INPUT_CONTAINER_STYLING = css({
  label: {
    marginBottom: '0.5em',
  },
});

const LABEL_FOCUSED_STYLING = css({
  outline: `3px solid ${FOCUS_INDICATOR_COLOR}`,
  outlineOffset: '1px',
});

const FILE_LIST_STYLING = css({
  'li > span': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',

    button: {
      marginLeft: '1rem',
    },
  },
});

const DELETE_BUTTON_STYLING = css(`
  margin-left: 0.2em;
  
  opacity: 0.6;
  transition: opacity 0.15s;
  
  &:hover {
    opacity: 1;
  }
`);
