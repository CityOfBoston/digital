// Makes symlinks to the main CSS and JS files that don't have hashes. The S3
// uploading script can use these to generate redirects.

const path = require('path');
const shelljs = require('shelljs');

shelljs.ls('-R', 'build/**/main.*.*').forEach(f => {
  const match = path.basename(f).match(/^main\.(\w*)\.(\w*)$/);
  if (match) {
    const newPath = path.join(path.dirname(f), `main.${match[2]}`);
    shelljs.ln('-sf', path.basename(f), newPath);
  }
});
