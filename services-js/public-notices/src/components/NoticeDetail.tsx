import React from 'react';
import { css } from 'emotion';
import { observer } from 'mobx-react';

import { FREEDOM_RED } from '@cityofboston/react-fleet';

import NoticeColumn from '../model/NoticeColumn';
import { observable, action } from 'mobx';

type Props = {
  noticeColumn: NoticeColumn;
};

// Copied from Notice.vue and NoticeBody.vue
const NOTICE_STYLE = css`
  & {
    flex: 0.33;
    min-width: 25%;
    background: #ffffff;
    padding: 1.5em;
    display: flex;
    flex-direction: column;
  }

  &:not(:first-child) {
    margin-left: 1em;
  }

  .notice-canceled {
    text-transform: uppercase;
    color: #fb4d42;
  }

  .notice-testimony {
    color: #fb4d42;
    padding: 0.875rem;
    background-color: #f3f3f3;
    font-size: 0.875rem;
    margin-bottom: 0.875rem;
  }

  .notice-title-container {
    border-bottom: 4px solid #091f2f;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .notice-column {
    float: left;
    height: 33px;
    width: 33px;
    border: 2px solid ${FREEDOM_RED};
    color: ${FREEDOM_RED};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    font-family: Montserrat;
    font-weight: bold;
  }

  .notice-title {
    font-size: 1.5625rem;
    line-height: 1.1;
    font-family: Lora;
    font-style: italic;
    overflow: visible;
    word-wrap: normal;
    white-space: normal;
    margin-left: 43px;
    padding-top: 4px;
    min-height: 1.5625rem;
  }

  .notice-title a {
    text-decoration: none;
  }

  .notice-details,
  .notice-detail {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .notice-detail {
    border-bottom: 1px dashed #d2d2d2;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
    display: flex;
  }

  .notice-detail-header {
    width: 30%;
    padding-top: 0.125rem;
    color: #828282;
    font-style: italic;
  }

  .notice-detail-content {
    font-family: Montserrat;
    text-transform: uppercase;
    line-height: 1.4;
  }

  .notice-body-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .notice-body {
    flex: 1;
    overflow: hidden;
  }

  .notice-meta {
    display: flex;
    font-size: 0.75rem;
    margin-top: 0.875rem;
    padding-top: 0.875rem;
    border-top: 1px dashed #d2d2d2;
    color: #828282;
  }

  .notice-pages {
    width: 25%;
  }

  .notice-url {
    width: 75%;
    text-align: right;
    white-space: nowrap;
  }

  .notice-body-list {
    margin: 0;
    padding: 0 0 0 1em;
    font-size: 0.875rem;
  }

  .notice-body-list li {
    margin-left: 0.5rem;
  }

  .notice-body-content {
    transition: transform 0.75s;
  }

  .notice-body .paragraphs-items-field-links {
    margin-bottom: 0.875rem;
  }

  .notice-body li > strong:first-child {
    display: block;
    margin-bottom: 0.25rem;
  }

  .notice-body .detail-item__body > .link-wrapper:before {
    content: '-';
    float: left;
    margin-left: -15px;
  }

  .notice-body .detail-item__body > .link-wrapper {
    margin-left: 15px;
    margin-top: 0.25rem;
  }

  .notice-body p {
    margin: 0 0 0.875rem;
  }
`;

// We add the 25px so there’s a little overlap in the scroll.
const BODY_SCROLL_SLOP = 25;

@observer
/**
 * Renders a notice in one of the three main columns. Updates the NoticeColumn’s
 * pageCount based on how tall the rendered body content is.
 *
 * This is responsive to changes in NoticeColumn#currentPage and scrolls the
 * content appropriately.
 */
export default class NoticeDetail extends React.Component<Props> {
  private readonly bodyRef = React.createRef<HTMLDivElement>();
  private readonly contentRef = React.createRef<HTMLDivElement>();

  @observable private bodyHeight: number = 0;
  @observable private contentHeight: number = 0;

  componentDidMount() {
    this.updateHeights();
  }

  componentDidUpdate() {
    this.updateHeights();
  }

  @action
  private updateHeights() {
    const bodyEl = this.bodyRef.current;
    const contentEl = this.contentRef.current;

    if (bodyEl && contentEl) {
      this.bodyHeight = bodyEl.clientHeight;
      this.contentHeight = contentEl.clientHeight;

      const { noticeColumn } = this.props;
      noticeColumn.setNumPages(
        Math.ceil(this.contentHeight / (this.bodyHeight - BODY_SCROLL_SLOP))
      );
    }
  }

  render() {
    const {
      noticeColumn: { label, notice, currentPage, numPages },
    } = this.props;

    const contentScrollPx =
      (currentPage - 1) * (this.bodyHeight - BODY_SCROLL_SLOP) * -1;

    return (
      <div className={NOTICE_STYLE}>
        <div className="notice-header">
          <div className="notice-title-container">
            <div className="notice-column">
              <span>{label}</span>
            </div>
            <div
              className="notice-title"
              dangerouslySetInnerHTML={{
                __html: notice ? notice.title : '&nbsp;',
              }}
            />
          </div>

          <ul className="notice-details">
            <li className="notice-detail">
              <div className="notice-detail-header">When</div>
              <div className="notice-detail-content">
                {notice &&
                  (notice.canceled === '1' ? (
                    <span className="notice-canceled">Canceled</span>
                  ) : (
                    <>
                      <div
                        dangerouslySetInnerHTML={{ __html: notice.notice_date }}
                      />
                      <div
                        dangerouslySetInnerHTML={{ __html: notice.notice_time }}
                      />
                    </>
                  ))}
              </div>
            </li>

            <li className="notice-detail">
              <div className="notice-detail-header">Where</div>
              <div className="notice-detail-content">
                <div>{notice && notice.location_street}</div>
                <div>{notice && notice.location_room}</div>
              </div>
            </li>

            <li className="notice-detail">
              <div className="notice-detail-header">Posted</div>
              <div className="notice-detail-content">
                <div>{notice && notice.posted}</div>
              </div>
            </li>
          </ul>
        </div>

        {notice &&
          notice.testimony_time === '' && (
            <div className="notice-testimony">
              The public can offer testimony
            </div>
          )}

        {notice && (
          <div className="notice-body-container" key={notice.id}>
            <div className="notice-body" ref={this.bodyRef}>
              <div
                className="notice-body-content"
                ref={this.contentRef}
                style={{
                  transform: `translateY(${Math.min(0, contentScrollPx)}px)`,
                }}
              >
                <div
                  className="notice-body-body"
                  dangerouslySetInnerHTML={{ __html: notice.body }}
                />

                <ol
                  className="notice-body-list"
                  dangerouslySetInnerHTML={{
                    __html: notice.field_drawer.join('\n'),
                  }}
                />
              </div>
            </div>

            <div className="notice-meta">
              <div className="notice-pages">
                {currentPage} of {numPages || '…'}
              </div>
              <div className="notice-url">
                boston.gov/public-notices/{notice && notice.id}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
