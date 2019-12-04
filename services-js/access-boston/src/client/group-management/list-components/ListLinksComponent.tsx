/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import {
  GRAY_000,
  // BLACK,
  OPTIMISTIC_BLUE_DARK,
} from '@cityofboston/react-fleet';
import { LIST_ITEM_STYLING } from './styling';

interface Props {
  item: any;
  handleClick: (item: any) => void;
}

/**
 * A ListItem represents a group, or an person. If editable, it will also
 * have a checkbox. Checkbox may be disabled via canModify prop.
 */
export default function ListLinksComponent(props: Props) {
  const {
    handleClick,
    item: { cn, displayName },
    item,
  } = props;

  const displayText = displayName || cn;
  const clickHandler = () => handleClick(item);

  return (
    <li css={[LIST_ITEM_STYLING, REVIEW_LIST_ITEM_STYLING]}>
      <label css={LIST_LINK_STYLING} onClick={clickHandler}>
        <span css={LIST_LINK_SPAN_STYLING}>{displayText}</span>
      </label>
    </li>
  );
}

const LIST_LINK_SPAN_STYLING = css({
  cursor: 'pointer',
});

const LIST_LINK_STYLING = css({
  color: OPTIMISTIC_BLUE_DARK,
});

const REVIEW_LIST_ITEM_STYLING = css({
  backgroundColor: GRAY_000,
});
