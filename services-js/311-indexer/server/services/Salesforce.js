// @flow

import EventEmitter from 'events';
import cometd from 'cometd';
import fetch from 'node-fetch';
import FormData from 'form-data';

type MetaMessage = {|
  ext?: { [key: string]: string },
  advice?: Object,
  channel: string,
  id: string,
  error?: string,
  successful: boolean,
|};

type DataMessage<T> = {|
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

export default class Salesforce<T> extends EventEmitter {
  opbeat: any;
  url: string;
  pushTopic: string;
  consumerKey: string;
  consumerSecret: string;

  lastReplayId: number;

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
    // Get all new events sent after subscription and all past events within the last 24 hours
    this.lastReplayId = -2;

    this.cometd = new cometd.CometD();
  }

  async authenticate(
    oauthUrl: string,
    username: string,
    password: string
  ): Promise<string> {
    const body = new FormData();
    body.append('grant_type', 'password');
    body.append('client_id', this.consumerKey);
    body.append('client_secret', this.consumerSecret);
    body.append('username', username);
    body.append('password', password);

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
    password: ?string
  ): Promise<void> {
    if (!oauthUrl) {
      throw new Error('Missing Salesforce OAuth endpoint URL');
    }

    if (!username || !password) {
      throw new Error('Missing username and/or secret for Salesforce API user');
    }

    const sessionId = await this.authenticate(oauthUrl, username, password);

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
  }

  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cometd.disconnect((msg: MetaMessage) => {
        if (msg.successful) {
          resolve();
        } else {
          reject(new Error(msg.error));
        }
      });
    });
  }

  handleHandshake = (msg: MetaMessage) => {
    if (msg.successful) {
      const channel = `/topic/${this.pushTopic}`;

      this.cometd.subscribe(
        channel,
        this.handleEvent,
        {
          ext: { replay: { [channel]: this.lastReplayId } },
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

  handleEvent = (msg: DataMessage<T>) => {
    this.emit('event', msg.data);
    this.lastReplayId = msg.data.event.replayId;
  };
}
