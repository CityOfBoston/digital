/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { Group, Mode, Person } from './types';

import Section from './Section';
import Icon from './Icon';

interface Props {
  mode: Mode;
  selected: Group | Person;
}

export default function SelectedComponent(props: Props) {
  const {
    mode,
    //@ts-ignore
    selected: { cn, displayName, mail },
  } = props;

  const displayText = displayName || cn;

  return (
    <Section isGray>
      <div css={LAYOUT_STYLING}>
        <Icon type={mode} size="small" />

        <div>
          <h1 className="sh-title">
            {displayText} {mode === 'group' && 'group'}
          </h1>

          {mode === 'person' && mail && (
            <address>
              <a href={`mailto:${mail}`}>{mail}</a>
            </address>
          )}
        </div>
      </div>
    </Section>
  );
}

const LAYOUT_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  '> div': {
    marginLeft: '1rem',
  },
});
