// @flow

/*
This script pulls the generic template from boston.gov and extracts parts of
it to be included in the webapp.

In particular, it gets the contents of the <header> and <footer> elements,
the .main-navigation <div>, and any stylesheet <link> hrefs from <head>.

It does not copy the class names from these wrapper elements, and those are
duplicated in the _document.js component.
*/

import gutil from 'gulp-util';
import cheerio from 'cheerio';
import through from 'through2';

import 'isomorphic-fetch';

type Options = {
  url: string,
  enableTranslate?: boolean,
};

async function fetchTemplates({ url, enableTranslate }: Options, push) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Response from boston.gov was not 200: ${res.status}`);
  }

  const templateHtml = await res.text();
  const $ = cheerio.load(templateHtml);

  $('a, img').each((i, el) => {
    const $el = $(el);

    // We need to absolutize all URLs, and also strip the cache-busting attribute.
    ['href', 'src'].forEach(attr => {
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

    push(
      new gutil.File({
        path: `${tag}.html`,
        contents: new Buffer(html),
      })
    );
  });

  const navigationHtml = $('nav.nv-m').html();
  push(
    new gutil.File({
      path: 'navigation.html',
      contents: new Buffer(navigationHtml),
    })
  );

  const stylesheetHrefs = $('link[rel=stylesheet]')
    .map((i, el) => $(el).attr('href'))
    .toArray()
    .map(url => url.replace(/\?k=.*/, ''));
  push(
    new gutil.File({
      path: 'stylesheets.json',
      contents: new Buffer(JSON.stringify(stylesheetHrefs, null, 2)),
    })
  );
}

module.exports = (opts: Options) => {
  const stream = through.obj();

  fetchTemplates(opts, f => stream.push(f)).then(
    () => {
      stream.emit('end');
    },
    err => {
      process.nextTick(() => stream.emit('error', err));
    }
  );

  return stream;
};
