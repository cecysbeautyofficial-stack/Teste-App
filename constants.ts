
import { Author, Book, User, Purchase, PaymentMethod, Review, Notification } from './types';

export const authors: Author[] = [
  {
    id: '1',
    name: 'Walter Isaacson',
    photoUrl: 'https://i.imgur.com/5c062u2.jpg',
    bio: 'Walter Isaacson is an American writer, journalist, and biographer. He has been the President and CEO of the Aspen Institute, the Chair and CEO of CNN, and the editor of Time magazine.',
    website: 'https://isaacson.tulane.edu/',
    socials: {
      twitter: 'https://twitter.com/walterisaacson',
    }
  },
  {
    id: '2',
    name: 'David Platt',
    photoUrl: 'https://i.imgur.com/a5z3f6E.jpg',
    bio: 'David Platt is an American pastor and author. He was the president of the International Mission Board. Platt is the author of several books, including the New York Times Best Seller Radical.',
    website: 'https://radical.net/',
    socials: {
      twitter: 'https://twitter.com/plattdavid',
      instagram: 'https://www.instagram.com/plattdavid/'
    }
  },
  {
    id: '3',
    name: 'Orson Scott Card',
    photoUrl: 'https://i.imgur.com/MvA5aJz.jpg',
    bio: 'Orson Scott Card is an American writer known best for his science fiction works. His novel Ender\'s Game (1985) and its sequel Speaker for the Dead (1986) both won Hugo and Nebula Awards.'
  },
  {
    id: '4',
    name: 'Stephen Chbosky',
    photoUrl: 'https://i.imgur.com/N8s3b0Q.jpg',
    bio: 'Stephen Chbosky is an American novelist, screenwriter, and film director best known for writing the New York Times bestselling coming-of-age novel The Perks of Being a Wallflower.'
  },
  {
    id: '5',
    name: 'J.R.R. Tolkien',
    photoUrl: 'https://i.imgur.com/oN2Pb5V.jpg',
    bio: 'John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic, best known as the author of the high fantasy works The Hobbit and The Lord of the Rings.'
  },
  {
    id: '6',
    name: 'Thomas Harris',
    photoUrl: 'https://i.imgur.com/vLzX7Z4.jpg',
    bio: 'Thomas Harris is an American writer, best known for a series of suspense novels about his most famous character, Hannibal Lecter. All of his works have been adapted into films.'
  },
  {
    id: '7',
    name: 'Paula Hawkins',
    photoUrl: 'https://i.imgur.com/gK2fF8y.jpg',
    bio: 'Paula Hawkins is a British author best known for her top-selling psychological thriller novel The Girl on the Train (2015), which deals with themes of domestic violence, alcohol, and drug abuse.'
  },
  {
    id: '8',
    name: 'Agatha Christie',
    photoUrl: 'https://i.imgur.com/0i1eJ9A.jpg',
    bio: 'Dame Agatha Mary Clarissa Christie was an English writer known for her sixty-six detective novels and fourteen short story collections, particularly those revolving around fictional detectives Hercle Poirot and Miss Marple.'
  },
  {
    id: '9',
    name: 'Beto Autor',
    photoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    bio: 'Beto Autor is a prolific contemporary author known for his captivating tales that blend elements of fantasy, adventure, and mystery. His works often explore the rich landscapes and folklore of his homeland.'
  }
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm-1', name: 'M-Pesa', icon: 'phone', enabled: true },
  { id: 'pm-2', name: 'E-Mola', icon: 'phone', enabled: true },
  { id: 'pm-3', name: 'Cartão de Crédito', icon: 'card', enabled: true },
];

