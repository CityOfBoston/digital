/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { SectionHeader } from '@cityofboston/react-fleet';
import Section from './Section';
import ListLinksComponent from './list-components/ListLinksComponent';
import { Group } from './types';

interface Props {
  groups: [];
  handleAdminGroupClick: (item: any) => void;
}

/**
 * View for Admin Users with a limited amount of groups they can manage
 * Less than 3
 */
export default function MinGroupDisplay(props: Props) {
  const { groups, handleAdminGroupClick } = props;
  return (
    <>
      <Section>
        <SectionHeader title={`Available Groups (${groups.length})`} />
        <ul css={LIST_STYLING}>
          {groups.map((item: Group) => (
            <ListLinksComponent
              key={`list_key_${item.cn}`}
              handleClick={handleAdminGroupClick}
              item={item}
            />
          ))}
        </ul>
      </Section>
    </>
  );
}

const LIST_STYLING = css({
  textDecoration: 'none',
  padding: '0',
});
