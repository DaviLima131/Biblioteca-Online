
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
import { bookCategories, type Book } from './books';
import type { AuthScreenName } from './types';

type Props = {
  userName: string;
  catalog: Book[];
  isAdmin: boolean;
  cartItemCount: number;
  onNavigate: (screen: AuthScreenName) => void;
  onOpenCart: () => void;
  onSelectBook: (book: Book) => void;
  onOpenAdmin: () => void;
  onDeleteBook: (bookId: string) => void;
};

export default function HomeScreen({
  userName,
  catalog,
  isAdmin,
  cartItemCount,
  onNavigate,
  onOpenCart,
  onSelectBook,
  onOpenAdmin,
  onDeleteBook,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const categories = [
    'Todos',
    ...new Set([...bookCategories, ...catalog.map((book) => book.category)]),
  ];

  const filteredBooks = catalog.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todos' ||
      book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Image
              source={require('../assets/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessible
              accessibilityLabel="Logo da Biblioteca Online"
            />
            <Text style={styles.tagline}>
              histórias que aproximam
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.cartButton}
              onPress={onOpenCart}
              accessibilityRole="button"
              accessibilityLabel={`Abrir carrinho, ${cartItemCount} itens`}
            >
              <Text style={styles.cartButtonText}>
                Carrinho{cartItemCount > 0 ? ` (${cartItemCount})` : ''}
              </Text>
            </Pressable>
            <Pressable
              style={styles.logoutButton}
              onPress={() =>
                Alert.alert('Sair da conta', 'Deseja voltar ao login?', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Sair',
                    onPress: () => onNavigate('login'),
                  },
                ])
              }
            >
              <Text style={styles.logoutText}>Sair</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.greeting}>
            Olá, {userName || 'leitor'}!
          </Text>
          <Text style={styles.subtitle}>
            Que tal descobrir uma nova história hoje?
          </Text>
        </View>

        {isAdmin && (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenAdmin}
            style={styles.adminButton}
          >
            <Text style={styles.adminButtonText}>＋ Publicar um livro</Text>
          </Pressable>
        )}

        <TextInput
          style={styles.search}
          placeholder="  Buscar livros ou autores..."
          placeholderTextColor="#938B7A"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        <View style={styles.featured}>
          <Text style={styles.featuredLabel}>
            SEU PRÓXIMO CAPÍTULO
          </Text>
          <Text style={styles.featuredTitle}>
            Um mundo de histórias espera por você.
          </Text>
          <Text style={styles.featuredDescription}>
            Explore novos universos e encontre sua próxima leitura.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Explore por categoria</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.category,
                  active && styles.categoryActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Livros para descobrir
          </Text>
          <Text style={styles.bookCount}>
            {filteredBooks.length} livros
          </Text>
        </View>

        {filteredBooks.length === 0 ? (
          <Text style={styles.empty}>
            Nenhum livro encontrado. Tente outra pesquisa.
          </Text>
        ) : (
          filteredBooks.map((book) => (
            <View key={book.id} style={styles.bookCard}>
              <Pressable
                style={styles.bookCardContent}
                onPress={() => onSelectBook(book)}
                accessibilityRole="button"
                accessibilityLabel={`Conhecer ${book.title}`}
              >
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

                <View style={styles.bookInfo}>
                  <Text style={styles.bookCategory}>
                    {book.category.toUpperCase()}
                  </Text>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>{book.author}</Text>
                  <Text style={styles.bookAction}>
                    Conhecer livro →
                  </Text>
                </View>
              </Pressable>

              {isAdmin && (
                pendingDeleteId === book.id ? (
                  <View style={styles.deleteConfirmation}>
                    <Text style={styles.deleteConfirmationText}>
                      Excluir “{book.title}” do catálogo?
                    </Text>
                    <View style={styles.deleteConfirmationActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setPendingDeleteId(null)}
                        style={styles.cancelDeleteButton}
                      >
                        <Text style={styles.cancelDeleteText}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          const hasOtherBooksInCategory = catalog.some(
                            (item) =>
                              item.id !== book.id &&
                              item.category === book.category
                          );

                          if (
                            selectedCategory === book.category &&
                            !hasOtherBooksInCategory
                          ) {
                            setSelectedCategory('Todos');
                          }

                          onDeleteBook(book.id);
                          setPendingDeleteId(null);
                        }}
                        style={styles.confirmDeleteButton}
                      >
                        <Text style={styles.confirmDeleteText}>Excluir</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir ${book.title}`}
                    onPress={() => setPendingDeleteId(book.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Excluir livro</Text>
                  </Pressable>
                )
              )}
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Biblioteca Online · Histórias que aproximam.
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
    padding: 22,
    paddingTop: 45,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 110,
    height: 85,
  },
  tagline: {
    fontSize: 11,
    color: '#817B69',
    marginTop: 3,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#E8DFC9',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  cartButton: {
    borderWidth: 1,
    borderColor: '#E8DFC9',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  cartButtonText: {
    color: '#66552A',
    fontWeight: '700',
  },
  logoutText: {
    color: '#66552A',
    fontWeight: '700',
  },
  welcome: {
    marginBottom: 20,
  },
  adminButton: {
    backgroundColor: '#29271F',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 17,
    marginBottom: 19,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  greeting: {
    fontSize: 27,
    fontWeight: '800',
    color: '#29271F',
  },
  subtitle: {
    marginTop: 7,
    color: '#817D72',
    fontSize: 14,
    lineHeight: 21,
  },
  search: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE3D4',
    borderRadius: 14,
    paddingHorizontal: 15,
    color: '#29271F',
    fontSize: 14,
    marginBottom: 23,
  },
  featured: {
    backgroundColor: '#F1C43F',
    borderRadius: 20,
    padding: 22,
    marginBottom: 29,
    overflow: 'hidden',
  },
  featuredLabel: {
    color: '#695016',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: '#302817',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
    marginTop: 13,
    maxWidth: 260,
  },
  featuredDescription: {
    color: '#5E4D27',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    maxWidth: 260,
  },
  featuredEmoji: {
    fontSize: 29,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#29271F',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 15,
  },
  categories: {
    gap: 9,
    paddingBottom: 25,
  },
  category: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  categoryActive: {
    backgroundColor: '#29271F',
    borderColor: '#29271F',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#625D51',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookCount: {
    color: '#817D72',
    fontSize: 12,
    marginBottom: 15,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F0E9DA',
    marginBottom: 12,
  },
  bookCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#E8C9C4',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#A33A2B',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteConfirmation: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0E9DA',
  },
  deleteConfirmationText: {
    color: '#454237',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteConfirmationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    marginTop: 10,
  },
  cancelDeleteButton: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelDeleteText: {
    color: '#625D51',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmDeleteButton: {
    backgroundColor: '#A33A2B',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bookCover: {
    width: 88,
    height: 112,
    borderRadius: 11,
    backgroundColor: '#FFF0C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookEmoji: {
    fontSize: 36,
  },
  bookCoverImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 11,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 15,
  },
  bookCategory: {
    color: '#9A791F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  bookTitle: {
    color: '#29271F',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 7,
  },
  bookAuthor: {
    color: '#817D72',
    fontSize: 11,
    marginTop: 5,
  },
  bookAction: {
    color: '#98771D',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 13,
  },
  empty: {
    color: '#817D72',
    fontSize: 14,
    paddingVertical: 20,
  },
  footer: {
    textAlign: 'center',
    color: '#938B7A',
    fontSize: 11,
    marginTop: 25,
  },
});
