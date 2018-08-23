import { css } from 'emotion';

export const HEADER_HEIGHT = 47;

const MAIN_STYLE = css({
  // accommodates our thinner-than-Boston.gov header
  paddingTop: HEADER_HEIGHT,
});

export const MAIN_CLASS = `mn ${MAIN_STYLE}`;
