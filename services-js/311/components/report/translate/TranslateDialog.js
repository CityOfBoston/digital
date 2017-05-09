// @flow
/* eslint react/jsx-no-bind: 0 */

import React from 'react';

import { css } from 'glamor';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import FormDialog from '../../common/FormDialog';
import { MEDIA_LARGE } from '../../style-constants';

const DIALOG_CONTENTS_STYLE = css({
  minHeight: '40vh',
});

const TELEPHONE_STYLE = css({
  background: 'url(/static/img/faq-icons.png) no-repeat',
  backgroundPosition: '-300px -5px',
  width: 99,
  height: 93,
  display: 'none',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

@observer
export default class TranslateDialog extends React.Component {
  @observable code: string = 'es';

  @action.bound
  setLanguageCode(code: string) {
    this.code = code;
  }

  render() {
    return (
      <FormDialog>
        <div className={DIALOG_CONTENTS_STYLE}>
          <div className="g">
            { this.renderButton('ht', 'Kreyòl Ayisyen') }
            { this.renderButton('pt-BR', 'Português') }
            { this.renderButton('es', 'Español') }
            { this.renderButton('vi', 'Tiếng Việt') }
            { this.renderButton('zh-CN', '简体中文') }
            { this.renderButton('zh-TW', '繁體中文') }
          </div>

          <div className="g m-v500 p-a500" style={{ alignItems: 'center' }} >
            <div className="g--1" />
            <div className="g--2" >
              <div className={TELEPHONE_STYLE} />
            </div>

            <div className="g--8 t--intro" style={{ fontStyle: 'normal' }}>
              If you need to report a non-emergency issue with the City of Boston, please call
              BOS:311 at 311 or 617-635-4500.
            </div>
          </div>
        </div>
      </FormDialog>
    );
  }

  renderButton(code: string, title: string) {
    return (
      <button className={`btn g--2 m-v100 ${(code === this.code) ? 'btn--c' : ''}`} onClick={this.setLanguageCode.bind(this, code)}>{title}</button>
    );
  }
}
