// @flow
/* eslint no-console: 0 */

/*
This script pulls the generic template from boston.gov and extracts parts of
it to be included in the webapp.

In particular, it gets the contents of the <header> and <footer> elements,
the .main-navigation <div>, and any stylesheet <link> hrefs from <head>.

It does not copy the class names from these wrapper elements, and those are
duplicated in the _document.js component.
*/
import path from 'path';

import fs from 'fs-extra';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

const TEMPLATE_URL = 'https://boston.gov/api/v1/layouts/app';

(async function fetchTemplates(enableTranslate) {
  const templatesPath = path.join(__dirname, '../templates');
  fs.mkdirsSync(templatesPath);

  const res = await fetch(TEMPLATE_URL);

  if (!res.ok) {
    throw new Error(`Response from boston.gov was not 200: ${res.status}`);
  }

  const templateHtml = await res.text();
  const $ = cheerio.load(templateHtml);

  $('a, img, form').each((_, el) => {
    const $el = $(el);

    // We need to absolutize all URLs, and also strip the cache-busting attribute.
    ['href', 'src', 'action'].forEach(attr => {
      let url = $el.attr(attr);

      if (!url) {
        return;
      }

      if (!url.match(/^(https?|mailto):/)) {
        if (!url.startsWith('/')) {
          url = `/${url}`;
        }
        url = `https://www.boston.gov${url}`;
      } else if (url.startsWith('mailto')) {
        // TODO(finh): text onClick is a bit jank
        $el.attr(
          'onClick',
          'document.getElementById("contactForm").show(); return false;'
        );
      }

      url = url.replace(/\?k=.*/, '');
      $el.attr(attr, url);
    });
  });

  // Hand-restore the Translate link because we're not shipping the JS to
  // do the auto-translate
  if (enableTranslate) {
    const $translateItem = $('header>nav li.nv-h-l-i.tr');
    $translateItem.removeClass('tr');
    $translateItem.find('ul').remove();
    $translateItem
      .find('a')
      .attr('href', '/translate')
      .removeClass('nv-h-l-a--k--s tr-link');
  }

  ['header', 'footer'].forEach(tag => {
    const html = $(tag).html();
    if (!html) {
      throw new Error(`<${tag}> not found in html: ${templateHtml}`);
    }
    fs.writeFileSync(path.join(templatesPath, `${tag}.html`), html);
  });

  const navigationHtml = $('nav.nv-m').html();
  fs.writeFileSync(path.join(templatesPath, 'navigation.html'), navigationHtml);

  const stylesheetHrefs = $('link[rel=stylesheet]')
    .toArray()
    .map(el => $(el).attr('href'))
    .map(url => url.replace(/\?k=.*/, ''));

  fs.writeFileSync(
    path.join(templatesPath, 'stylesheets.json'),
    JSON.stringify(stylesheetHrefs, null, 2)
  );
})(false).catch(e => {
  console.error('ERROR GETTING TEMPLATES', e);
  process.exit(1);
});
