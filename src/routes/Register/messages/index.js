import { scope as loginScope } from '../../Sign/Login/messages'
export const scope = 'routes.Register';

export default ({
  titleSignUp: {
    id: `${scope}.titleSignUp`,
    defaultMessage: 'Sign Up To Admin Panel',
  },
  email: {
    id: `${scope}.email`,
    defaultMessage: 'Email',
  },
  messageEmail: {
    id: `${scope}.messageEmail`,
    defaultMessage: 'Please enter your email address.',
  },
  messageEmailFormat: {
    id: `${scope}.messageEmailFormat`,
    defaultMessage: 'Incorrect email address format.',
  },
  firstName: {
    id: `${scope}.firstName`,
    defaultMessage: 'First Name',
  },
  messageFirstName: {
    id: `${scope}.messageFirstName`,
    defaultMessage: 'Please enter your first name.',
  },
  lastName: {
    id: `${scope}.lastName`,
    defaultMessage: 'Last Name',
  },
  messageLastName: {
    id: `${scope}.messageLastName`,
    defaultMessage: 'Please enter your last name.',
  },
  gender: {
    id: `${scope}.gender`,
    defaultMessage: 'Gender',
  },
  messageGender: {
    id: `${scope}.messageGender`,
    defaultMessage: 'Please enter your gender.',
  },
  birthday: {
    id: `${scope}.birthday`,
    defaultMessage: 'Birthday',
  },
  messageBirthday: {
    id: `${scope}.messageBirthday`,
    defaultMessage: 'Please enter your birthday.',
  },
  phoneNumber: {
    id: `${scope}.phoneNumber`,
    defaultMessage: 'Phone Number',
  },
  messagePhoneNumber: {
    id: `${scope}.messagePhoneNumber`,
    defaultMessage: 'Please enter your phone number.',
  },
  signUp: {
    id: `${scope}.signUp`,
    defaultMessage: 'Sign Up',
  },
  LoginNow: {
    id: `${scope}.LoginNow`,
    defaultMessage: 'Sign in with an existing account',
  },
  enterPassword: {
    id: `${scope}.enterPassword`,
    defaultMessage: 'Please enter your password!',
  },
  passwordsTwice: {
    id: `${scope}.passwordsTwice`,
    defaultMessage: 'The passwords entered twice do not match!',
  },
  viewMailbox: {
    id: `${scope}.viewMailbox`,
    defaultMessage: 'View mailbox',
  },
  backToHome: {
    id: `${scope}.backToHome`,
    defaultMessage: 'Back to home',
  },
  registrationSuccess: {
    id: `${scope}.registrationSuccess`,
    defaultMessage: 'registration success',
  },
  textRegister: {
    id: `${scope}.textRegister`,
    defaultMessage: 'The activation email has been sent to your email address and is valid for 24 hours. Please log in to the email in time and click on the link in the email to activate the account.',
  },
  title: {
    id: `${loginScope}.title`,
    defaultMessage: 'Welcome to Admin Panel',
  },
  description: {
    id: `${loginScope}.description`,
    defaultMessage: 'This complimentary, straightforward and simple to use administration management tool effortlessly empowers you to manage user privileges and access to products.',
  },
  username: {
    id: `${loginScope}.username`,
    defaultMessage: 'Username',
  },
  messageUsername: {
    id: `${loginScope}.messageUsername`,
    defaultMessage: 'Please enter your username.',
  },
  password: {
    id: `${loginScope}.password`,
    defaultMessage: 'Password',
  },
  passwordMessage: {
    id: `${loginScope}.passwordMessage`,
    defaultMessage: 'Please enter your password.',
  },
  passwordConfirm: {
    id: `${loginScope}.passwordConfirm`,
    defaultMessage: 'Confirm Password',
  },
  passwordConfirmMess: {
    id: `${loginScope}.passwordConfirmMess`,
    defaultMessage: 'Please enter your confirm password.',
  },
});
