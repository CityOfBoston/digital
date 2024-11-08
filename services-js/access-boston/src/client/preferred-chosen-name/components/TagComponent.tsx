/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { ReactNode } from 'react';

interface TagComponentProps {
  icon: ReactNode;
  label: string;
}

export function TagComponent({ icon, label }: TagComponentProps) {
  return (
    <label css={TAG_CONTAINER_STYLING}>
      {icon}
      <span css={LABEL_STYLING}>{label}</span>
    </label>
  );
}

const TAG_CONTAINER_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  marginRight: '10%',
  gap: '18px',
});

const LABEL_STYLING = css({
  fontFamily: 'Montserrat',
  fontWeight: 'bold',
  textTransform: 'uppercase',
});

const ICON_STYLING = css({
  width: '32px',
  height: '32px',

  // Hide icon on screens smaller than 600px
  '@media (max-width: 600px)': {
    display: 'none',
  },
});

const NameIcon = (
  <svg css={ICON_STYLING} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#091F2F"/>
  </svg>
);

const EmailAddressIcon = (
  <svg css={ICON_STYLING} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 4H4C2.9 4 2.01 4.9 2 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#1B1B1B"/>
  </svg>
);

export const ChosenNameTag = () => <TagComponent icon={NameIcon} label="Chosen Name" />;
export const CurrentNameTag = () => <TagComponent icon={NameIcon} label="Current Name" />;
export const EmailAddressTag = () => <TagComponent icon={EmailAddressIcon} label="Email Address" />;