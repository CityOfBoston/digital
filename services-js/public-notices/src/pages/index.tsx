import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import Notice from '../model/Notice';
import Timer from '../model/Timer';
import NoticeFetcher from '../model/NoticeFetcher';
import NoticeController from '../model/NoticeController';

import PublicNoticesContent from '../components/PublicNoticesContent';

@observer
export default class IndexPage extends React.Component {
  @observable private lastUpdated: Date | null = null;

  private readonly noticeController = new NoticeController(['A', 'B', 'C']);
  private readonly noticeFetcher = new NoticeFetcher({
    callback: this.handleNotices,
  });
  private readonly timer = new Timer({
    durationSeconds: 60,
    callback: this.handlePageTimer,
  });

  constructor(props: {}) {
    super(props);
  }

  componentDidMount() {
    this.noticeFetcher.start();
  }

  componentWillUnmount() {
    this.noticeFetcher.stop();
    this.timer.stop();
  }

  /**
   * Callback for the NoticeFetcher. If this is the first time we’re getting
   * notices, also starts the timer for page updates.
   */
  @action.bound
  private handleNotices(notices: Notice[]) {
    this.noticeController.setNotices(notices);

    if (this.lastUpdated === null) {
      this.timer.start();
    }

    this.lastUpdated = new Date();
  }

  @action.bound
  private handlePageTimer() {
    this.noticeController.advancePages();
  }

  render() {
    const {
      timer,
      noticeController: { notices, noticeColumns },
      lastUpdated,
    } = this;

    return (
      <PublicNoticesContent
        notices={notices}
        noticeColumns={noticeColumns}
        lastUpdated={lastUpdated}
        timer={timer}
      />
    );
  }
}
