
import AuthScreen from './AuthScreen';
import type { AuthScreenName } from './types';

type Props = {
  onNavigate: (screen: AuthScreenName) => void;
  onSubmit: (name: string, password: string) => void;
};

export default function LoginScreen({
  onNavigate,
  onSubmit,
}: Props) {
  return (
    <AuthScreen
      mode="login"
      onNavigate={onNavigate}
      onSubmit={onSubmit}
    />
  );
}
