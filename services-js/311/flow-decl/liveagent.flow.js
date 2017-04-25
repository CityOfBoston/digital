// @flow
declare var liveagent: {
  // Must be called before window.load event
  init: (chatUrl: string, orgId: string, deploymentId: string) => void,

  // Only works on buttonId that has also been registered with showWhenOnline/showWhenOffline
  addButtonEventHandler: (buttonId: string, callback: (eventType: string) => void) => void,

  // These two must be called before init
  showWhenOnline: (buttonId: string, el: HTMLElement) => void,
  showWhenOffline: (buttonId: string, el: HTMLElement) => void,

  startChat: (buttonId: string) => void,
};
