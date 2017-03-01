// @flow
/* eslint react/no-danger: 0 */

import React from 'react';

import stylesheetHrefs from '../templates/stylesheets.json';

export default function makeCssHead(Head: Class<React.Component<*, *, *>>, css: ?string) {
  return (
    <Head>
      {
        stylesheetHrefs.map((href) => (
          <link href={href} key={href} type="text/css" rel="stylesheet" />
        ))
      }

      { css && <style type="text/css" dangerouslySetInnerHTML={{ __html: css }} /> }
    </Head>
  );
}
