import Notice from './Notice';
import NoticeController from './NoticeController';

const NOTICES: Notice[] = require('../../fixtures/notices.json');

const COLUMN_LABELS = ['A', 'B', 'C'];

describe('initialization', () => {
  it('adds new notices to columns', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices(NOTICES);

    expect(controller.notices.length).toEqual(NOTICES.length);
    expect(controller.noticeColumns[0].notice).toEqual(NOTICES[0]);
    expect(controller.noticeColumns[1].notice).toEqual(NOTICES[1]);
    expect(controller.noticeColumns[2].notice).toEqual(NOTICES[2]);
  });

  it('handles when there are fewer notices than columns', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices(NOTICES.slice(0, 2));

    expect(controller.noticeColumns[0].notice).toEqual(NOTICES[0]);
    expect(controller.noticeColumns[1].notice).toEqual(NOTICES[1]);
    expect(controller.noticeColumns[2].notice).toEqual(null);
  });

  it('handles an empty array', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices([]);

    expect(controller.noticeColumns[0].notice).toEqual(null);
    expect(controller.noticeColumns[1].notice).toEqual(null);
    expect(controller.noticeColumns[2].notice).toEqual(null);
  });
});

describe('advancing pages', () => {
  it('advances notices that are at the current page number', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices(NOTICES);

    controller.noticeColumns[0].setNumPages(1);
    controller.noticeColumns[1].setNumPages(2);
    controller.noticeColumns[2].setNumPages(1);

    controller.advancePages();

    // The first and third columns should be advanced to new notices.
    expect(controller.noticeColumns[0].notice).toEqual(NOTICES[3]);
    expect(controller.noticeColumns[2].notice).toEqual(NOTICES[4]);

    // The middle column is on the same notice, but it should have advanced its
    // page number.
    expect(controller.noticeColumns[1].notice).toEqual(NOTICES[1]);
    expect(controller.noticeColumns[1].currentPage).toEqual(2);
  });

  it('keeps things as-is with only 3 notices', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices(NOTICES.slice(0, 3));

    controller.noticeColumns[0].setNumPages(1);
    controller.noticeColumns[1].setNumPages(1);
    controller.noticeColumns[2].setNumPages(2);

    controller.advancePages();

    // Everything should stay as-is
    expect(controller.noticeColumns[0].notice).toEqual(NOTICES[0]);
    expect(controller.noticeColumns[1].notice).toEqual(NOTICES[1]);
    expect(controller.noticeColumns[2].notice).toEqual(NOTICES[2]);

    expect(controller.noticeColumns[2].currentPage).toEqual(2);

    // After advancing again, it goes back to the first page.
    controller.advancePages();
    expect(controller.noticeColumns[2].notice).toEqual(NOTICES[2]);
    expect(controller.noticeColumns[2].currentPage).toEqual(1);
  });

  it('wraps notices around to the top', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices(NOTICES.slice(0, 4));

    controller.noticeColumns[0].setNumPages(1);
    controller.noticeColumns[1].setNumPages(1);
    controller.noticeColumns[2].setNumPages(1);

    controller.advancePages();

    // The first column gets the 4th notice, then the next two columns wrap around
    // to the first and second.
    expect(controller.noticeColumns[0].notice).toEqual(NOTICES[3]);
    expect(controller.noticeColumns[1].notice).toEqual(NOTICES[0]);
    expect(controller.noticeColumns[2].notice).toEqual(NOTICES[1]);
  });
});

describe('updating notices', () => {
  it('handles missing notices', () => {
    const controller = new NoticeController(COLUMN_LABELS);
    controller.setNotices(NOTICES.slice(0, 3));

    controller.noticeColumns[0].setNumPages(1);
    controller.noticeColumns[1].setNumPages(2);
    controller.noticeColumns[2].setNumPages(2);

    controller.setNotices(NOTICES.slice(2, 6));
    controller.advancePages();

    // The first column needs to advance. It should go to the 4th of the original
    // notices.
    expect(controller.noticeColumns[0].notice).toEqual(NOTICES[3]);

    // Even though the second notice still had pages, it should be set to a new
    // notice because its old notice is no longer in the list.
    expect(controller.noticeColumns[1].notice).toEqual(NOTICES[4]);

    // The third column should be showing its same notice, since it’s still in the
    // list.
    expect(controller.noticeColumns[2].notice).toEqual(NOTICES[2]);
  });
});
