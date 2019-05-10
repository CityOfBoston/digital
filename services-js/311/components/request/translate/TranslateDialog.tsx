import React from 'react';
import Head from 'next/head';

import { css } from 'emotion';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import Link from 'next/link';

import { MEDIA_LARGE } from '@cityofboston/react-fleet';

import { LanguagePreference } from '../../../data/store/BrowserLanguage';

import FormDialog from '../../common/FormDialog';
import { assetUrl, CENTERED_DIALOG_STYLE } from '../../style-constants';

const SPRITE_URL = assetUrl('img/svg/faq-icons.svg');

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

const TELEPHONE_LINK_STYLE = css({
  color: 'inherit',
  textDecoration: 'underline',
  whiteSpace: 'nowrap',
});

const CONTINUE_LINK_STYLE = css({
  fontStyle: 'normal',
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
});

export type Props = {
  languages: LanguagePreference[];
  showContinueInEnglish: boolean;
};

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'ht', name: 'Kreyòl Ayisyen' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'kea', name: 'Kabuverdianu' },
  { code: 'pt', name: 'Português' },
];

const MESSAGES = {
  en: (
    <span>
      If you need to report a non-emergency issue with the City of Boston,
      please call BOS:311 at 311 or{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  es: (
    <span>
      Si necesita reportar un problema que no sea de emergencia a la Ciudad de
      Boston, por favor llame a BOS:311 al 3-1-1 o al{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  'zh-TW': (
    <span>
      向波士頓市府舉報非緊急事項, 請致電 BOS:311辦公室,撥 3-1-1或{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  'zh-CN': (
    <span>
      向波士顿市府举报非紧急事项,请致电BOS:311办公室, 拨 3-1-1 或{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  ht: (
    <span>
      Si’w ta vle repòte yon pwoblem ki pa yon ijans pou Vil Boston an, souple
      rele BOS:311 nan 3-1-1 oswa{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  vi: (
    <span>
      Nếu cần báo cáo vấn đề không khẩn cấp đến thành phố Boston, xin gọi
      BOS:311 tại 3-1-1 hoạc{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  kea: (
    <span>
      Si bu prisiza di kumunika un asuntu ki ê ka di imerjênsia pa Cidadi di
      Boston, pur favor telifona pa BOS:311 pa númeru 3-1-1 ô pa{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
  pt: (
    <span>
      Se você precisa comunicar algum assunto que não é de emergência à Cidade
      de Boston, por favor telefone para BOS:311, para o número 3-1-1 ou para{' '}
      <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
        617-635-4500
      </a>
      .
    </span>
  ),
};

@observer
export default class TranslateDialog extends React.Component<Props> {
  static defaultProps = {
    showContinueInEnglish: false,
  };

  @observable code: string;

  constructor(props: Props) {
    super(props);

    const { languages } = this.props;
    this.code = TranslateDialog.findLanguage(languages) || 'es';
  }

  static findLanguage(languages: LanguagePreference[]): string | null {
    for (let i = 0; i < languages.length; ++i) {
      const lang = languages[i];

      if (lang.region) {
        const key = `${lang.code}-${lang.region}`;
        if (LANGUAGES.find(({ code }) => code === key)) {
          return key;
        }
      }

      if (LANGUAGES.find(({ code }) => code === lang.code)) {
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
        <Head>
          <title>BOS:311 — Translate</title>
        </Head>
        <FormDialog>
          <div className={DIALOG_CONTENTS_STYLE}>
            <div className="g">
              {LANGUAGES.map(({ code, name }) => this.renderButton(code, name))}
            </div>

            <div className="g m-v500 p-a500" style={{ alignItems: 'center' }}>
              <div className="g--3">
                <svg aria-hidden className={TELEPHONE_STYLE}>
                  <use xlinkHref={`${SPRITE_URL}#Phone_off`} height="100%" />
                </svg>
              </div>

              <div className="g--8 t--intro" style={{ fontStyle: 'normal' }}>
                {MESSAGES[this.code]}
              </div>
            </div>

            {showContinueInEnglish && (
              <div
                className={`p-a500 t--info ${CONTINUE_LINK_STYLE.toString()}`}
              >
                <Link href="/request?translate=0" as="/?translate=0">
                  <a>Continue in English</a>
                </Link>
              </div>
            )}
          </div>
        </FormDialog>
      </div>
    );
  }

  renderButton(code: string, title: string) {
    return (
      <div className="g--3 m-v200" key={code}>
        <button
          type="button"
          className={`btn ${code === this.code ? 'btn--c' : ''}`}
          style={{ width: '100%' }}
          onClick={this.setLanguageCode.bind(this, code)}
        >
          {title}
        </button>
      </div>
    );
  }
}
