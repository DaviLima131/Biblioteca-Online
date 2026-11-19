import AuthScreen from './AuthScreen';
import { AuthScreenName } from './types' ;

type Props = {
  onNavigate: (screen: AuthScreenName) => void;
  onSubmit: (
    name: string,
    email: string,
    password: string,
    address: string
  ) => void;
};

export default function RegisterScreen({ onNavigate, onSubmit }: Props) {
  return (
    <AuthScreen mode="register" onNavigate={onNavigate} onSubmit={onSubmit} />
  );
}