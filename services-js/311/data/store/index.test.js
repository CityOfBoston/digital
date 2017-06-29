// @flow
/* eslint no-underscore-dangle: 0 */

import inBrowser from '../../lib/test/in-browser';
import getStore, { AppStore } from '.';

describe('getStore', () => {
  it('returns the same instance twice in browser', async () => {
    await inBrowser(() => {
      const store = getStore();
      expect(getStore()).toBe(store);
    });
  });

  it('returns different instances on the server', () => {
    const store = getStore();
    expect(getStore()).not.toBe(store);
  });
});

describe('Live Agent', () => {
  const cleanup = () => {
    window.LIVE_AGENT_AVAILABLE = undefined;
    window.liveagent = undefined;
    window._laq = undefined;
  };

  beforeEach(cleanup);
  afterEach(cleanup);

  describe('liveAgentAvailable', () => {
    it('is false if not set on the window', () => {
      expect(new AppStore().liveAgentAvailable).toBe(false);
    });

    it('is true if already set on the window', () => {
      window.LIVE_AGENT_AVAILABLE = true;
      expect(new AppStore().liveAgentAvailable).toBe(true);
    });
  });

  describe('liveAgentButtonId', () => {
    it('is returned after setting', () => {
      const store = new AppStore();
      store.liveAgentButtonId = 'buttonId';
      expect(store.liveAgentButtonId).toEqual('buttonId');
    });

    it('registers if liveagent isn’t available', () => {
      const store = new AppStore();
      store.liveAgentButtonId = 'buttonId';
      expect(window._laq).toHaveLength(1);
    });

    it('listens for button availability', () => {
      window.liveagent = {
        addButtonEventHandler: jest.fn(),
      };

      const store = new AppStore();
      store.liveAgentButtonId = 'buttonId';

      expect(window.liveagent.addButtonEventHandler).toHaveBeenCalledWith(
        'buttonId',
        expect.any(Function)
      );

      const eventHandler =
        window.liveagent.addButtonEventHandler.mock.calls[0][1];

      eventHandler('BUTTON_AVAILABLE');
      expect(store.liveAgentAvailable).toEqual(true);

      eventHandler('OTHER_EVENT');
      expect(store.liveAgentAvailable).toEqual(true);

      eventHandler('BUTTON_UNAVAILABLE');
      expect(store.liveAgentAvailable).toEqual(false);
    });
  });
});
