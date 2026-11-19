
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import BookDetailScreen from './BookDetailScreen';
import AdminBookScreen from './AdminBookScreen';
import AdminLoansScreen from './AdminLoansScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';

import {
  books as initialBooks,
  createDueDate,
  type Book,
  type CartItem,
  type LoanRequest,
  type LoanStatus,
  type NewBook,
} from './books';

import type { AppScreenName, AuthScreenName } from './types';

const DEMO_ADMIN_NAME = 'admin';
const DEMO_ADMIN_EMAIL = 'admin@biblioteca.com';
const DEMO_ADMIN_PASSWORD = 'admin123';
const ACCOUNTS_STORAGE_KEY = 'biblioteca-online-accounts';
const LOANS_STORAGE_KEY = 'biblioteca-online-loans';

type LocalAccount = {
  name: string;
  email?: string;
  address: string;
  password: string;
};

const normalizeText = (value: string) => value.trim();
const normalizeName = (value: string) =>
  normalizeText(value).replace(/\s+/g, ' ');
const normalizeIdentifier = (value: string) => normalizeText(value).toLowerCase();

const getUniqueLendingLocations = (locations: string[]) => {
  const uniqueLocations = new Map<string, string>();

  locations.forEach((location) => {
    const trimmedLocation = location.trim();
    if (trimmedLocation) {
      uniqueLocations.set(trimmedLocation.toLowerCase(), trimmedLocation);
    }
  });

  return Array.from(uniqueLocations.values());
};

const replaceBookLendingLocation = (
  book: Book,
  location: string,
  replacement: string
): Book => {
  const lendingLocations = book.lendingLocations ?? [];

  if (!lendingLocations.some((item) => item.toLowerCase() === location.toLowerCase())) {
    return book;
  }

  return {
    ...book,
    lendingLocations: getUniqueLendingLocations(
      lendingLocations.map((item) =>
        item.toLowerCase() === location.toLowerCase() ? replacement : item
      )
    ),
  };
};

const removeBookLendingLocation = (book: Book, location: string): Book => {
  const lendingLocations = book.lendingLocations ?? [];
  const updatedLocations = lendingLocations.filter(
    (item) => item.toLowerCase() !== location.toLowerCase()
  );

  return updatedLocations.length === lendingLocations.length
    ? book
    : { ...book, lendingLocations: updatedLocations };
};

