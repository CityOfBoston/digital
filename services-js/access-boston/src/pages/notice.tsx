/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ReactNode } from 'react';

import { BannerIcon, NOTICE_WRAPPER } from './gen-components';

export interface NoticeBannerProps {
  children: ReactNode;
  type?: 'info' | 'warn' | 'error' | 'success' | undefined;
  classString?: string;
}

/**
 * @name NoticeBanner
 * @description Notice Banner Elem
 */
export const NoticeBanner = (props: NoticeBannerProps) => {
  const { children, type, classString } = props;

  const notice_type = type ? type : 'info';
  const noticeBgClassName = `bg__${notice_type}`;
  const barnnerElem = (type?: 'info' | 'warn' | 'error' | 'success') => {
    const typeVal = type ? type : notice_type;
    return <BannerIcon type={typeVal} />;
  };

  return (
    <div css={NOTICE_WRAPPER}>
      <div className={noticeBgClassName}>
        <div className="b-c">
          <div className="g">
            <div className="g p-v300">
              <div
                className={`banner-copy-wrapper ${
                  classString ? classString : ''
                }`}
              >
                <div className="banner__icon-col">{barnnerElem()}</div>
                <div className="banner__copy-col">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBanner;
