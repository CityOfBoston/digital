import { observable, action } from 'mobx';

declare global {
  interface Window {
    /** Set by the setup script. */
    LIVE_AGENT_AVAILABLE?: boolean;

    /**
     * The LiveAgent code automatically executes every function in this array
     * when it loads.
     */
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
  private readonly liveAgentButtonId: string = '';

  @observable
  public liveAgentAvailable: boolean = !!(
    typeof window !== 'undefined' && window.LIVE_AGENT_AVAILABLE
  );

  /**
   * Include this in _document.tsx to put the LiveAgent loading script in place
   * and to add the configuration we need to interact with it.
   */
  public static SetupScript(props: {
    scriptUrl: string;
    buttonId: string;
    chatUrl: string;
    orgId: string;
    deploymentId: string;
  }): JSX.Element {
    return (
      <>
        <script src={process.env.LIVE_AGENT_SCRIPT_SRC} />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof liveagent === 'undefined') {
                  return;
                }

                var buttonId = "${props.buttonId}";
                // We need to make a fake "showWhenOnline" in order to get
                // button events from the server. All of the app showing/hiding
                // is done though addButtonEventHandler because Live Agent does
                // not support adding new buttons after init is called, which
                // runs against what we need in a single-page app.
                liveagent.showWhenOnline(buttonId, document.createElement('DIV'));
                liveagent.addButtonEventHandler(buttonId, function(event) {
                  window.LIVE_AGENT_AVAILABLE = event === 'BUTTON_AVAILABLE';
                });
                liveagent.init(
                  "${props.chatUrl}",
                  "${props.orgId}",
                  "${props.deploymentId}");
              })();
            `,
          }}
        />
      </>
    );
  }

  constructor(liveAgentButtonId: string) {
    this.liveAgentButtonId = liveAgentButtonId;
  }

  public attach() {
    if (!window._laq) {
      window._laq = [];
    }

    if (window.liveagent) {
      this.listenForLiveAgentEvents();
    } else {
      window._laq.push(() => this.listenForLiveAgentEvents());
    }
  }

  private listenForLiveAgentEvents() {
    window.liveagent!.addButtonEventHandler(
      this.liveAgentButtonId,
      this.liveAgentEventHandler
    );
  }

  @action.bound
  private liveAgentEventHandler(event: string) {
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

  public startChat() {
    window.liveagent!.startChat(this.liveAgentButtonId);
  }
}
