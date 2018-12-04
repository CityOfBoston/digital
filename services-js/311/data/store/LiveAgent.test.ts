import LiveAgent from './LiveAgent';

const FAKE_BUTTON_ID = '573r00000004COf';

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
      expect(new LiveAgent(FAKE_BUTTON_ID).liveAgentAvailable).toBe(false);
    });

    it('is true if already set on the window', () => {
      window.LIVE_AGENT_AVAILABLE = true;
      expect(new LiveAgent(FAKE_BUTTON_ID).liveAgentAvailable).toBe(true);
    });
  });

  describe('attach', () => {
    it('registers if liveagent isn’t available', () => {
      const liveAgent = new LiveAgent(FAKE_BUTTON_ID);
      liveAgent.attach();
      expect(window._laq).toHaveLength(1);
    });

    it('listens for button availability', () => {
      const liveagent = {
        addButtonEventHandler: jest.fn(),
      };
      window.liveagent = liveagent as any;

      const liveAgent = new LiveAgent(FAKE_BUTTON_ID);
      liveAgent.attach();

      expect(window.liveagent!.addButtonEventHandler).toHaveBeenCalledWith(
        FAKE_BUTTON_ID,
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
