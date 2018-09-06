// @flow

import EventEmitter from 'events';
import cometd from 'cometd';
import fetch from 'node-fetch';
import FormData from 'form-data';

export type MetaMessage = {|
  ext?: { [key: string]: string },
  advice?: Object,
  channel: string,
  id: string,
  error?: string,
  successful: boolean,
|};

export type DataMessage<T> = {|
  channel: string,
  data: {
    event: {
      createdDate: string,
      replayId: number,
      type: 'created' | 'updated' | 'deleted',
    },
    sobject: T,
  },
|};

export default class Salesforce extends EventEmitter {
  opbeat: any;
  url: string;
  pushTopic: string;
  consumerKey: string;
  consumerSecret: string;

  lastReplayId: ?number;

  cometd: cometd.CometD;

  constructor(
    url: ?string,
    pushTopic: ?string,
    consumerKey: ?string,
    consumerSecret: ?string,
    opbeat: any
  ) {
    if (!url) {
      throw new Error('Missing Salesforce event URL');
    }

    if (!pushTopic) {
      throw new Error('Missing Salesforce push topic');
    }

    if (!consumerKey) {
      throw new Error('Missing Salesforce consumer key');
    }

    if (!consumerSecret) {
      throw new Error('Missing Salesforce consumer secret');
    }

    super();

    this.opbeat = opbeat;
    this.url = url;
    this.pushTopic = pushTopic;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.lastReplayId = null;

    this.cometd = new cometd.CometD();
  }

  async authenticate(
    oauthUrl: ?string,
    username: ?string,
    password: ?string,
    securityToken: ?string
  ): Promise<string> {
    if (!oauthUrl) {
      throw new Error('Missing Salesforce OAuth endpoint URL');
    }

    if (!username || !password) {
      throw new Error('Missing username and/or secret for Salesforce API user');
    }

    const body = new FormData();
    body.append('grant_type', 'password');
    body.append('client_id', this.consumerKey);
    body.append('client_secret', this.consumerSecret);
    body.append('username', username);
    body.append('password', `${password}${securityToken || ''}`);

    const res = await fetch(oauthUrl, { method: 'POST', body });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        json.error_description || 'Error authenticating to Salesforce'
      );
    } else {
      return json.access_token;
    }
  }

  async connect(
    oauthUrl: ?string,
    username: ?string,
    password: ?string,
    securityToken: ?string,
    lastReplayId: ?number
  ): Promise<string> {
    const sessionId = await this.authenticate(
      oauthUrl,
      username,
      password,
      securityToken
    );

    this.lastReplayId = lastReplayId;

    this.cometd.configure({
      url: this.url,
      appendMessageTypeToURL: false,
      requestHeaders: {
        Authorization: `Bearer ${sessionId}`,
      },
    });

    this.cometd.addListener('/meta/*', (msg: MetaMessage) => {
      this.emit('meta', msg);
    });

    this.cometd.handshake(this.handleHandshake);

    return sessionId;
  }

  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // We need ths check because otherwise disconnect exits without ever
      // calling its handler, so the Promise wouldn’t resolve.
      if (this.cometd.isDisconnected()) {
        resolve();
      } else {
        this.cometd.disconnect((msg: MetaMessage) => {
          if (msg.successful) {
            resolve();
          } else {
            reject(new Error(msg.error));
          }
        });
      }
    });
  }

  handleHandshake = (msg: MetaMessage) => {
    if (msg.successful) {
      const channel = `/topic/${this.pushTopic}`;

      this.cometd.subscribe(
        channel,
        this.handleEvent,
        {
          // If not specified, get all new events sent after subscription and
          // all past events within the last 24 hours
          ext: { replay: { [channel]: this.lastReplayId || -2 } },
        },
        (msg: MetaMessage) => {
          if (msg.successful) {
            this.emit('subscribed');
          } else {
            this.emit('error', new Error(msg.error));
          }
        }
      );
    } else {
      this.emit(
        'error',
        new Error(
          msg.error ||
            (msg.failure && msg.failure.reason) ||
            'Unknown handshake error'
        )
      );
    }
  };

  handleEvent = (msg: DataMessage<*>) => {
    this.emit('event', msg);
    this.lastReplayId = msg.data.event.replayId;
  };
}
