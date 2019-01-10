import { observable, action } from 'mobx';

import Notice from './Notice';
import NoticeColumn from './NoticeColumn';

/**
 * Stores a list of notices and handles both assigning them to columns and
 * incrementing their current pages.
 */
export default class NoticeController {
  @observable public notices: Notice[] = [];
  @observable public readonly noticeColumns: NoticeColumn[];

  /**
   * Keeps track of the most recent notice ID we’ve added to a column.
   */
  private lastNoticeId: string | null = null;
  private nextNotices: Notice[] | null = null;

  public constructor(columnLabels: string[]) {
    this.noticeColumns = columnLabels.map(label => new NoticeColumn(label));
  }

  /**
   * Updates the list of notices. If there are no current notices, immediately
   * assigns them to columns. Otherwise, queues them until the next call to
   * advancePages so that the screen all updates at once.
   */
  public setNotices(notices: Notice[]) {
    this.nextNotices = notices;

    if (this.notices.length === 0) {
      this.advancePages();
    }
  }

  @action
  public advancePages() {
    if (this.nextNotices) {
      this.notices = this.nextNotices;
      this.nextNotices = null;
    }

    this.noticeColumns.forEach(c => {
      // We need a new notice if there isn’t an existing one, the existing one
      // is no longer in the list, or we’ve reached the last page of the
      // existing one. We also do a safety check to see if numPages is null,
      // meaning the UI never updated it.
      if (
        !c.notice ||
        !this.notices.find(n => n.id === c.notice!.id) ||
        c.numPages === null ||
        c.currentPage === c.numPages
      ) {
        // If we can’t find a new notice, keep the old one.
        c.setNotice(this.findNextNotice() || c.notice);
      } else {
        c.currentPage++;
      }
    });
  }

  /**
   * Return the next notice that should be highlighted in a column. Will return
   * null if all notices are currently being displayed in columns.
   */
  private findNextNotice(): Notice | null {
    const visibleNoticeIds = this.noticeColumns.map(
      c => c.notice && c.notice.id
    );

    const lastNoticeIdx = this.notices.findIndex(
      n => n.id === this.lastNoticeId
    );

    // Loop to find the next available notice to show. We use a loop because we
    // need to keep searching until we find a notice that’s not currently in any
    // of the columns.
    //
    // We start at 1 to be one more than the most recently shown notice. This
    // also means that if the last notice was not found in the current list,
    // lastNoticeIdx will be -1 so adding this 1 will wrap things around to 0,
    // which is where we want to start.
    for (let i = 1; i <= this.notices.length; ++i) {
      const nextNoticeIdx = (lastNoticeIdx + i) % this.notices.length;
      const notice = this.notices[nextNoticeIdx];

      // We make sure we’re not returning a notice that’s already used in an
      // existing column.
      if (notice && visibleNoticeIds.indexOf(notice.id) === -1) {
        this.lastNoticeId = notice.id;
        return notice;
      }
    }

    return null;
  }
}
