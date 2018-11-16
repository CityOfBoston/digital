/*
We use a script to write the makeCss output to preview-head.html to
mimic how _document gets CSS into the main document. Previous uses of
<Head> to do this failed because the order of the glamor CSS was different,
which affected styles.
*/

import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import makeCss from '../lib/make-css';
import { ReactElement } from 'react';

const additionalCss = `
  body, html {
    background-color: #eee;
  }
`;

const headElements = makeCss({ additionalCss })
  .filter(el => !!el)
  .map(el => ReactDOMServer.renderToString(el as ReactElement<unknown>));
fs.writeFileSync(
  path.join(__dirname, '..', '.storybook', 'preview-head.html'),
  headElements.join('\n')
);
