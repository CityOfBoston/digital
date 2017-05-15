// @flow
/* eslint react/jsx-no-bind: 0 */

import React from 'react';

import { css } from 'glamor';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import type { LanguagePreference } from '../../../data/store';

import FormDialog from '../../common/FormDialog';
import { MEDIA_LARGE, CENTERED_DIALOG_STYLE } from '../../style-constants';

const SPRITE_URL = '/static/img/svg/faq-icons.svg';

const DIALOG_CONTENTS_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  minHeight: '40vh',
});

const TELEPHONE_STYLE = css({
  display: 'none',
  width: '100%',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

const CONTINUE_LINK_STYLE = css({
  fontStyle: 'normal',
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
});

export type DefaultProps = {
  showContinueInEnglish: boolean,
}

export type Props = {|
  languages: LanguagePreference[],
  showContinueInEnglish?: boolean,
|}

const LANGUAGES = [
  { code: 'ht', name: 'Kreyòl Ayisyen' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en', name: 'English' },
];

@observer
export default class TranslateDialog extends React.Component {
  props: Props;

  static defaultProps: DefaultProps = {
    showContinueInEnglish: false,
  };

  @observable code: string;

  @action
  componentWillMount() {
    const { languages } = this.props;
    this.code = TranslateDialog.findLanguage(languages) || 'es';
  }

  static findLanguage(languages: LanguagePreference[]): ?string {
    for (let i = 0; i < languages.length; ++i) {
      const lang = languages[i];

      if (lang.region) {
        const key = `${lang.code}-${lang.region}`;
        if (LANGUAGES.find(({ code }) => (code === key))) {
          return key;
        }
      }

      if (LANGUAGES.find(({ code }) => (code === lang.code))) {
        return lang.code;
      }
    }

    return null;
  }

  @action.bound
  setLanguageCode(code: string) {
    this.code = code;
  }

  render() {
    const { showContinueInEnglish } = this.props;

    return (
      <div className={CENTERED_DIALOG_STYLE}>
        <FormDialog>
          <div className={DIALOG_CONTENTS_STYLE}>
            <div className="g">
              { LANGUAGES.map(({ code, name }) => this.renderButton(code, name)) }
            </div>

            <div className="g m-v500 p-a500" style={{ alignItems: 'center' }} >
              <div className="g--3" >
                <svg role="img" className={TELEPHONE_STYLE}>
                  <use xlinkHref={`${SPRITE_URL}#Phone_off`} height="100%" />
                </svg>
              </div>

              <div className="g--8 t--intro" style={{ fontStyle: 'normal' }}>
                If you need to report a non-emergency issue with the City of Boston, please call
                BOS:311 at 311 or <span style={{ whiteSpace: 'nowrap' }}>617-635-4500</span>.
              </div>

            </div>

            { showContinueInEnglish && (
              <div className={`p-a500 t--info ${CONTINUE_LINK_STYLE.toString()}`}>
                <Link href="/request?translate=0" as="/?translate=0"><a>Continue in English</a></Link>
              </div>
            )}
          </div>
        </FormDialog>
      </div>
    );
  }

  renderButton(code: string, title: string) {
    if (code === 'en') {
      return null;
    }

    return (
      <button key={code} className={`btn g--2 m-v100 ${(code === this.code) ? 'btn--c' : ''}`} onClick={this.setLanguageCode.bind(this, code)}>{title}</button>
    );
  }
}
