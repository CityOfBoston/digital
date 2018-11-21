import { observable, action } from 'mobx';

declare global {
  interface Window {
    LIVE_AGENT_AVAILABLE?: boolean;
    _laq?: Array<Function>;

    liveagent?: {
      // Must be called before window.load event
      init: (chatUrl: string, orgId: string, deploymentId: string) => void;

      // Only works on buttonId that has also been registered with showWhenOnline/showWhenOffline
      addButtonEventHandler: (
        buttonId: string,
        callback: (eventType: string) => void
      ) => void;

      // These two must be called before init
      showWhenOnline: (buttonId: string, el: HTMLElement) => void;
      showWhenOffline: (buttonId: string, el: HTMLElement) => void;

      startChat: (buttonId: string) => void;
      addCustomDetail: (
        name: string,
        value: string,
        showToAgent?: boolean
      ) => void;
    };
  }
}

/**
 * Service to manage Salesforce’s LiveAgent external JavaScript.
 */
export default class LiveAgent {
  @observable
  liveAgentAvailable: boolean = !!(
    typeof window !== 'undefined' && window.LIVE_AGENT_AVAILABLE
  );

  _liveAgentButtonId: string = '';

  get liveAgentButtonId(): string {
    return this._liveAgentButtonId;
  }

  set liveAgentButtonId(liveAgentButtonId: string) {
    this._liveAgentButtonId = liveAgentButtonId;

    if (typeof window !== 'undefined') {
      if (window.liveagent) {
        this.listenForLiveAgentEvents(liveAgentButtonId);
      } else {
        if (!window._laq) {
          window._laq = [];
        }

        window._laq.push(() =>
          this.listenForLiveAgentEvents(liveAgentButtonId)
        );
      }
    }
  }

  listenForLiveAgentEvents(liveAgentButtonId: string) {
    window.liveagent!.addButtonEventHandler(
      liveAgentButtonId,
      this.liveAgentEventHandler
    );
  }

  @action.bound
  liveAgentEventHandler(event: string) {
    switch (event) {
      case 'BUTTON_AVAILABLE':
        this.liveAgentAvailable = true;
        break;
      case 'BUTTON_UNAVAILABLE':
        this.liveAgentAvailable = false;
        break;
      default:
        break;
    }
  }
}
