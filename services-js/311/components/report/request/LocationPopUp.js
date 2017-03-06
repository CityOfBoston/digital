// @flow

import React from 'react';
import { css } from 'glamor';

const CONTENT_STYLE = css({
  // padding: '0 30px 30px 30px',
  marginTop: -60,
  display: 'flex',
  flexDirection: 'column',
});

const HEADING_STYLE = css({
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 18,
  fontStyle: 'italic',
  borderBottom: '2px dashed #999',
  padding: '15px 0',
  marginBottom: 0,
});

const ADDRESS_STYLE = css({
  textTransform: 'uppercase',
  whiteSpace: 'pre-line',
  margin: '30px 0 0',
  fontSize: 16,
  fontWeight: 'bold',
});

const SEARCH_FORM_STYLE = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const SEARCH_BOX_STYLE = css({
  margin: '30px 0',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: '3px solid black',
  paddingBottom: 8,
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 18,
  fontStyle: 'italic',
  flex: 1,
});

const BUTTON_STYLE = css({
  padding: '10px 0',
  width: '50%',
  alignSelf: 'flex-end',
  backgroundColor: '#308de1',
  border: 'none',
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,

  '&:disabled': {
    backgroundColor: '#aaa',
  },
});

export type ExternalProps = {
  addressSearch: ?((string) => Promise<boolean>),
  nextFunc: () => void,
}

export type ValueProps = {
  address: ?string,
}

export type Props = ExternalProps & ValueProps;

export default class LocationPopUp extends React.Component {
  props: Props;
  state: {
    addressQuery: string,
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      addressQuery: '',
    };
  }

  whenSearchInput = (ev: SyntheticInputEvent) => {
    this.setState({ addressQuery: ev.target.value });
  }

  whenSearchSubmit = async (ev: SyntheticInputEvent) => {
    const { addressSearch } = this.props;
    const { addressQuery } = this.state;

    ev.preventDefault();

    if (!addressSearch) {
      return;
    }

    const found = await addressSearch(addressQuery);
    if (found) {
      this.setState({ addressQuery: '' });
    }
  }

  render() {
    const { address, nextFunc, addressSearch } = this.props;
    const { addressQuery } = this.state;

    return (
      <div className={CONTENT_STYLE}>
        <h3 className={HEADING_STYLE}>Where is the problem happening?</h3>
        { address && <div className={ADDRESS_STYLE}>{ address }</div> }
        <form className={SEARCH_FORM_STYLE} onSubmit={this.whenSearchSubmit}>
          <input
            className={SEARCH_BOX_STYLE}
            onInput={this.whenSearchInput}
            value={addressQuery}
            placeholder={address ? 'Search for another address…' : 'Search for an address…'}
            type="text"
          />
          <button type="submit" disabled={addressQuery.length === 0 || !addressSearch}>Search</button>
        </form>
        <button className={BUTTON_STYLE} disabled={!address} onClick={nextFunc}>Next</button>
      </div>
    );
  }
}
