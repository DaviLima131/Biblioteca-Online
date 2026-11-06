
export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  price: number;
  imageUri?: string;
  emoji: string;
  coverColor: string;
};

export type CartItem = {
  book: Book;
  quantity: number;
};

export type NewBook = Omit<Book, 'id' | 'emoji' | 'coverColor'>;

export const bookCategories = [
  'Romance',
  'Fantasia',
  'Mistério',
  'Aventura',
  'Ficção científica',
  'Drama',
  'Terror',
  'Biografia',
  'História',
  'Infantil',
  'Poesia',
] as const;

export const books: Book[] = [
  {
    id: '1',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    category: 'Fantasia',
    description:
      'Uma viagem poética por planetas e encontros extraordinários. Ao lado de um pequeno príncipe, descubra reflexões sobre amizade, afeto e o que realmente importa.',
    price: 39.9,
    emoji: '🌟',
    coverColor: '#FFF0C4',
  },
  {
    id: '2',
    title: 'Orgulho e Preconceito',
    author: 'Jane Austen',
    category: 'Romance',
    description:
      'Elizabeth Bennet e Fitzwilliam Darcy precisam rever suas primeiras impressões enquanto navegam os costumes, as relações e os desafios da sociedade inglesa.',
    price: 44.9,
    emoji: '🌹',
    coverColor: '#F8DFDA',
  },
  {
    id: '3',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    category: 'Mistério',
    description:
      'Acompanhe o brilhante detetive Sherlock Holmes e seu parceiro Dr. Watson em investigações cheias de pistas, dedução e mistérios surpreendentes.',
    price: 34.9,
    emoji: '🔎',
    coverColor: '#E3E9D5',
  },
  {
    id: '4',
    title: 'Alice no País das Maravilhas',
    author: 'Lewis Carroll',
    category: 'Fantasia',
    description:
      'Depois de seguir um coelho apressado, Alice cai em um mundo fantástico onde criaturas curiosas e situações inesperadas desafiam toda a lógica.',
    price: 36.9,
    emoji: '🐇',
    coverColor: '#DDEBFA',
  },
  {
    id: '5',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    category: 'Romance',
    description:
      'Bentinho relembra sua história com Capitu em uma narrativa clássica da literatura brasileira, marcada por ciúmes, dúvidas e reflexões sobre a memória.',
    price: 29.9,
    emoji: '📖',
    coverColor: '#EADFCB',
  },
  {
    id: '6',
    title: 'O Hobbit',
    author: 'J. R. R. Tolkien',
    category: 'Fantasia',
    description:
      'Bilbo Bolseiro embarca em uma aventura inesperada ao lado de anões e de Gandalf, enfrentando perigos e descobrindo sua própria coragem.',
    price: 49.9,
    emoji: '🧙',
    coverColor: '#DDE8D1',
  },
  {
    id: '7',
    title: 'A Ilha do Tesouro',
    author: 'Robert Louis Stevenson',
    category: 'Aventura',
    description:
      'Jim Hawkins encontra um mapa misterioso e parte em uma viagem pelo mar em busca de um tesouro, enfrentando piratas e desafios perigosos.',
    price: 32.9,
    emoji: '🏴‍☠️',
    coverColor: '#F5E1B8',
  },
  {
    id: '8',
    title: 'O Assassinato no Expresso do Oriente',
    author: 'Agatha Christie',
    category: 'Mistério',
    description:
      'Durante uma viagem de trem, Hercule Poirot precisa desvendar um assassinato cercado de suspeitos, segredos e pistas intrigantes.',
    price: 42.9,
    emoji: '🚂',
    coverColor: '#E6E0F4',
  },
];

export const formatPrice = (price: number): string =>
  price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
