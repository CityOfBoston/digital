import LiveAgent from './LiveAgent';

describe('Live Agent', () => {
  const cleanup = () => {
    delete window.LIVE_AGENT_AVAILABLE;
    delete window.liveagent;
    delete window._laq;
  };

  beforeEach(cleanup);
  afterEach(cleanup);

  describe('liveAgentAvailable', () => {
    it('is false if not set on the window', () => {
      expect(new LiveAgent().liveAgentAvailable).toBe(false);
    });

    it('is true if already set on the window', () => {
      window.LIVE_AGENT_AVAILABLE = true;
      expect(new LiveAgent().liveAgentAvailable).toBe(true);
    });
  });

  describe('liveAgentButtonId', () => {
    it('is returned after setting', () => {
      const liveAgent = new LiveAgent();
      liveAgent.liveAgentButtonId = 'buttonId';
      expect(liveAgent.liveAgentButtonId).toEqual('buttonId');
    });

    it('registers if liveagent isn’t available', () => {
      const liveAgent = new LiveAgent();
      liveAgent.liveAgentButtonId = 'buttonId';
      expect(window._laq).toHaveLength(1);
    });

    it('listens for button availability', () => {
      const liveagent = {
        addButtonEventHandler: jest.fn(),
      };
      window.liveagent = liveagent as any;

      const liveAgent = new LiveAgent();
      liveAgent.liveAgentButtonId = 'buttonId';

      expect(window.liveagent!.addButtonEventHandler).toHaveBeenCalledWith(
        'buttonId',
        expect.any(Function)
      );

      const eventHandler = liveagent.addButtonEventHandler.mock.calls[0][1];

      eventHandler('BUTTON_AVAILABLE');
      expect(liveAgent.liveAgentAvailable).toEqual(true);

      eventHandler('OTHER_EVENT');
      expect(liveAgent.liveAgentAvailable).toEqual(true);

      eventHandler('BUTTON_UNAVAILABLE');
      expect(liveAgent.liveAgentAvailable).toEqual(false);
    });
  });
});
