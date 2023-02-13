# Technical Implementations

## Rollbar
Rollbar is an error-logging service we use through our web apps to view and debug errors in real-time. The implementation is pretty easy and supports a large number of languages. There are two types of implementations for Rollbar, `browser` and `server`.

### General Needs
Implementing Rollbar generally requires the inclusion of the respective rollbar module (browser/server) and then initializing the rollbar object with account credentials.

- Access Token
- Browser Token
- Environment (Staging/Production)
- Payload (data to be analyzed)

#### Browser Setup [DOC](https://docs.rollbar.com/docs/browser-js)
Browser implementation tracks a user's actions through the Application/Webpage (DOM) and reports a significant amount of steps before the error occurs; displaying the output (DOM/text) the user sees when the error is triggered. In our WebApps we include the rollbar in the module that constructs the page's HTML structure, ie. `services-js/[service-name]/pages/_document.tsx`. A browser implementation looks like this:

```html
<script>
var _rollbarConfig = {
    accessToken: "POST_CLIENT_ITEM_ACCESS_TOKEN",
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        environment: "production",
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: "${rollbarVersion || buildId}",
            }
        },
    }
};
// Rollbar Snippet
// .... code
// End Rollbar Snippet
</script>
```

#### Server Setup [DOC](https://docs.rollbar.com/docs/nodejs)

```javascript
import Rollbar from 'rollbar';
const Rollbar = require('rollbar');
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  },
});

try {
  someCode();
} catch (e) {
  rollbar.error(e);
}
```

Our code base abstracts the server (Hapi.js) implementation on a top layer module at `modules-js/hapi-common/src/hapi-common.ts`, here it expands the reporting tool to handle 404 errors as well among other things. Although reporting an error only requires the error message/payload, `rollbar.error(error)` going forward we should be more verbose in the errors we log; `rollbar.error(e, request.raw.req)`

##### Ex.
```javascript
// Server Code
server.route({
  method: 'POST',
  path: '/stripe',
  handler: async request => {
    try {
      someCode();
    } catch (e) {
      rollbar.error(e, request.raw.req);
      throw e;
    }
  },
});
```

#### Server Usage
```javascript
// if you have a request object (or a function that returns one), pass it in
rollbar.error(e, request);

// pass a request and a callback
rollbar.error(e, request, callback);

// you can also pass a callback
rollbar.error(e, request, {level: "info"}, callback);
```

#### Single Page Application (SPA)
Our web apps are `Single Page Apps`, SPAs, meaning that it all runs off of the same front-end code even when the URL subpage and parameters change. Since we include Rollbar at the top of the Application it is available through the browser's `window` DOM object or by including it as a module in specific sections. DOM `window` is sufficient for our needs so the example below covers how to raise an error from within the app.

```javascript
try {
  someCode();
} catch(e) {
  if ((window as any).rollbar) {
    (window as any).rollbar.error(e);
  }
}
```

### PHP and Drupal
Rollbar has an implementation for PHP, like others it's straightforward to implement, but it is missing a documented implementation for Drupal. There is a Rollbar module on [Drupal.org](https://www.drupal.org/project/rollbar) that is installed with `composer` but this will require more insight/research.

#### PHP Implementation

In `Composer`
```json
{
    "require": {
        "rollbar/rollbar": "^3"
    }
}
```

#### Setup
```php
<?php
use Rollbar\Rollbar;

$config = array(
    // required
    'access_token' => 'POST_SERVER_ITEM_ACCESS_TOKEN',
    // optional - environment name. any string will do.
    'environment' => 'production',
    // optional - directory path your code is in. used for linking stack traces.
    'root' => '/Users/brian/www/myapp'
    // optional - the code version. e.g. git commit SHA or release tag
    'code_version' => '27f47021038a159c5aa9bbb9f98ce47e55914404'
);
Rollbar::init($config);
```

#### Send an Error and a Message
```php
<?php
use Rollbar\Rollbar;
use Rollbar\Payload\Level;

// installs global error and exception handlers
Rollbar::init(
    array(
        'access_token' => ROLLBAR_TEST_TOKEN,
        'environment' => 'production',
        'code_version' => '1.0.0'
    )
);

try {
    throw new \Exception('test exception');
} catch (\Exception $e) {
    Rollbar::log(Level::ERROR, $e);
}

// Message at level 'info'
Rollbar::log(Level::INFO, 'testing info level')
```

### Set up your Rollbar account, configure projects
Above we went through how to set up Rollbar in the codebase, however, we also need to set up a project for each implementation in the Rollbar dashboard.

1. Login into the account
2. Create New Project
3. Invite team members
4. Setup Notifications - Determine if you are using Slack or email, etc
5. Integrate with Source Control Provider - We have a couple of apps (DBConnector) that are hosted in AWS, for this we'll need to set it up using this [doc](https://tpalmer.medium.com/rollbar-deployment-updates-from-aws-codepipeline-de4ead283cea)
6. Setup Versions and Deploy controls - Setup a way to notify Rollbar of an AWS deployment (Lambda)
