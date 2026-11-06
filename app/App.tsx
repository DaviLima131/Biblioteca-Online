
import { useState } from 'react';
import { Alert } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import BookDetailScreen from './BookDetailScreen';
import AdminBookScreen from './AdminBookScreen';
import {
  books as initialBooks,
  type Book,
  type CartItem,
  type NewBook,
} from './books';
import type { AppScreenName, AuthScreenName } from './types';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import './LoginScreen';

const DEMO_ADMIN_NAME = 'admin';
const DEMO_ADMIN_PASSWORD = 'admin123';

type LocalAccount = {
  name: string;
  password: string;
};

export default function App() {
  const [screen, setScreen] = useState<AppScreenName>('login');
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [userName, setUserName] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [catalog, setCatalog] = useState<Book[]>(initialBooks);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleRegister = (name: string, password: string) => {
    const normalizedName = name.trim();

    if (normalizedName.toLowerCase() === DEMO_ADMIN_NAME) {
      Alert.alert(
        'Cadastro não realizado',
        'Esse nome é reservado para a conta de administrador.'
      );
      return;
    }

    const accountExists = accounts.some(
      (account) =>
        account.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (accountExists) {
      Alert.alert(
        'Cadastro não realizado',
        'Esse nome já está cadastrado.'
      );
      return;
    }

    setAccounts((currentAccounts) => [
      ...currentAccounts,
      {
        name: normalizedName,
        password,
      },
    ]);

    setUserName(normalizedName);
    setIsAdmin(false);
    setScreen('home');
  };

  const handleLogin = (name: string, password: string) => {
    const normalizedName = name.trim();

    if (
      normalizedName.toLowerCase() === DEMO_ADMIN_NAME &&
      password === DEMO_ADMIN_PASSWORD
    ) {
      setUserName('Administrador');
      setIsAdmin(true);
      setScreen('home');
      return;
    }

    const account = accounts.find(
      (item) =>
        item.name.toLowerCase() === normalizedName.toLowerCase() &&
        item.password === password
    );

    if (!account) {
      Alert.alert(
        'Não foi possível entrar',
        'Confira seu nome e senha ou crie uma conta.'
      );
      return;
    }

    setUserName(account.name);
    setIsAdmin(false);
    setScreen('home');
  };

  const handleNavigate = (nextScreen: AuthScreenName) => {
    if (nextScreen === 'login') {
      setUserName('');
      setIsAdmin(false);
      setCart([]);
    }

    setScreen(nextScreen);
  };

  const handlePublishBook = (newBook: NewBook) => {
    if (editingBook) {
      const updatedBook: Book = { ...editingBook, ...newBook };
      setCatalog((currentCatalog) =>
        currentCatalog.map((book) =>
          book.id === editingBook.id ? updatedBook : book
        )
      );
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.book.id === updatedBook.id
            ? { ...item, book: updatedBook }
            : item
        )
      );
      setSelectedBook(updatedBook);
      setEditingBook(null);
      setScreen('bookDetail');
      return;
    }

    const book: Book = {
      ...newBook,
      id: `admin-${Date.now()}-${catalog.length}`,
      emoji: '📚',
      coverColor: '#F1E8CF',
    };

    setCatalog((currentCatalog) => [book, ...currentCatalog]);
    setScreen('home');
  };

  const handleAddToCart = (book: Book) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.book.id === book.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { book, quantity: 1 }];
    });
    setScreen('cart');
  };

  const handleChangeCartQuantity = (bookId: string, quantity: number) => {
    setCart((currentCart) =>
      quantity < 1
        ? currentCart.filter((item) => item.book.id !== bookId)
        : currentCart.map((item) =>
          item.book.id === bookId ? { ...item, quantity } : item
        )
    );
  };

  if (screen === 'home') {
    return (
      <HomeScreen
        userName={userName}
        catalog={catalog}
        isAdmin={isAdmin}
        cartItemCount={cart.reduce((count, item) => count + item.quantity, 0)}
        onNavigate={handleNavigate}
        onOpenCart={() => setScreen('cart')}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setScreen('bookDetail');
        }}
        onOpenAdmin={() => {
          setEditingBook(null);
          setScreen('adminBook');
        }}
        onDeleteBook={(bookId) => {
          setCatalog((currentCatalog) =>
            currentCatalog.filter((book) => book.id !== bookId)
          );
          setCart((currentCart) =>
            currentCart.filter((item) => item.book.id !== bookId)
          );
        }}
      />
    );
  }

  if (screen === 'cart') {
    return (
      <CartScreen
        cart={cart}
        onBack={() => setScreen('home')}
        onChangeQuantity={handleChangeCartQuantity}
        onContinue={() => setScreen('checkout')}
      />
    );
  }

  if (screen === 'checkout') {
    return (
      <CheckoutScreen
        cart={cart}
        onBack={() => setScreen('cart')}
        onComplete={() => {
          setCart([]);
          setScreen('home');
        }}
      />
    );
  }

  if (screen === 'adminBook' && isAdmin) {
    return (
      <AdminBookScreen
        initialBook={editingBook ?? undefined}
        onBack={() => {
          setScreen(editingBook ? 'bookDetail' : 'home');
          setEditingBook(null);
        }}
        onPublish={handlePublishBook}
      />
    );
  }

  if (screen === 'bookDetail' && selectedBook) {
    return (
      <BookDetailScreen
        book={selectedBook}
        isAdmin={isAdmin}
        onBack={() => setScreen('home')}
        onAddToCart={handleAddToCart}
        onEdit={() => {
          setEditingBook(selectedBook);
          setScreen('adminBook');
        }}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onNavigate={handleNavigate}
        onSubmit={handleRegister}
      />
    );
  }

  return (
    <LoginScreen
      onNavigate={handleNavigate}
      onSubmit={handleLogin}
    />
  );
}
