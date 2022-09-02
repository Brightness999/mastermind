/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
export const scope = 'routes.forgotpass';

export default ({
  resetYourPassword: {
    id: `${scope}.resetYourPassword`,
    defaultMessage: 'Reset Your Password',
  },
  enterYourEmail: {
    id: `${scope}.enterYourEmail`,
    defaultMessage: 'Enter your user account\'s verified email address and you will receive a new email with code for reset password .',
  },
  send: {
    id: `${scope}.send`,
    defaultMessage: 'Send',
  }
});
