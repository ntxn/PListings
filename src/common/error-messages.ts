export enum ErrMsg {
  NameRequired = 'Please enter your name',
  EmailRequired = 'Please enter your email address',
  EmailInvalid = 'Please enter a valid email address',
  PasswordRequired = 'Please enter your password',
  PasswordMinLength = 'Password requirement: minium 8 characters',
  PasswordConfirmRequired = 'Please confirm your password',
  PasswordConfirmNotMatch = 'Password confirmation does not match',
  BioMaxLength = 'Your biography should be less than 150 characters',
  DuplicateKey = 'MongoDB Duplicate Key Error',
  JwtInvalid = 'Invalid token. Please log in again',
  JwtExpired = 'Your token has expired. Please log in again',
}
