export default {
  assetPath: 'assets/ping/assets',
  name: 'name',
  username: 'city-person',
  pass: 'pass',
  newPass1: 'newPass2',
  newPass2: 'newPass1',
  PingFedBaseURL: '/',
  forgotPasswordUrl: '/',
  changePasswordUrl: '/',
  enableRememberUsername: false,
  rememberUsernameCookieExists: false,
  enableCheckboxByDefault: false,
  rememberUsernameChecked: 'checked',
  usernameEditable: false,
  supportsPasswordChange: false,
  supportsPasswordReset: false,
  registrationEnabled: false,
  templateMessages: {
    strings: {
      title: 'Page Title',
      usernameTitle: 'Username',
      passwordTitle: 'Password',
      newPassword1Title: 'New Password',
      newPassword2Title: 'Confirm Password',
      missingField: 'Please fill out this field',
      rememberUsernameTitle: 'Remember Username',
      signInButtonTitle: 'Sign In',
      changeButtonTitle: 'Change Password',
      cancelButtonTitle: 'Cancel',
      changePassword: 'Change Password',
      forgotPassword: 'Forgot Password',
      noAccountMessage: 'No Account',
      registerAccount: 'Register Account',
      loginWithButtonTitle: 'Login',
      info: 'You have now been logged out.',
      headerMessage: 'Change Password',
    },
    getMessage: function(_prefix, message) {
      return this.strings[message];
    },
  },
  locale: {
    getLanguage: () => 'en',
  },
  orientation: 'ltr',
  url: '',
  authnMessageKey: '',
  errorMessageKey: '',
  serverError: '',
  altAuthSources: {
    authSource: [],
    size: () => 0,
  },
  loginFailed: false,
  adapterIdField: 'adapterId Field',
  adapterId: 'adapterId',
  localizedMessageResolver: {
    strings: {
      locale: 'en',
    },
    resolveMessage: function(_locale, message) {
      if (message === 'pa.error.contact.system.administrator') {
        return 'No known federation session to logout or SLO is not configured';
      }
      return message;
    },
  },
  Encode: {
    forHtml: parameters => parameters,
  },
  title: 'Sign Off Error',
  lang: 'en',
};
