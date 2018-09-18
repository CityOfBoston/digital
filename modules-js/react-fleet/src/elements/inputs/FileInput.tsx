import React from 'react';
import { css } from 'emotion';

import { VISUALLYHIDDEN } from '../../utilities/css';

import { MEDIA_SMALL, OPTIMISTIC_BLUE } from '../../utilities/constants';

import CloseButton from '../buttons/CloseButton';


const INPUT_CONTAINER_STYLE = css(`
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
`);

const LABEL_FOCUSED_STYLE = css({
  outline: `3px solid ${OPTIMISTIC_BLUE}`,
  outlineOffset: '1px'
});

// todo: safari is not ever picking up this styling?
const FILE_PREVIEW_STYLE = css({
  position: 'relative',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
});

const DELETE_BUTTON_STYLE = css({
  marginLeft: '0.2em'
});

const DEFAULT_PREVIEW_TEXT = 'No file selected';


interface Props {
  name: string;
  title: string;
  fileTypes: string[];
  sizeLimit: FileSize;
}

interface State {
  selectedFile: File | null;
  isFocused: boolean;
}

interface FileSize {
  quantity: string | number;
  unit: string;
}

export default class FileInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedFile: null,
      isFocused: false
    }
  }

  private inputRef: any = React.createRef<HTMLInputElement>();

  /**
   * Only accept the file if it doesn’t exceed the specified limit
   */
  private checkSize = (file: File) => {
    const { quantity, unit } = this.props.sizeLimit;
    const result = formatBytes(file.size);

    if (result.unit === unit && +quantity >= +quantity) {
      // todo: should this be a modal/notification component?
      // todo: handle via callback: https://github.com/CityOfBoston/digital/pull/41#discussion_r218545231
      return alert(`File size limit of ${quantity}${unit} exceeded.\n\nYour file is ${result.quantity + result.unit}. Please select a different file.`);
    }

    this.setState({ selectedFile: file });
  };

  /**
   * Ensure file is cleared in the state, as well as in the input element itself
   */
  private clearFile = () => {
    this.setState({ selectedFile: null }, () => this.inputRef.current.value = null);
  };

  private setFocus = (isFocused: boolean) => {
    this.setState({ isFocused });
  };

  private handleChange = () => {
    if (!this.inputRef.current.files.length) {
      this.clearFile();

    } else {
      this.checkSize(this.inputRef.current.files[0]);
    }
  };


  render() {
    return (
      <div className={`txt m-b300 ${INPUT_CONTAINER_STYLE}`}>
        <input
          className={VISUALLYHIDDEN}
          ref={this.inputRef}
          type="file"
          accept={this.props.fileTypes.join(', ')}
          id={`FileInput-${this.props.name}`}
          name={this.props.name}
          onChange={this.handleChange}
          onBlur={() => this.setFocus(false)}
          onFocus={() => this.setFocus(checkFocus(this.props.name))}
        />

        <label
          htmlFor={`FileInput-${this.props.name}`}
          className={`btn btn--sm btn--100 ${this.state.isFocused && LABEL_FOCUSED_STYLE}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          Choose {this.props.title} file
        </label>

        <div className={FILE_PREVIEW_STYLE}>
          <span>{this.state.selectedFile ? this.state.selectedFile.name : DEFAULT_PREVIEW_TEXT}</span>
        </div>

        {this.state.selectedFile && (
          <CloseButton
            className={DELETE_BUTTON_STYLE}
            size="1.8em"
            title="Remove file"
            handleClick={this.clearFile}
          />
        )}
      </div>
    );
  }
}


function checkFocus(fieldName: string): boolean {
  return document.activeElement.getAttribute('name') === fieldName;
}

export function formatBytes(bytes: number): FileSize {
  const returnObject: FileSize = {
    quantity: '',
    unit: ''
  };

  if (bytes < 1024) {
    returnObject.quantity = bytes.toString();
    returnObject.unit = 'B';

  } else if (bytes < 1048576) {
    returnObject.quantity = (bytes / 1024).toFixed(2);
    returnObject.unit = 'KB';

  } else if (bytes < 1073741824) {
    returnObject.quantity = (bytes / 1048576).toFixed(2);
    returnObject.unit = 'MB';

  } else  {
    returnObject.quantity = (bytes / 1073741824).toFixed(2);
    returnObject.unit = 'GB';
  }

  return returnObject;
}
