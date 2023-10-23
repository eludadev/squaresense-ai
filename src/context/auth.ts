import { createContext } from 'react';

export enum AuthState {
  LOGGEDOUT,
  PENDING,
  DONE,
}

interface AuthContextType {
  isAuthenticating: AuthState;
  toggleAuthenticating: (state: AuthState) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticating: AuthState.LOGGEDOUT,
  toggleAuthenticating: () => {},
});
export default AuthContext;