export default function App() {
  const [screen, setScreen] = useState<AppScreenName>('login');
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [isAccountsReady, setIsAccountsReady] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [catalog, setCatalog] = useState<Book[]>(initialBooks);
  const [savedLendingLocations, setSavedLendingLocations] = useState<string[]>(
    () =>
      getUniqueLendingLocations(
        initialBooks.flatMap((book) => book.lendingLocations ?? [])
      )
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isLoansReady, setIsLoansReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async () => {
      try {
        const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);

        if (!storedAccounts) {
          return;
        }

        const parsedAccounts = JSON.parse(storedAccounts) as LocalAccount[];

        if (Array.isArray(parsedAccounts) && isMounted) {
          const normalizedAccounts = parsedAccounts
            .filter(
              (account): account is LocalAccount =>
                Boolean(account?.name?.trim()) &&
                typeof account.password === 'string'
            )
            .map((account) => ({
              name: normalizeName(account.name),
              email: normalizeText(account.email ?? '').toLowerCase(),
              address: normalizeName(account.address ?? ''),
              password: account.password,
            }))
            .filter((account, index, accounts) => {
              const name = normalizeIdentifier(account.name);
              const email = normalizeIdentifier(account.email ?? '');
              return !accounts.slice(0, index).some((existingAccount) =>
                normalizeIdentifier(existingAccount.name) === name ||
                (email && normalizeIdentifier(existingAccount.email ?? '') === email)
              );
            });

          setAccounts(normalizedAccounts);
        }
      } catch (error) {
        console.warn('Não foi possível carregar os usuários salvos.', error);
      } finally {
        if (isMounted) {
          setIsAccountsReady(true);
        }
      }
    };

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAccountsReady) {
      return;
    }

    const saveAccounts = async () => {
      try {
        await AsyncStorage.setItem(
          ACCOUNTS_STORAGE_KEY,
          JSON.stringify(accounts)
        );
      } catch (error) {
        console.warn('Não foi possível salvar os usuários.', error);
      }
    };

    saveAccounts();
  }, [accounts, isAccountsReady]);

  useEffect(() => {
    let isMounted = true;

    const loadLoans = async () => {
      try {
        const storedLoans = await AsyncStorage.getItem(LOANS_STORAGE_KEY);
        if (!storedLoans || !isMounted) {
          return;
        }

        const parsedLoans = JSON.parse(storedLoans) as LoanRequest[];
        if (Array.isArray(parsedLoans)) {
          setLoanRequests(parsedLoans);
        }
      } catch (error) {
        console.warn('Não foi possível carregar os empréstimos salvos.', error);
      } finally {
        if (isMounted) {
          setIsLoansReady(true);
        }
      }
    };

    loadLoans();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoansReady) {
      return;
    }

    const saveLoans = async () => {
      try {
        await AsyncStorage.setItem(
          LOANS_STORAGE_KEY,
          JSON.stringify(loanRequests)
        );
      } catch (error) {
        console.warn('Não foi possível salvar os empréstimos.', error);
      }
    };

    saveLoans();
  }, [loanRequests, isLoansReady]);

  // CADASTRO
  const handleRegister = (
    name: string,
    email: string,
    password: string,
    address: string
  ) => {
    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeIdentifier(email);

    if (
      normalizeIdentifier(normalizedName) === DEMO_ADMIN_NAME ||
      normalizedEmail === DEMO_ADMIN_EMAIL
    ) {
      Alert.alert(
        'Cadastro não realizado',
        'Esse nome ou e-mail é reservado para a conta de administrador.'
      );
      return;
    }

    const duplicateName = accounts.some(
      (account) =>
        normalizeIdentifier(account.name) === normalizeIdentifier(normalizedName)
    );
    if (duplicateName) {
      Alert.alert(
        'Nome de usuário indisponível',
        'Esse nome já está cadastrado. Escolha outro nome para continuar.'
      );
      return;
    }

    const duplicateEmail = accounts.some(
      (account) =>
        normalizeIdentifier(account.email ?? '') === normalizedEmail
    );
    if (duplicateEmail) {
      Alert.alert(
        'E-mail já cadastrado',
        'Esse e-mail já possui uma conta. Use outro e-mail ou faça login.'
      );
      return;
    }

    setAccounts((currentAccounts) => [
      ...currentAccounts,
      {
        name: normalizedName,
        email: normalizedEmail,
        address: normalizeName(address),
        password,
      },
    ]);

    setUserName(normalizedName);
    setIsAdmin(false);
    setScreen('home');
  };

  // LOGIN
  const handleLogin = (_name: string, email: string, password: string) => {
    const loginIdentifier = normalizeIdentifier(email);

    if (
      (loginIdentifier === DEMO_ADMIN_EMAIL ||
        loginIdentifier === DEMO_ADMIN_NAME) &&
      password === DEMO_ADMIN_PASSWORD
    ) {
      setUserName('Administrador');
      setIsAdmin(true);
      setScreen('home');
      return;
    }

    const account = accounts.find((item) => {
      const registeredEmail = normalizeIdentifier(item.email ?? '');
      const username = normalizeIdentifier(item.name);

      return (
        (registeredEmail === loginIdentifier || username === loginIdentifier) &&
        item.password === password
      );
    });

    if (!account) {
      Alert.alert(
        'Não foi possível entrar',
        'Confira seu e-mail e senha ou crie uma conta.'
      );
      return;
    }

    setUserName(account.name);
    setIsAdmin(false);
    setScreen('home');
  };

  // NAVEGAÇÃO
  const handleNavigate = (nextScreen: AuthScreenName) => {
    if (nextScreen === 'login') {
      setUserName('');
      setIsAdmin(false);
      setCart([]);
    }

    setScreen(nextScreen);
  };

  // PUBLICAR OU EDITAR LIVRO
  const handlePublishBook = (newBook: NewBook) => {
    setSavedLendingLocations((currentLocations) =>
      getUniqueLendingLocations([
        ...currentLocations,
        ...(newBook.lendingLocations ?? []),
      ])
    );

    if (editingBook) {
      const updatedBook: Book = {
        ...editingBook,
        ...newBook,
      };

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

  const handleUpdateSavedLocation = (
    location: string,
    replacement: string
  ) => {
    setSavedLendingLocations((currentLocations) =>
      getUniqueLendingLocations(
        currentLocations.map((item) =>
          item.toLowerCase() === location.toLowerCase() ? replacement : item
        )
      )
    );
    setCatalog((currentCatalog) =>
      currentCatalog.map((book) =>
        replaceBookLendingLocation(book, location, replacement)
      )
    );
    setSelectedBook((currentBook) =>
      currentBook
        ? replaceBookLendingLocation(currentBook, location, replacement)
        : currentBook
    );
    setEditingBook((currentBook) =>
      currentBook
        ? replaceBookLendingLocation(currentBook, location, replacement)
        : currentBook
    );
  };

  const handleAddSavedLocation = (location: string) => {
    setSavedLendingLocations((currentLocations) =>
      getUniqueLendingLocations([...currentLocations, location])
    );
  };

  const handleDeleteSavedLocation = (location: string) => {
    setSavedLendingLocations((currentLocations) =>
      currentLocations.filter(
        (item) => item.toLowerCase() !== location.toLowerCase()
      )
    );
    setCatalog((currentCatalog) =>
      currentCatalog.map((book) => removeBookLendingLocation(book, location))
    );
    setSelectedBook((currentBook) =>
      currentBook ? removeBookLendingLocation(currentBook, location) : currentBook
    );
    setEditingBook((currentBook) =>
      currentBook ? removeBookLendingLocation(currentBook, location) : currentBook
    );
  };

  // ADICIONAR AO CARRINHO
  const handleAddToCart = (book: Book) => {
    if (isAdmin) {
      Alert.alert(
        'Ação indisponível',
        'O administrador gerencia o catálogo e não realiza compras.'
      );
      return;
    }

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

  const handleBorrowBook = (book: Book, pickupLocation: string) => {
    if (isAdmin) {
      Alert.alert(
        'Empréstimo indisponível',
        'A conta de administrador não pode solicitar empréstimos.'
      );
      return;
    }

    const alreadyRequested = loanRequests.some(
      (request) =>
        request.bookId === book.id &&
        request.borrowerName === userName &&
        request.status !== 'returned'
    );

    if (alreadyRequested) {
      Alert.alert(
        'Empréstimo já solicitado',
        'Você já solicitou este livro nesta sessão.'
      );
      return;
    }

    setLoanRequests((currentRequests) => [
      {
        id: `${Date.now()}-${currentRequests.length}`,
        bookId: book.id,
        bookTitle: book.title,
        borrowerName: userName,
        pickupLocation,
        requestedAt: new Date().toLocaleString('pt-BR'),
        status: 'requested',
      },
      ...currentRequests,
    ]);
    Alert.alert(
      'Empréstimo solicitado',
      `Sua solicitação para "${book.title}" foi registrada. Retire o livro em: ${pickupLocation}.`
    );
  };

  const handleUpdateLoanStatus = (loanId: string, status: LoanStatus) => {
    const updatedAt = new Date().toLocaleString('pt-BR');

    setLoanRequests((currentRequests) =>
      currentRequests.map((request) => {
        if (request.id !== loanId || request.status === status) {
          return request;
        }

        if (status === 'requested') {
          return {
            ...request,
            status,
            pickedUpAt: undefined,
            returnedAt: undefined,
            dueDate: undefined,
          };
        }

        if (status === 'borrowed') {
          const now = new Date();
          return {
            ...request,
            status,
            pickedUpAt: updatedAt,
            returnedAt: undefined,
            dueDate:
              request.status === 'returned'
                ? createDueDate(now)
                : request.dueDate ?? createDueDate(now),
          };
        }

        if (status === 'returnRequested') {
          return {
            ...request,
            status,
          };
        }

        return {
          ...request,
          status,
          returnedAt: updatedAt,
          dueDate: undefined,
        };
      })
    );
  };

  const handleRequestReturn = (loanId: string) => {
    setLoanRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === loanId && request.status === 'borrowed'
          ? { ...request, status: 'returnRequested' }
          : request
      )
    );
  };

  // ALTERAR QUANTIDADE DO CARRINHO
  const handleChangeCartQuantity = (
    bookId: string,
    quantity: number
  ) => {
    setCart((currentCart) =>
      quantity < 1
        ? currentCart.filter((item) => item.book.id !== bookId)
        : currentCart.map((item) =>
            item.book.id === bookId
              ? { ...item, quantity }
              : item
          )
    );
  };

  // TELA INICIAL
  if (screen === 'home') {
    return (
      <HomeScreen
        userName={userName}
        catalog={catalog}
        isAdmin={isAdmin}
        myLoans={loanRequests.filter(
          (request) => request.borrowerName === userName
        )}
        cartItemCount={cart.reduce(
          (count, item) => count + item.quantity,
          0
        )}
        loanRequestCount={
          loanRequests.filter(
            (request) =>
              request.status === 'requested' ||
              request.status === 'returnRequested'
          ).length
        }
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
        onOpenLoans={() => setScreen('adminLoans')}
        onRequestReturn={handleRequestReturn}
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

  if (screen === 'adminLoans' && isAdmin) {
    return (
      <AdminLoansScreen
        loanRequests={loanRequests}
        customerAddresses={accounts.map(({ name, address }) => ({
          name,
          address,
        }))}
        onBack={() => setScreen('home')}
        onDeleteLoanRequest={(loanId) =>
          setLoanRequests((currentRequests) =>
            currentRequests.filter((request) => request.id !== loanId)
          )
        }
        onUpdateLoanStatus={handleUpdateLoanStatus}
      />
    );
  }

  // CARRINHO
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

  // FINALIZAÇÃO DA COMPRA
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

  // ADMINISTRADOR
  if (screen === 'adminBook' && isAdmin) {
    return (
      <AdminBookScreen
        initialBook={editingBook ?? undefined}
        savedLendingLocations={savedLendingLocations}
        onAddSavedLocation={handleAddSavedLocation}
        onUpdateSavedLocation={handleUpdateSavedLocation}
        onDeleteSavedLocation={handleDeleteSavedLocation}
        onBack={() => {
          setScreen(editingBook ? 'bookDetail' : 'home');
          setEditingBook(null);
        }}
        onPublish={handlePublishBook}
      />
    );
  }

  // DETALHES DO LIVRO
  if (screen === 'bookDetail' && selectedBook) {
    return (
      <BookDetailScreen
        book={selectedBook}
        isAdmin={isAdmin}
        onBack={() => setScreen('home')}
        onAddToCart={handleAddToCart}
        borrowed={loanRequests.some(
          (request) =>
            request.bookId === selectedBook.id &&
            request.borrowerName === userName &&
            request.status !== 'returned'
        )}
        onBorrow={handleBorrowBook}
        onEdit={() => {
          setEditingBook(selectedBook);
          setScreen('adminBook');
        }}
      />
    );
  }

  // CADASTRO
  if (screen === 'register') {
    return (
      <RegisterScreen
        onNavigate={handleNavigate}
        onSubmit={handleRegister}
      />
    );
  }

  // LOGIN
  return (
    <LoginScreen
      onNavigate={handleNavigate}
      onSubmit={handleLogin}
    />
  );
}
