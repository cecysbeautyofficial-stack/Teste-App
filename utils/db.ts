
import { Book } from '../types';

const DB_NAME = 'livroflixDB';
const DB_VERSION = 1;
const STORE_NAME = 'books';

// This is the mock content we will store for each book.
// In a real app, this would be fetched from a server.
const bookContentData: Record<string, string[]> = {
    '1': ["Capítulo 1: A Biografia de um Gênio", "Steve Jobs foi um visionário, um perfeccionista e um ícone que revolucionou seis indústrias: computadores pessoais, filmes de animação, música, telefones, tablets e publicação digital.", "Sua jornada na Apple, sua saída e seu retorno triunfante são uma lição de resiliência e inovação."],
    '2': ["Capítulo 1: O Chamado Radical", "David Platt explora o que significa ser um verdadeiro seguidor de Cristo em um mundo de autossatisfação.", "Ele desafia os cristãos a abandonarem o 'sonho americano' e abraçarem um evangelho que exige sacrifício e dedicação total."],
    '3': ["Capítulo 1: O Jogo", "A Terra está em guerra com uma raça alienígena insectoide, os Formics. Para garantir a vitória, a Frota Internacional recruta crianças superdotadas para treiná-las como comandantes.", "Andrew 'Ender' Wiggin é a última esperança da humanidade, um gênio tático destinado a liderar a guerra, mas a que custo?"],
    '4': ["Carta 1", "Querido amigo, eu escrevo para você porque ela disse que você escuta e entende e não tentou dormir com aquela pessoa naquela festa, mesmo que pudesse ter feito isso.", "O ensino médio é um lugar estranho e solitário. Charlie, um calouro introvertido e observador, navega pelas complexidades do primeiro amor, da amizade e da perda."],
    '5': ["Capítulo 1: Uma Festa Inesperada", "Numa toca no chão vivia um hobbit. Não uma toca desagradável, suja e úmida, mas uma toca de hobbit, o que significa conforto.", "A vida tranquila de Bilbo Bolseiro é virada de cabeça para baixo quando o mago Gandalf e treze anões aparecem em sua porta, arrastando-o para uma aventura épica para recuperar um tesouro de um dragão."],
    '6': ["Capítulo 1: O Agente do FBI", "Clarice Starling, uma jovem e ambiciosa estagiária do FBI, é encarregada de uma tarefa assustadora: entrevistar o Dr. Hannibal Lecter, um psiquiatra brilhante e um assassino canibal manipulador.", "Ela precisa da ajuda dele para capturar 'Buffalo Bill', um serial killer que esfola suas vítimas, numa corrida contra o tempo."],
    '7': ["Manhã de Segunda", "Rachel Watson pega o trem todos os dias, observando as mesmas casas e pessoas. Ela cria uma vida perfeita para um casal que vê, até que um dia testemunha algo chocante.", "Quando a mulher que ela observava desaparece, Rachel se envolve na investigação, forçando-a a confrontar seus próprios demônios e sua memória fragmentada."],
    '8': ["Capítulo 1: A Ilha", "Dez estranhos, cada um com um segredo sombrio, são convidados para uma mansão em uma ilha isolada. Seu anfitrião misterioso está ausente.", "Uma antiga canção de ninar começa a se tornar realidade quando, um por um, os convidados começam a morrer de acordo com seus versos. Quem é o assassino? E então não sobrou nenhum..."],
};

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveBookContent = async (book: Book): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const bookData = {
        id: book.id,
        content: bookContentData[book.id] || [`Conteúdo para ${book.title} não encontrado.`]
    };

    const request = store.put(bookData);

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error saving book:', request.error);
        reject(request.error);
    }
  });
};

export const getBookContent = async (bookId: string): Promise<string[] | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(bookId);

    request.onsuccess = () => {
        resolve(request.result?.content);
    };
    request.onerror = () => {
        console.error('Error getting book content:', request.error);
        reject(request.error);
    }
  });
};

export const getOnlineBookContent = (bookId: string): string[] | undefined => {
    return bookContentData[bookId];
};

export const deleteBookContent = async (bookId: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(bookId);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting book:', request.error);
            reject(request.error);
        }
    });
};

export const getOfflineBookIds = async (): Promise<string[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
            resolve(request.result as string[]);
        };
        request.onerror = () => {
            console.error('Error getting all keys:', request.error);
            reject(request.error);
        }
    });
};
