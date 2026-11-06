
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { AuthMode, AuthScreenName } from './types';
import './App';

type Props = {
  mode: AuthMode;
  onNavigate: (screen: AuthScreenName) => void;
  onSubmit: (name: string, password: string) => void;
};

export default function AuthScreen({
  mode,
  onNavigate,
  onSubmit,
}: Props) {
  const isRegister = mode === 'register';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    const normalizedName = name.trim();

    if (!normalizedName || !password.trim()) {
      Alert.alert('Atenção', 'Preencha o nome e a senha.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Senha muito curta',
        'A senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (isRegister && !confirmPassword.trim()) {
      Alert.alert('Atenção', 'Confirme sua senha.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'As senhas digitadas não são iguais.'
      );
      return;
    }

    onSubmit(normalizedName, password);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.brand}>
          <Image
            source={require('../assets/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="Logo da Biblioteca Online"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            {isRegister
              ? 'Crie sua conta'
              : 'Bem-vindo de volta'}
          </Text>

          <Text style={styles.subtitle}>
            {isRegister
              ? 'Cadastre-se para descobrir um mundo de leitura.'
              : 'Entre para continuar sua jornada de leitura.'}
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#A6A39B"
              autoCapitalize="words"
              autoComplete="off"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#A6A39B"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="off"
              value={password}
              onChangeText={setPassword}
              returnKeyType={isRegister ? 'next' : 'done'}
              onSubmitEditing={
                isRegister ? undefined : handleSubmit
              }
            />
            <Text style={styles.helperText}>
              A senha deve ter pelo menos 6 caracteres.
            </Text>
          </View>

          {isRegister && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar senha</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite sua senha novamente"
                placeholderTextColor="#A6A39B"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="off"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.submitText}>
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Text>
          </Pressable>

          <Text style={styles.switchPrompt}>
            {isRegister
              ? 'Já tem uma conta? '
              : 'Ainda não tem uma conta? '}

            <Text
              style={styles.switchLink}
              onPress={() =>
                onNavigate(isRegister ? 'login' : 'register')
              }
            >
              {isRegister ? 'Fazer login' : 'Cadastrar-se'}
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9E9',
  },
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 240,
    height: 190,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 27,
    borderWidth: 1,
    borderColor: '#F2EBD9',
    elevation: 5,
  },
  title: {
    color: '#29271F',
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: '#817D72',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 23,
  },
  fieldGroup: {
    marginBottom: 17,
  },
  label: {
    color: '#454237',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperText: {
    color: '#817D72',
    fontSize: 11,
    marginTop: 6,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    borderRadius: 11,
    paddingHorizontal: 14,
    color: '#29271F',
    backgroundColor: '#FFFEFC',
    fontSize: 14,
  },
  submitButton: {
    minHeight: 51,
    backgroundColor: '#F1C43F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonPressed: {
    backgroundColor: '#EABD34',
    opacity: 0.9,
  },
  submitText: {
    color: '#302817',
    fontSize: 15,
    fontWeight: '800',
  },
  switchPrompt: {
    color: '#817D72',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 22,
  },
  switchLink: {
    color: '#98771D',
    fontWeight: '800',
  },
});
