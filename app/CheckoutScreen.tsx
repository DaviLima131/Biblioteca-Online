import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { formatPrice, type CartItem } from './books';

type PaymentMethod = 'Pix' | 'Cartão de débito' | 'Cartão de crédito';

const paymentMethods: PaymentMethod[] = [
  'Pix',
  'Cartão de débito',
  'Cartão de crédito',
];

type Props = {
  cart: CartItem[];
  onBack: () => void;
  onComplete: () => void;
};

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  secureTextEntry,
  autoCapitalize = 'none',
}: InputFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A6A39B"
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

function pixField(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function createDemoPixPayload(amount: number) {
  const merchantAccount =
    pixField('00', 'BR.GOV.BCB.PIX') +
    pixField('01', 'demo@bibliotecaonline.invalid');
  const additionalData = pixField('05', 'DEMO');
  const data =
    pixField('00', '01') +
    pixField('01', '11') +
    pixField('26', merchantAccount) +
    pixField('52', '0000') +
    pixField('53', '986') +
    pixField('54', amount.toFixed(2)) +
    pixField('58', 'BR') +
    pixField('59', 'BIBLIOTECA ONLINE DEMO') +
    pixField('60', 'SAO PAULO') +
    pixField('62', additionalData);
  const crcInput = `${data}6304`;
  let crc = 0xffff;

  for (let index = 0; index < crcInput.length; index += 1) {
    crc ^= crcInput.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc =
        crc & 0x8000
          ? ((crc << 1) ^ 0x1021) & 0xffff
          : (crc << 1) & 0xffff;
    }
  }

  return `${crcInput}${crc.toString(16).toUpperCase().padStart(4, '0')}`;
}

function formatCardNumber(value: string) {
  return value.match(/.{1,4}/g)?.join(' ') ?? '';
}

