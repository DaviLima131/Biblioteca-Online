export type AuthMode = 'login' | 'register';

export type AuthScreenName = AuthMode | 'home';
export type AppScreenName =
  | AuthScreenName
  | 'bookDetail'
  | 'adminBook'
  | 'cart'
  | 'checkout';