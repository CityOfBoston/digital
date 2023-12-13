/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { SectionHeader } from '@cityofboston/react-fleet';
import Section from './Section';
import ListLinksComponent from './list-components/ListLinksComponent';
import { Group, Person } from './types';
import { fetchGroupMembers } from './data-fetching/fetch-person-data';

interface Props {
  groups: [];
  handleAdminGroupClick: (item: any) => void;
  pageSize: number;
  dispatchList?: any;
  changePageCount: (pageCount: number) => void;
}

/**
 * View for Admin Users with a limited amount of groups they can manage
 * Less than 3
 */
export default function MinGroupDisplay(props: Props) {
  const { groups, changePageCount } = props;
  const handleClick = async (item: Group) => {
    const dataFetched = (members: Person[]) => {
      item['groupmember'] = members;
      changePageCount(members.length);
      props.handleAdminGroupClick(item);
      props.dispatchList({
        type: 'LIST/LOAD_LIST',
        list: item.groupmember[0],
      });
    };
    await fetchGroupMembers(item.dn, props.pageSize).then(result =>
      dataFetched(result)
    );
  };
  return (
    <>
      <Section>
        <SectionHeader title={`Available Groups (${groups.length})`} />
        <ul css={LIST_STYLING}>
          {groups.map((item: Group) => (
            <ListLinksComponent
              key={`list_key_${item.cn}`}
              handleClick={() => handleClick(item)}
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
