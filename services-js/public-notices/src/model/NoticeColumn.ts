import { observable, action } from 'mobx';
import Notice from './Notice';

export default class NoticeColumn {
  public readonly label: string;

  @observable public notice: Notice | null;
  @observable public numPages: number | null;
  @observable public currentPage: number;

  constructor(label: string, notice: Notice | null = null) {
    this.label = label;
    this.notice = notice;

    this.numPages = null;
    this.currentPage = 1;
  }

  @action
  setNotice(notice: Notice | null) {
    this.notice = notice;
    this.currentPage = 1;
    this.numPages = null;
  }

  @action
  /**
   * This method is called by NoticeDetail after it renders the notice and can
   * tell how many pages of content it has.
   */
  setNumPages(numPages: number) {
    this.numPages = numPages;
  }
}