// Predefined users for easy testing of different roles
export const mockRegisteredUsers: User[] = [
    { id: 'admin-user-01', name: 'Admin', email: 'admin@leiaaqui.com', password: '123456', role: 'admin', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=admin-user-01', whatsapp: '840000001', preferredPaymentMethod: 'Cartão de Crédito', notificationsEnabled: true, emailNotificationsEnabled: true, following: [] },
    { id: 'author-user-01', name: 'Beto Autor', email: 'author@leiaaqui.com', password: '123456', role: 'author', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', whatsapp: '840000002', preferredPaymentMethod: 'E-Mola', notificationsEnabled: true, emailNotificationsEnabled: true, following: ['5', '3'] },
    { id: 'reader-user-01', name: 'Alice Leitora', email: 'reader@leiaaqui.com', password: '123456', role: 'reader', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=reader-user-01', whatsapp: '840000003', preferredPaymentMethod: 'M-Pesa', notificationsEnabled: false, emailNotificationsEnabled: true, following: ['9', '1'] },
];

export const bookCategories: string[] = [
  'Fantasia',
  'Ficção',
  'Mistério',
  'Aventura',
  'Suspense',
  'Biografia',
  'História',
  'Romance',
  'Não-Ficção',
];

type RawBook = Omit<Book, 'author'> & { authorId: string };

const rawBooks: RawBook[] = [
  {
    id: '1',
    title: 'Steve Jobs',
    authorId: '1',
    coverUrl: 'https://i.imgur.com/sDPs5yg.jpg',
    price: 1250.00,
    currency: 'MZN',
    rating: 4.8,
    category: 'Biografia',
    description: 'A biografia definitiva do cofundador da Apple, baseada em mais de quarenta entrevistas com Jobs, bem como entrevistas com mais de cem familiares, amigos, adversários, concorrentes e colegas.',
    status: 'Published',
    sales: 1520,
    readers: 2300,
    publishDate: '2011-10-24',
    pages: 656,
    language: 'Português',
    isFeatured: true,
    reviews: [
        {
            id: 'r1',
            userId: 'reader-user-01',
            userName: 'Alice Leitora',
            rating: 5,
            comment: 'Uma biografia incrível! Detalhes fascinantes sobre a vida de Steve Jobs.',
            date: '2023-11-10'
        },
        {
            id: 'r2',
            userId: 'u3',
            userName: 'Carlos M.',
            rating: 4,
            comment: 'Livro muito bem escrito, embora denso em algumas partes.',
            date: '2023-12-05'
        }
    ]
  },
  {
    id: '2',
    title: 'Radical',
    authorId: '2',
    coverUrl: 'https://i.imgur.com/1z7k4bF.jpg',
    price: 850.50,
    currency: 'MZN',
    rating: 4.6,
    category: 'Não-Ficção',
    description: 'O que acontece quando tomamos Jesus a sério? David Platt desafia você a considerar com um coração aberto como temos manipulado o evangelho para se ajustar às nossas preferências culturais.',
    status: 'Published',
    sales: 980,
    readers: 1500,
    publishDate: '2010-04-29',
    pages: 240,
    language: 'Português',
    reviews: []
  },
  {
    id: '3',
    title: 'O Jogo do Exterminador',
    authorId: '3',
    coverUrl: 'https://i.imgur.com/2Y4zXyV.jpg',
    price: 990.00,
    currency: 'MZN',
    rating: 4.9,
    category: 'Ficção',
    description: 'Num futuro onde a humanidade está em guerra com uma raça alienígena, a esperança reside em jovens gênios treinados em jogos de guerra avançados. Ender Wiggin é a maior esperança da humanidade.',
    status: 'Published',
    sales: 2100,
    readers: 3500,
    publishDate: '1985-01-15',
    pages: 324,
    language: 'Português',
    salePrice: 800,
    saleStartDate: '2023-01-01',
    saleEndDate: '2025-12-31',
    reviews: [
        {
            id: 'r3',
            userId: 'u4',
            userName: 'Pedro S.',
            rating: 5,
            comment: 'Simplesmente um clássico da ficção científica. Ender é um personagem complexo.',
            date: '2024-01-20'
        }
    ]
  },
  {
    id: '4',
    title: 'As Vantagens de Ser Invisível',
    authorId: '4',
    coverUrl: 'https://i.imgur.com/pOMiE7u.jpg',
    price: 750.00,
    currency: 'MZN',
    rating: 4.5,
    category: 'Ficção',
    description: 'A história de um calouro do ensino médio, Charlie, que lida com o primeiro amor, o suicídio de seu melhor amigo e sua própria doença mental enquanto luta para encontrar um grupo de pessoas a que pertença.',
    status: 'Published',
    sales: 1200,
    readers: 1800,
    publishDate: '1999-02-01',
    pages: 213,
    language: 'Português',
  },
  {
    id: '5',
    title: 'O Hobbit',
    authorId: '5',
    coverUrl: 'https://i.imgur.com/h5vY0iX.jpg',
    price: 950.00,
    currency: 'MZN',
    rating: 4.9,
    category: 'Fantasia',
    description: 'A aventura de Bilbo Bolseiro, um hobbit que leva uma vida confortável e sem ambições, que é inesperadamente arrastado para uma missão épica para recuperar um tesouro de um dragão.',
    status: 'Published',
    sales: 3250,
    readers: 5100,
    publishDate: '1937-09-21',
    pages: 310,
    language: 'Português',
     reviews: [
        {
            id: 'r4',
            userId: 'u5',
            userName: 'Maria L.',
            rating: 5,
            comment: 'Uma aventura maravilhosa para todas as idades.',
            date: '2023-09-12'
        },
         {
            id: 'r5',
            userId: 'reader-user-01',
            userName: 'Alice Leitora',
            rating: 5,
            comment: 'Bilbo é o melhor hobbit!',
            date: '2024-02-14'
        }
    ]
  },
  {
    id: '6',
    title: 'O Silêncio dos Inocentes',
    authorId: '6',
    coverUrl: 'https://i.imgur.com/L12g01b.jpg',
    price: 890.00,
    currency: 'MZN',
    rating: 4.7,
    category: 'Suspense',
    description: 'Uma jovem estagiária do FBI, Clarice Starling, deve procurar a ajuda de um prisioneiro manipulador e canibal, Dr. Hannibal Lecter, para ajudar a capturar outro serial killer.',
    status: 'Published',
    sales: 1800,
    readers: 2600,
    publishDate: '1988-05-29',
    pages: 367,
    language: 'Português',
  },
  {
    id: '7',
    title: 'Contos da Savana',
    authorId: '9',
    coverUrl: 'https://picsum.photos/seed/savana/300/450',
    price: 650.00,
    currency: 'MZN',
    rating: 4.4,
    category: 'Aventura',
    description: 'Uma coleção de contos que exploram a magia e os mistérios da savana africana, com personagens cativantes e criaturas fantásticas.',
    status: 'Published',
    sales: 150,
    readers: 280,
    publishDate: '2023-05-20',
    pages: 180,
    language: 'Português',
  },
];

export const books: Book[] = rawBooks.map(book => {
  const author = authors.find(a => a.id === book.authorId);
  if (!author) {
    throw new Error(`Author with ID ${book.authorId} not found for book "${book.title}"`);
  }
  const { authorId, ...restOfBook } = book;
  return {
    ...restOfBook,
    author,
  };
});

export const purchases: Purchase[] = [
  {
    userId: 'reader-user-01',
    bookId: '1',
    purchaseDate: '2024-07-15',
    paymentMethod: 'Cartão de Crédito',
    amount: 1250.00,
  },
  {
    userId: 'reader-user-01',
    bookId: '3',
    purchaseDate: '2024-06-28',
    paymentMethod: 'M-Pesa',
    amount: 990.00,
  },
   {
    userId: 'reader-user-01',
    bookId: '5',
    purchaseDate: '2024-05-10',
    paymentMethod: 'E-Mola',
    amount: 950.00,
  },
  {
    userId: 'author-user-01', // an author can also be a reader
    bookId: '2',
    purchaseDate: '2024-07-01',
    paymentMethod: 'E-Mola',
    amount: 850.50,
  },
  {
    userId: 'reader-user-01',
    bookId: '7',
    purchaseDate: '2024-07-20',
    paymentMethod: 'M-Pesa',
    amount: 650.00,
  },
];

export const mockNotifications: Notification[] = [
    // Admin Notifications
    {
        id: 'n1',
        userId: 'admin-user-01',
        title: 'Nova Compra',
        message: 'Usuário Alice Leitora comprou "Steve Jobs".',
        type: 'success',
        date: '2024-07-15T10:30:00Z',
        read: false,
        linkTo: 'dashboard'
    },
    {
        id: 'n2',
        userId: 'admin-user-01',
        title: 'Autor Pendente',
        message: 'Novo registro de autor: Beto Autor.',
        type: 'warning',
        date: '2024-07-14T14:20:00Z',
        read: true,
        linkTo: 'dashboard'
    },
    {
        id: 'n3',
        userId: 'admin-user-01',
        title: 'Livro em Destaque',
        message: '"Contos da Savana" foi marcado como destaque.',
        type: 'info',
        date: '2024-07-10T09:00:00Z',
        read: true,
        linkTo: 'dashboard'
    },
    {
        id: 'n4',
        userId: 'admin-user-01',
        title: 'Nova Avaliação',
        message: 'Nova avaliação de 5 estrelas em "O Hobbit".',
        type: 'info',
        date: '2024-07-16T11:00:00Z',
        read: false,
        linkTo: 'detail',
        relatedId: '5'
    },

    // Author Notifications
    {
        id: 'n5',
        userId: 'author-user-01',
        title: 'Livro Aprovado',
        message: 'Seu livro "Contos da Savana" foi aprovado e publicado!',
        type: 'success',
        date: '2024-05-20T08:00:00Z',
        read: true,
        linkTo: 'dashboard'
    },
    {
        id: 'n6',
        userId: 'author-user-01',
        title: 'Novo Seguidor',
        message: 'Alice Leitora começou a seguir você.',
        type: 'info',
        date: '2024-06-01T15:30:00Z',
        read: false,
        linkTo: 'author_profile',
        relatedId: '9'
    },
    {
        id: 'n7',
        userId: 'author-user-01',
        title: 'Top Vendas',
        message: '"Radical" está entre os livros mais vendidos deste mês!',
        type: 'success',
        date: '2024-07-01T09:00:00Z',
        read: true,
        linkTo: 'dashboard'
    },
    {
        id: 'n8',
        userId: 'author-user-01',
        title: 'Nova Avaliação',
        message: 'Um leitor avaliou "Contos da Savana" com 4 estrelas.',
        type: 'info',
        date: '2024-07-21T10:00:00Z',
        read: false,
        linkTo: 'detail',
        relatedId: '7'
    },

    // Reader Notifications
    {
        id: 'n9',
        userId: 'reader-user-01',
        title: 'Novo Livro',
        message: 'J.R.R. Tolkien publicou um novo livro. Confira!',
        type: 'info',
        date: '2024-07-18T12:00:00Z',
        read: false,
        linkTo: 'detail',
        relatedId: '5'
    },
    {
        id: 'n10',
        userId: 'reader-user-01',
        title: 'Promoção Imperdível',
        message: '"O Jogo do Exterminador" está em promoção!',
        type: 'alert',
        date: '2024-07-20T10:00:00Z',
        read: false,
        linkTo: 'detail',
        relatedId: '3'
    },
    {
        id: 'n11',
        userId: 'reader-user-01',
        title: 'Sugestão para Você',
        message: 'Baseado nas suas leituras, achamos que você vai gostar de "As Vantagens de Ser Invisível".',
        type: 'info',
        date: '2024-07-22T09:30:00Z',
        read: true,
        linkTo: 'detail',
        relatedId: '4'
    }
];