export default function CheckoutScreen({
  cart,
  onBack,
  onComplete,
}: Props) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod | null>(null);
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const total = cart.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const pixPayload = createDemoPixPayload(total);

  const handleConfirm = () => {
    if (!selectedMethod) {
      return;
    }

    if (selectedMethod !== 'Pix') {
      const month = Number(expiration.slice(0, 2));
      const cardDigits = cardNumber.replace(/\D/g, '');
      const codeIsValid = /^\d{3,4}$/.test(securityCode);

      if (
        !cardholder.trim() ||
        cardDigits.length !== 16 ||
        !/^\d{2}\/\d{2}$/.test(expiration) ||
        month < 1 ||
        month > 12 ||
        !codeIsValid
      ) {
        setError('Confira os dados do cartão para continuar.');
        return;
      }
    }

    setError('');
    setCardholder('');
    setCardNumber('');
    setExpiration('');
    setSecurityCode('');
    setOrderConfirmed(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o carrinho"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Pagamento</Text>
          <View style={styles.headerSpacer} />
        </View>

        {orderConfirmed ? (
          <View style={styles.confirmationCard} accessibilityRole="summary">
            <Text style={styles.confirmationEmoji}>✓</Text>
            <Text style={styles.confirmationTitle}>Pedido registrado!</Text>
            <Text style={styles.confirmationText}>
              Forma escolhida: {selectedMethod}. Esta é uma confirmação
              demonstrativa. Nenhum pagamento foi realizado.
            </Text>
            <Pressable
              onPress={onComplete}
              style={styles.primaryButton}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Voltar para a biblioteca
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Resumo do pedido</Text>
              {cart.map(({ book, quantity }) => (
                <View key={book.id} style={styles.summaryLine}>
                  <Text style={styles.summaryItem} numberOfLines={1}>
                    {book.title} × {quantity}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    {formatPrice(book.price * quantity)}
                  </Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryLine}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>{formatPrice(total)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Forma de pagamento</Text>
            <Text style={styles.description}>
              Selecione uma opção para ver os dados de pagamento.
            </Text>

            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method;

              return (
                <Pressable
                  key={method}
                  onPress={() => {
                    setSelectedMethod(method);
                    setError('');
                  }}
                  style={[
                    styles.paymentOption,
                    isSelected && styles.paymentOptionSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Selecionar ${method}`}
                >
                  <View>
                    <Text style={styles.paymentTitle}>{method}</Text>
                    <Text style={styles.paymentDescription}>
                      {method === 'Pix'
                        ? 'QR Code demonstrativo'
                        : 'Dados do cartão demonstrativos'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
              );
            })}

            {selectedMethod === 'Pix' && (
              <View style={styles.paymentDetails}>
                <Text style={styles.detailsTitle}>Pague com Pix</Text>
                <Text style={styles.detailsDescription}>
                  Escaneie o QR Code demonstrativo abaixo.
                </Text>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={pixPayload}
                    size={208}
                    color="#29271F"
                    backgroundColor="#FFFFFF"
                    ecl="M"
                  />
                </View>
                <Text style={styles.qrDisclaimer}>
                  QR Code de exemplo, não pagável. Para receber pagamentos,
                  conecte uma chave Pix válida a um provedor de pagamentos.
                </Text>
              </View>
            )}

            {(selectedMethod === 'Cartão de débito' ||
              selectedMethod === 'Cartão de crédito') && (
              <View style={styles.paymentDetails}>
                <Text style={styles.detailsTitle}>
                  Dados do {selectedMethod.toLowerCase()}
                </Text>
                <Text style={styles.detailsDescription}>
                  Use apenas dados fictícios nesta demonstração.
                </Text>
                <InputField
                  label="Nome no cartão"
                  value={cardholder}
                  onChangeText={setCardholder}
                  placeholder="Como aparece no cartão"
                  autoCapitalize="words"
                />
                <InputField
                  label="Número do cartão"
                  value={formatCardNumber(cardNumber)}
                  onChangeText={(value) =>
                    setCardNumber(value.replace(/\D/g, '').slice(0, 16))
                  }
                  placeholder="0000 0000 0000 0000"
                  keyboardType="number-pad"
                  maxLength={19}
                />
                <View style={styles.cardRow}>
                  <View style={styles.cardRowField}>
                    <InputField
                      label="Validade"
                      value={expiration}
                      onChangeText={(value) => {
                        const digits = value.replace(/\D/g, '').slice(0, 4);
                        setExpiration(
                          digits.length > 2
                            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                            : digits
                        );
                      }}
                      placeholder="MM/AA"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.cardRowField}>
                    <InputField
                      label="CVV"
                      value={securityCode}
                      onChangeText={(value) =>
                        setSecurityCode(value.replace(/\D/g, '').slice(0, 4))
                      }
                      placeholder="123"
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
                <Text style={styles.cardDisclaimer}>
                  Os dados são usados somente nesta tela e apagados ao
                  confirmar. Nenhuma cobrança será feita.
                </Text>
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleConfirm}
              disabled={!selectedMethod}
              style={({ pressed }) => [
                styles.primaryButton,
                !selectedMethod && styles.primaryButtonDisabled,
                pressed && selectedMethod && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !selectedMethod }}
            >
              <Text style={styles.primaryButtonText}>
                {selectedMethod
                  ? 'Confirmar pedido demonstrativo'
                  : 'Escolha uma forma de pagamento'}
              </Text>
            </Pressable>
            <Text style={styles.footerNote}>
              Ambiente de demonstração: nenhum dado será enviado ou cobrado.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9E9',
  },
  content: {
    padding: 22,
    paddingTop: 48,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE5D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#29271F',
    fontSize: 34,
    lineHeight: 38,
    marginTop: -4,
  },
  headerTitle: {
    color: '#29271F',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 43,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 17,
    padding: 17,
    marginBottom: 23,
  },
  summaryLabel: {
    color: '#817D72',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  summaryItem: {
    color: '#625D51',
    fontSize: 12,
    flex: 1,
    marginRight: 10,
  },
  summaryPrice: {
    color: '#625D51',
    fontSize: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEE8DA',
    marginTop: 13,
  },
  totalLabel: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '800',
  },
  total: {
    color: '#29271F',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#29271F',
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: '#817D72',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 12,
  },
  paymentOption: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: '#98771D',
    backgroundColor: '#FFFCF2',
  },
  paymentTitle: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '700',
  },
  paymentDescription: {
    color: '#817D72',
    fontSize: 11,
    marginTop: 4,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: '#B8B1A2',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#98771D',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#98771D',
  },
  paymentDetails: {
    backgroundColor: '#FFFCF5',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 17,
    padding: 17,
    marginTop: 10,
    marginBottom: 16,
  },
  detailsTitle: {
    color: '#29271F',
    fontSize: 16,
    fontWeight: '800',
  },
  detailsDescription: {
    color: '#817D72',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 15,
  },
  qrContainer: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 7,
  },
  qrDisclaimer: {
    color: '#817D72',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 9,
  },
  fieldGroup: {
    marginBottom: 13,
  },
  fieldLabel: {
    color: '#625D51',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE3D4',
    borderRadius: 12,
    paddingHorizontal: 13,
    color: '#29271F',
    fontSize: 14,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardRowField: {
    flex: 1,
  },
  cardDisclaimer: {
    color: '#817D72',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 1,
  },
  errorText: {
    color: '#A73E32',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#F1C43F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#E8E2D4',
  },
  primaryButtonText: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  footerNote: {
    color: '#938B7A',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 12,
  },
  confirmationCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 20,
    padding: 23,
    marginTop: 28,
  },
  confirmationEmoji: {
    width: 48,
    height: 48,
    overflow: 'hidden',
    backgroundColor: '#EAF3E4',
    borderRadius: 24,
    color: '#38532E',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 48,
    textAlign: 'center',
  },
  confirmationTitle: {
    color: '#29271F',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 13,
  },
  confirmationText: {
    color: '#696456',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 13,
  },
  pressed: {
    opacity: 0.8,
  },
});
