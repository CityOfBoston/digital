import http from 'http';
import EventEmitter from 'events';
import cometd from 'cometd';
import fetch from 'node-fetch';
import FormData from 'form-data';
import HttpsProxyAgent from 'https-proxy-agent';
import Rollbar from 'rollbar';

export interface MetaMessage {
  ext?: { [key: string]: string };
  advice?: any;
  channel: string;
  id: string;
  error?: string;
  successful: boolean;
}

export interface DataMessage<T> {
  channel: string;
  data: {
    event: {
      createdDate: string;
      replayId: number;
      type: 'created' | 'updated' | 'deleted';
    };

    sobject: T;
  };
}

declare module 'cometd' {
  // Handshake messages can also have an error, which isn’t in the cometd types
  // that are available.
  export interface Message {
    channel?: string;
    error?: string;
    failure?: {
      reason: string;
      httpCode: number;
    };
  }
}

export default class Salesforce extends EventEmitter {
  private readonly rollbar: Rollbar;
  private readonly agent: http.Agent | null = null;
  private readonly url: string;
  private readonly pushTopic: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private lastReplayId: number | null = null;
  private cometd: cometd.CometD | null = null;

  constructor(
    rollbar: Rollbar,
    url: string | undefined,
    pushTopic: string | undefined,
    consumerKey: string | undefined,
    consumerSecret: string | undefined
  ) {
    super();

    this.rollbar = rollbar;

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

    this.url = url;
    this.pushTopic = pushTopic;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  public async authenticate(
    oauthUrl: string | undefined,
    username: string | undefined,
    password: string | undefined,
    securityToken: string | undefined
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

    const res = await fetch(oauthUrl, {
      method: 'POST',
      body,
      agent: this.agent ? this.agent : undefined,
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        json.error_description || 'Error authenticating to Salesforce'
      );
    } else {
      return json.access_token;
    }
  }

  public async connect(
    oauthUrl: string | undefined,
    username: string | undefined,
    password: string | undefined,
    securityToken: string | undefined,
    lastReplayId: number | null
  ): Promise<string> {
    this.cometd = new cometd.CometD();

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
      logLevel: 'debug',
      requestHeaders: {
        Authorization: `OAuth ${sessionId}`,
      },
    });

    this.cometd.addListener('/meta/*', msg => {
      this.emit('meta', msg);
    });

    this.cometd.addListener('/meta/unsuccessful', msg => {
      this.rollbar.debug(
        new Error(
          `${msg.channel}: ${msg.error || 'Unsuccessful meta message'}`
        ),
        { cometd: { msg } }
      );
    });

    this.cometd.addListener('/meta/disconnect', () => {
      this.emit('disconnected');
    });

    // Any time we handshake we need to subscribe to channels, including any
    // later re-handshakes that come from reestablishing a connection.
    this.cometd.addListener('/meta/handshake', this.subscribeToChannels);
    this.cometd.handshake(() => {});

    return sessionId;
  }

  public disconnect(): Promise<void> {
    const { cometd } = this;

    if (!cometd) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // We need ths check because otherwise disconnect exits without ever
      // calling its handler, so the Promise wouldn’t resolve.
      if (cometd.isDisconnected()) {
        this.cometd = null;
        resolve();
      } else {
        cometd.disconnect(msg => {
          if (msg.successful) {
            resolve();
          } else {
            reject(new Error(msg.error));
          }
        });
      }
    });
  }

  private readonly subscribeToChannels = (handshakeMsg: cometd.Message) => {
    const { cometd } = this;
    if (!cometd) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log('HANDSHAKE', handshakeMsg);

    if (handshakeMsg.successful) {
      const channel = `/topic/${this.pushTopic}`;

      cometd.subscribe(
        channel,
        this.handleEvent,
        {
          // If not specified, get all new events sent after subscription and
          // all past events within the last 24 hours
          ext: { replay: { [channel]: this.lastReplayId || -2 } },
        },

        (subscribeMsg: cometd.Message) => {
          if (subscribeMsg.successful) {
            this.emit('subscribed');
          } else if (
            subscribeMsg.error &&
            subscribeMsg.error.includes('replayId') &&
            !!this.lastReplayId
          ) {
            // Sometimes Salesforce errors when it doesn't know the replayId, so
            // we retry with -2 to just get everything in the last 24h.
            //
            // TODO(finh): One issue is that the search index still has the
            // erroring replay ID, so if we restart and that is still the max
            // replay ID then we will hit this case again. We could hold the
            // most recent replay ID in separate stable storage and clear it in
            // this case.
            this.lastReplayId = null;
            this.subscribeToChannels(handshakeMsg);
          } else {
            this.emit(
              'error',
              Object.assign(new Error(subscribeMsg.error), {
                cometd: { msg: handshakeMsg },
              })
            );
          }
        }
      );
    } else {
      this.emit(
        'error',
        Object.assign(
          new Error(
            handshakeMsg.error ||
              (handshakeMsg.failure && handshakeMsg.failure.reason) ||
              'Unknown handshake error'
          ),
          { cometd: { msg: handshakeMsg } }
        )
      );
    }
  };

  private readonly handleEvent = (msg: DataMessage<any>) => {
    this.emit('event', msg);
    this.lastReplayId = msg.data.event.replayId;
  };
}
