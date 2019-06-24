# Internal Slack Bot for the City of Boston

This bot currently handles deployments for the [digital](https://github.com/CityOfBoston/digital) monorepo. Its URL is https://apps.boston.gov.

## Libraries
- [Node SDK](https://github.com/slackapi/node-slack-sdk) _official_
- [Events API](https://github.com/slackapi/node-slack-events-api) _official_
- [Interactive Messages adapter](https://github.com/slackapi/node-slack-interactive-messages) _official_

### Initial setup in Slack
1. Head to https://api.slack.com, and log in as the `digital-dev` user
1. In the upper right of the header, click “Your Apps”
1. Click “Create an App”

#### App
1. Settings => Basic Information
1. Fill out your .env with Client ID, Client Secret, and Signing Secret _(note: this will need to be encrypted for AWS; see [our guide](https://docs.boston.gov/digital/guides/amazon-web-services/service-configuration/encrypting-service-configuration))_

#### Bots
1. Features => Bot Users
1. Create a bot user
1. Features => OAuth and Permissions
1. Copy the (encrypted) Bot OAuth user token to the `SLACK_BOT_TOKEN` .env variable

#### Events (incoming messages from Slack)
1. Features => Event Subscriptions
1. Turn on “Enable Events” - after the first time, click “change” button inside
   the “Request URL” field
1. Paste into “Request URL” field: `[forwarding URL from
   Ngrok]/internal-slack/events` **(if you get a “valid URLs only please!”
   error, make sure there is no whitespace at the beginning of the URL)**
1. Add a "message.im" Bot Event subscription
1. At the bottom of the page, click “Save Changes”

#### Interactive Components (messages with buttons/dialogs/menus i.e. actions)
1. Features => Interactive Components
1. Paste into “Request URL” field: `[forwarding URL from
   Ngrok]/internal-slack/interactions` **(if you get a “valid URLs only please!”
   error, make sure there is no whitespace at the beginning of the URL)**
1. At the bottom of the page, click “Save Changes”

## Development

**Slack Workspace:** https://dev-cityofboston.slack.com

### To run:
1. `npm run tunnel`
1. `npm run dev`
1. Copy forwarding HTTPS URL provided by Ngrok
1. Go to `https://api.slack.com/apps/` and select your app
1. Update all of the URLs for the new ngrok host name

## Slack Guides

### Messages
- [Formatting](https://api.slack.com/docs/message-formatting)
- [Attachments](https://api.slack.com/docs/message-attachments)
- [Interactive Messages field guide](https://api.slack.com/docs/interactive-message-field-guide)

#### Direct message to bot
```
{ type: 'message',
  user: 'UDSQLSFR9',
  text: 'hi',
  client_msg_id: 'ffb35936-3f96-49c9-abcd-b8cfab424c52',
  ts: '1541437175.001300',
  channel: 'DDS6178Q0',
  event_ts: '1541437175.001300',
  channel_type: 'im' }
```

#### Interactive message (i.e. user clicks “Approve deployment”)
```
{ type: 'interactive_message',
  actions:
   [ { name: 'approve_deployment', type: 'button', value: 'approve' } ],
  callback_id: 'approve_deployment',
  team: { id: 'TDU9X9E5U', domain: 'dev-cityofboston' },
  channel: { id: 'CDUJJEHU2', name: 'digital-builds' },
  user: { id: 'UDSQLSFR9', name: 'jessica.marcus' },
  action_ts: '1541437308.618695',
  message_ts: '1541437305.002200',
  attachment_id: '1',
  token: 'HsJ4dgAFACaL6Y2dzzBUKUoQ',
  is_app_unfurl: false,
  original_message:
   { text: '',
     username: 'Frost 9000',
     bot_id: 'BDS61752L',
     attachments: [ [Object] ],
     type: 'message',
     subtype: 'bot_message',
     ts: '1541437305.002200' },
  response_url: 'https://hooks.slack.com/actions/TDU9X9E5U/472314226533/DSJdjaL29rZY8lwAXrt1oPvE',
  trigger_id: '472012823779.470337320198.b6a9063564118120b0b7bb3472399d60' }
```
