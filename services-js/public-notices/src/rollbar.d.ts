import Rollbar from 'rollbar';

declare global {
  interface Window {
    Rollbar: Rollbar | undefined;
  }
}
