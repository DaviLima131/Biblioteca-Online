import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatPrice, type CartItem } from './books';

type Props = {
  cart: CartItem[];
  onBack: () => void;
  onChangeQuantity: (bookId: string, quantity: number) => void;
  onContinue: () => void;
};

export default function CartScreen({
  cart,
  onBack,
  onChangeQuantity,
  onContinue,
}: Props) {
  const total = cart.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a biblioteca"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Meu carrinho</Text>
          <View style={styles.headerSpacer} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}></Text>
            <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
            <Text style={styles.emptyDescription}>
              Explore a biblioteca e adicione um livro para continuar.
            </Text>
            <Pressable
              onPress={onBack}
              style={styles.primaryButton}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Explorar livros</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {itemCount} {itemCount === 1 ? 'livro' : 'livros'}
            </Text>

            {cart.map(({ book, quantity }) => (
              <View key={book.id} style={styles.itemCard}>
                <View
                  style={[
                    styles.bookCover,
                    { backgroundColor: book.coverColor },
                  ]}
                >
                  {book.imageUri ? (
                    <Image
                      source={{ uri: book.imageUri }}
                      style={styles.bookCoverImage}
                      resizeMode="cover"
                      accessibilityLabel={`Capa de ${book.title}`}
                    />
                  ) : (
                    <Text style={styles.bookEmoji}>{book.emoji}</Text>
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {book.author}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(book.price * quantity)}
                  </Text>
                  <View style={styles.quantityControls}>
                    <Pressable
                      onPress={() =>
                        onChangeQuantity(book.id, quantity - 1)
                      }
                      style={styles.quantityButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Diminuir quantidade de ${book.title}`}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.quantity}>{quantity}</Text>
                    <Pressable
                      onPress={() =>
                        onChangeQuantity(book.id, quantity + 1)
                      }
                      style={styles.quantityButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Aumentar quantidade de ${book.title}`}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onChangeQuantity(book.id, 0)}
                      style={styles.removeButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${book.title} do carrinho`}
                    >
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total do pedido</Text>
              <Text style={styles.total}>{formatPrice(total)}</Text>
              <Text style={styles.demoNote}>
                Pedido demonstrativo, sem cobrança.
              </Text>
            </View>

            <Pressable
              onPress={onContinue}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Escolher forma de pagamento
              </Text>
            </Pressable>
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
    marginBottom: 27,
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
  sectionTitle: {
    color: '#29271F',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 17,
    padding: 13,
    marginBottom: 12,
  },
  bookCover: {
    width: 75,
    height: 100,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bookCoverImage: {
    width: '100%',
    height: '100%',
  },
  bookEmoji: {
    fontSize: 30,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'center',
  },
  bookTitle: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '800',
  },
  bookAuthor: {
    color: '#817D72',
    fontSize: 11,
    marginTop: 4,
  },
  itemPrice: {
    color: '#29271F',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },
  quantityButton: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#FFF4D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#55441C',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  quantity: {
    color: '#29271F',
    fontSize: 13,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 'auto',
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: '#93634D',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 17,
    padding: 17,
    marginTop: 8,
    marginBottom: 14,
  },
  summaryLabel: {
    color: '#817D72',
    fontSize: 12,
  },
  total: {
    color: '#29271F',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 5,
  },
  demoNote: {
    color: '#938B7A',
    fontSize: 11,
    marginTop: 5,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#F1C43F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 20,
    padding: 24,
    marginTop: 35,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 13,
  },
  emptyTitle: {
    color: '#29271F',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#817D72',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
