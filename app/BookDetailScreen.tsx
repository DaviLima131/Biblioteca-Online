
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Book } from './books';
import { formatPrice } from './books';

type Props = {
  book: Book;
  isAdmin: boolean;
  onBack: () => void;
  onAddToCart: (book: Book) => void;
  onEdit: () => void;
};

export default function BookDetailScreen({
  book,
  isAdmin,
  onBack,
  onAddToCart,
  onEdit,
}: Props) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Detalhes do livro</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Capa do livro */}
        <View
          style={[
            styles.cover,
            { backgroundColor: book.coverColor },
          ]}
        >
          {book.imageUri ? (
            <Image
              source={{ uri: book.imageUri }}
              style={styles.coverImage}
              resizeMode="cover"
              accessibilityLabel={`Capa de ${book.title}`}
            />
          ) : (
            <View style={styles.coverDecoration}>
              <Text style={styles.coverEmoji}>
                {book.emoji}
              </Text>

              <View style={styles.coverLine} />

              <Text style={styles.coverTitle}>
                {book.title}
              </Text>

              <Text style={styles.coverAuthor}>
                {book.author}
              </Text>
            </View>
          )}
        </View>

        {/* Categoria */}
        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {book.category.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.editionText}>
            BIBLI-ON
          </Text>
        </View>

        {/* Informações principais */}
        <Text style={styles.title}>
          {book.title}
        </Text>

        <Text style={styles.author}>
          Escrito por {book.author}
        </Text>

        <View style={styles.divider} />

        {/* Descrição */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>
            Sobre este livro
          </Text>

          <Text style={styles.description}>
            {book.description}
          </Text>
        </View>

        {/* Card informativo */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoEmoji}>📚</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Sua próxima leitura começa aqui!
            </Text>

            <Text style={styles.infoDescription}>
              Descubra novas histórias, personagens e
              experiências através da leitura.
            </Text>
          </View>
        </View>

        {/* Preço */}
        <View style={styles.purchaseCard}>
          <View style={styles.priceContent}>
            <Text style={styles.priceLabel}>
              VALOR DO LIVRO
            </Text>

            <Text style={styles.price}>
              {formatPrice(book.price)}
            </Text>

            <Text style={styles.priceNote}>
              Compra demonstrativa, sem cobrança.
            </Text>
          </View>

          <View style={styles.purchaseIcon}>
            <Text style={styles.purchaseEmoji}>
              {book.emoji}
            </Text>
          </View>
        </View>

        {/* Botão de edição */}
        {isAdmin && (
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onEdit}
          >
            <Text style={styles.editIcon}>✎</Text>

            <Text style={styles.editButtonText}>
              Editar informações do livro
            </Text>
          </Pressable>
        )}

        {/* Adicionar ao carrinho */}
        <Pressable
          style={({ pressed }) => [
            styles.buyButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => onAddToCart(book)}
        >
          <Text style={styles.buyButtonText}>
            Adicionar ao carrinho
          </Text>

          <Text style={styles.cartIcon}>🛒</Text>
        </Pressable>

        {/* Voltar */}
        <Pressable
          style={({ pressed }) => [
            styles.backToLibraryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onBack}
        >
          <Text style={styles.backToLibraryText}>
            ←  Voltar para a biblioteca
          </Text>
        </Pressable>

        {/* Rodapé */}
        <Text style={styles.footer}>
          BIBLI-ON · Histórias que aproximam.
        </Text>

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
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 40,
  },

  // Cabeçalho
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE6D4',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#29271F',
  },

  headerSpacer: {
    width: 44,
  },

  // Capa
  cover: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    padding: 17,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  coverDecoration: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(70, 60, 35, 0.18)',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  coverImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  coverEmoji: {
    fontSize: 65,
    marginVertical: 14,
  },

  coverLine: {
    width: 48,
    height: 3,
    borderRadius: 5,
    backgroundColor: '#9D7B28',
    marginBottom: 15,
  },

  coverTitle: {
    color: '#29271F',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 30,
  },

  coverAuthor: {
    color: '#685F4B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },

  // Categoria
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  categoryBadge: {
    backgroundColor: '#F8E7A7',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  categoryText: {
    color: '#725719',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  editionText: {
    color: '#A69C87',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // Título
  title: {
    color: '#29271F',
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 37,
  },

  author: {
    color: '#898374',
    fontSize: 14,
    marginTop: 9,
  },

  divider: {
    height: 1,
    backgroundColor: '#EAE2D1',
    marginVertical: 27,
  },

  // Descrição
  descriptionSection: {
    marginBottom: 5,
  },

  sectionTitle: {
    color: '#29271F',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 13,
  },

  description: {
    color: '#696456',
    fontSize: 14,
    lineHeight: 25,
  },

  // Card informativo
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E8D8',
    borderRadius: 19,
    padding: 17,
    marginTop: 25,
    marginBottom: 25,
  },

  infoIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: '#FFF1C4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoEmoji: {
    fontSize: 23,
  },

  infoContent: {
    flex: 1,
    marginLeft: 14,
  },

  infoTitle: {
    color: '#29271F',
    fontSize: 13,
    fontWeight: '900',
  },

  infoDescription: {
    color: '#817D72',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  // Preço
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 19,
  },

  priceContent: {
    flex: 1,
  },

  priceLabel: {
    color: '#938B7A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  price: {
    color: '#29271F',
    fontSize: 29,
    fontWeight: '900',
    marginTop: 8,
  },

  priceNote: {
    color: '#938B7A',
    fontSize: 10,
    marginTop: 6,
  },

  purchaseIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#FFF2C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  purchaseEmoji: {
    fontSize: 28,
  },

  // Botão editar
  editButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#29271F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  editIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    marginRight: 9,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Carrinho
  buyButton: {
    minHeight: 57,
    borderRadius: 16,
    backgroundColor: '#F1C43F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },

  buyButtonText: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '900',
  },

  cartIcon: {
    fontSize: 17,
    marginLeft: 10,
  },

  // Voltar para biblioteca
  backToLibraryButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE3D0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },

  backToLibraryText: {
    color: '#514B3E',
    fontSize: 13,
    fontWeight: '800',
  },

  // Efeitos
  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Rodapé
  footer: {
    color: '#A69C87',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
    fontWeight: '600',
  },
});
