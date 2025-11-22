
export type TranslationKey =
  | 'home'
  | 'library'
  | 'bookStore'
  | 'search'
  | 'dashboard'
  | 'adminPanel'
  | 'accountPending'
  | 'accountBlocked'
  | 'authorRegistrationPendingMessage'
  | 'cannotDeleteOwnAccount'
  | 'featuredCollection'
  | 'recentlyViewed'
  | 'recommendedForYou'
  | 'categories'
  | 'topSellers'
  | 'freeBooks'
  | 'paidBooks'
  | 'libraryIsEmpty'
  | 'libraryIsEmptyDescription'
  | 'biography'
  | 'fictionAndLiterature'
  | 'allTimeBestsellers'
  | 'searchForBooksOrAuthors'
  | 'allCategories'
  | 'filterByAuthor'
  | 'sortByRelevance'
  | 'sortByPriceAsc'
  | 'sortByPriceDesc'
  | 'sortByRating'
  | 'sortByPublicationDate'
  | 'activeFilters'
  | 'clearFilters'
  | 'noResultsFound'
  | 'isFeatured'
  | 'removeFromFavorites'
  | 'addToFavorites'
  | 'book'
  | 'saleSettings'
  | 'portuguese'
  | 'showPreview'
  | 'read'
  | 'buyNow'
  | 'buy'
  | 'fromThePublisher'
  | 'more'
  | 'less'
  | 'relatedAuthors'
  | 'reviews'
  | 'writeReview'
  | 'yourRating'
  | 'rating'
  | 'yourComment'
  | 'submit'
  | 'loginToReview'
  | 'login'
  | 'noReviewsYet'
  | 'moreBy'
  | 'booksBy'
  | 'customersAlsoBought'
  | 'moreLikeThis'
  | 'information'
  | 'category'
  | 'published'
  | 'language'
  | 'pages'
  | 'phoneNumber'
  | 'phoneHint'
  | 'cardNumber'
  | 'expiryDate'
  | 'paymentSuccessful'
  | 'preparingYourBook'
  | 'completePurchase'
  | 'orderSummary'
  | 'total'
  | 'selectPaymentMethod'
  | 'processing'
  | 'pay'
  | 'loadingBook'
  | 'readerSettings'
  | 'fontSize'
  | 'lineHeight'
  | 'theme'
  | 'light'
  | 'sepia'
  | 'dark'
  | 'draft'
  | 'likedTheSample'
  | 'buyToContinue'
  | 'invalidCredentials'
  | 'loginToYourAccount'
  | 'email'
  | 'password'
  | 'rememberMe'
  | 'forgotPassword'
  | 'dontHaveAccount'
  | 'registerHere'
  | 'createNewAccount'
  | 'fullName'
  | 'yourName'
  | 'whatsapp'
  | 'createAStrongPassword'
  | 'registerAsAuthor'
  | 'createAccount'
  | 'alreadyHaveAccount'
  | 'loginHere'
  | 'authorsIFollow'
  | 'noFollowedAuthors'
  | 'booksFromAuthorsYouFollow'
  | 'noBooksFromFollowedAuthors'
  | 'favorites'
  | 'noFavoritesMessage'
  | 'purchaseHistory'
  | 'purchaseDate'
  | 'totalUsers'
  | 'booksOnPlatform'
  | 'totalRevenue'
  | 'platformAnalytics'
  | 'views'
  | 'visitors'
  | 'likes'
  | 'comments'
  | 'readingPerformance'
  | 'topReadBooks'
  | 'readers'
  | 'pendingApprovalBooks'
  | 'bookTitle'
  | 'author'
  | 'actions'
  | 'approve'
  | 'reject'
  | 'pendingApprovalAuthors'
  | 'name'
  | 'status'
  | 'financialReports'
  | 'searchAuthors'
  | 'paymentDetails'
  | 'totalSales'
  | 'authorCommission'
  | 'platformRevenue'
  | 'books'
  | 'manageUsers'
  | 'role'
  | 'user'
  | 'item'
  | 'searchUsers'
  | 'block'
  | 'activate'
  | 'manageAuthors'
  | 'addAuthor'
  | 'authorName'
  | 'authorBio'
  | 'photoUrl'
  | 'cancel'
  | 'manageBooks'
  | 'searchBooksAdmin'
  | 'addBook'
  | 'managePaymentMethods'
  | 'addPaymentMethod'
  | 'editPaymentMethod'
  | 'icon'
  | 'enabled'
  | 'disabled'
  | 'edit'
  | 'delete'
  | 'editBook'
  | 'updatePublicationDetails'
  | 'description'
  | 'generating'
  | 'regenerateWithAI'
  | 'priceMZN'
  | 'putOnSale'
  | 'salePrice'
  | 'saleStartDate'
  | 'saleEndDate'
  | 'highlightBook'
  | 'saveChanges'
  | 'confirmDeleteGeneral'
  | 'account'
  | 'myPurchases'
  | 'updates'
  | 'audiobooks'
  | 'notifications'
  | 'manageHiddenPurchases'
  | 'manageHiddenPurchasesDesc'
  | 'redeemGiftCard'
  | 'accountSettings'
  | 'signOut'
  | 'languageSelector'
  | 'sections'
  | 'toggleTheme'
  | 'markAllRead'
  | 'noNotifications'
  | 'viewDetails'
  | 'viewAll'
  | 'following'
  | 'follow'
  | 'contactAuthor'
  | 'searchBooks'
  | 'changePhoto'
  | 'paymentMethod'
  | 'enableNotifications'
  | 'enableEmailNotifications'
  | 'numPages'
  | 'selectAuthor'
  | 'createNewAuthor'
  | 'newCategoryName'
  | 'add'
  | 'generateWithAI'
  | 'uploadPDFHint'
  | 'uploading'
  | 'flipbookHint'
  | 'success'
  | 'overview'
  | 'salesAnalytics'
  | 'myBooks'
  | 'addNewBook'
  | 'pendingApproval'
  | 'readersCount'
  | 'salesCount'
  | 'revenue'
  | 'editDetails'
  | 'deleteBook'
  | 'bookCover'
  | 'bookFile'
  | 'clickToUpload'
  | 'orDragAndDrop'
  | 'fileSizeLimit'
  | 'showingResults'
  | 'continueWithGoogle'
  | 'signUpWithGoogle'
  | 'or'
  | 'changePassword'
  | 'newPassword'
  | 'confirmPassword'
  | 'passwordMismatch'
  | 'youBought'
  | 'bookPublished'
  | 'yourBook'
  | 'wasPublished'
  | 'recoverPassword'
  | 'enterEmailRecover'
  | 'sendRecoveryLink'
  | 'recoveryEmailSent'
  | 'recoveryEmailSentDesc'
  | 'backToLogin'
  | 'emailNotFound'
  | 'searchHistory'
  | 'clearHistory'
  | 'suggestions'
  | 'becomeAuthor'
  | 'becomeAuthorDesc'
  | 'onboardingExpTitle'
  | 'onboardingExpOption1'
  | 'onboardingExpOption2'
  | 'onboardingExpOption3'
  | 'onboardingGenreTitle'
  | 'onboardingGenreOption1'
  | 'onboardingGenreOption2'
  | 'onboardingGenreOption3'
  | 'onboardingGoalTitle'
  | 'onboardingGoalOption1'
  | 'onboardingGoalOption2'
  | 'onboardingGoalOption3'
  | 'onboardingStatusTitle'
  | 'onboardingStatusOption1'
  | 'onboardingStatusOption2'
  | 'onboardingStatusOption3'
  | 'continue'
  | 'creatingProfile'
  | 'tellUsWhatYouThink'
  | 'submitFeedback'
  | 'howWouldYouRateIt'
  | 'terrible'
  | 'bad'
  | 'okay'
  | 'good'
  | 'awesome'
  | 'skip'
  | 'recentReviews'
  | 'applicationDetails'
  | 'priceRange'
  | 'minPrice'
  | 'maxPrice'
  | 'publicationDate'
  | 'startDate'
  | 'endDate'
  | 'onSale'
  | 'mostRead'
  | 'recommended'
  | 'applyFilters'
  | 'filters'
  | 'loginSuccess'
  | 'logoutSuccess'
  | 'registeredSuccess'
  | 'bookAddedSuccess'
  | 'profileUpdatedSuccess'
  | 'favoriteAdded'
  | 'favoriteRemoved'
  | 'followingAuthor'
  | 'unfollowingAuthor'
  | 'bookApproved'
  | 'bookRejected'
  | 'authorApproved'
  | 'bookDeleted'
  | 'newPurchaseNotifTitle'
  | 'newPurchaseNotifMessage'
  | 'newAuthorPendingNotifTitle'
  | 'newAuthorPendingNotifMessage'
  | 'newBookPendingNotifTitle'
  | 'newBookPendingNotifMessage'
  | 'bookFeaturedNotifTitle'
  | 'bookFeaturedNotifMessage'
  | 'topSellersNotifTitle'
  | 'topSellersNotifMessage'
  | 'newReviewNotifTitle'
  | 'newReviewNotifMessage'
  | 'authorProfileUpdateNotifTitle'
  | 'authorProfileUpdateNotifMessage'
  | 'allBooks';

export const translations: Record<string, Record<TranslationKey, string>> = {
  pt: {
    home: 'Início',
    library: 'Biblioteca',
    bookStore: 'Loja',
    search: 'Pesquisar',
    dashboard: 'Painel',
    adminPanel: 'Painel Admin',
    accountPending: 'Sua conta de autor está pendente de aprovação.',
    accountBlocked: 'Sua conta foi bloqueada. Entre em contato com o suporte.',
    authorRegistrationPendingMessage: 'Registro realizado! Sua conta de autor aguarda aprovação.',
    cannotDeleteOwnAccount: 'Você não pode deletar sua própria conta.',
    featuredCollection: 'Coleção em Destaque',
    recentlyViewed: 'Vistos Recentemente',
    recommendedForYou: 'Recomendado para Você',
    categories: 'Categorias',
    topSellers: 'Mais Vendidos',
    freeBooks: 'Livros Gratuitos',
    paidBooks: 'Livros Pagos',
    libraryIsEmpty: 'Sua biblioteca está vazia',
    libraryIsEmptyDescription: 'Explore a loja para adicionar livros à sua coleção.',
    biography: 'Biografia',
    fictionAndLiterature: 'Ficção e Literatura',
    allTimeBestsellers: 'Best-sellers de Todos os Tempos',
    searchForBooksOrAuthors: 'Buscar por livros ou autores...',
    allCategories: 'Todas as Categorias',
    filterByAuthor: 'Filtrar por Autor',
    sortByRelevance: 'Relevância',
    sortByPriceAsc: 'Preço: Menor para Maior',
    sortByPriceDesc: 'Preço: Maior para Menor',
    sortByRating: 'Melhor Avaliados',
    sortByPublicationDate: 'Data de Publicação',
    activeFilters: 'Filtros Ativos',
    clearFilters: 'Limpar Filtros',
    noResultsFound: 'Nenhum resultado encontrado para',
    isFeatured: 'Destaque',
    removeFromFavorites: 'Remover dos Favoritos',
    addToFavorites: 'Adicionar aos Favoritos',
    book: 'Livro',
    saleSettings: 'Promoção',
    portuguese: 'Português',
    showPreview: 'Pré-visualização',
    read: 'Ler',
    buyNow: 'Comprar Agora',
    buy: 'Comprar',
    fromThePublisher: 'Da Editora',
    more: 'mais',
    less: 'menos',
    relatedAuthors: 'Autores Relacionados',
    reviews: 'Avaliações',
    writeReview: 'Avaliar Livro',
    yourRating: 'Sua avaliação',
    rating: 'Avaliação',
    yourComment: 'Seu comentário',
    submit: 'Enviar',
    loginToReview: 'Faça login para avaliar',
    login: 'Entrar',
    noReviewsYet: 'Ainda não há avaliações.',
    moreBy: 'Mais de',
    booksBy: 'Livros de',
    customersAlsoBought: 'Clientes também compraram',
    moreLikeThis: 'Semelhantes a este',
    information: 'Informações',
    category: 'Categoria',
    published: 'Publicado',
    language: 'Idioma',
    pages: 'Páginas',
    phoneNumber: 'Número de Telefone',
    phoneHint: 'Insira seu número de telefone para pagamento móvel.',
    cardNumber: 'Número do Cartão',
    expiryDate: 'Validade',
    paymentSuccessful: 'Pagamento Realizado!',
    preparingYourBook: 'Preparando seu livro...',
    completePurchase: 'Finalizar Compra',
    orderSummary: 'Resumo do Pedido',
    total: 'Total',
    selectPaymentMethod: 'Selecione o Método de Pagamento',
    processing: 'Processando...',
    pay: 'Pagar',
    loadingBook: 'Carregando livro...',
    readerSettings: 'Configurações de Leitura',
    fontSize: 'Tamanho da Fonte',
    lineHeight: 'Altura da Linha',
    theme: 'Tema',
    light: 'Claro',
    sepia: 'Sépia',
    dark: 'Escuro',
    draft: 'Rascunho',
    likedTheSample: 'Gostou da amostra?',
    buyToContinue: 'Compre o livro para continuar lendo.',
    invalidCredentials: 'Credenciais inválidas.',
    loginToYourAccount: 'Entre na sua conta',
    email: 'Email',
    password: 'Senha',
    rememberMe: 'Lembrar de mim',
    forgotPassword: 'Esqueceu a senha?',
    dontHaveAccount: 'Não tem uma conta?',
    registerHere: 'Registre-se aqui',
    createNewAccount: 'Criar nova conta',
    fullName: 'Nome Completo',
    yourName: 'Seu nome',
    whatsapp: 'WhatsApp',
    createAStrongPassword: 'Crie uma senha forte',
    registerAsAuthor: 'Registrar como Autor',
    createAccount: 'Criar Conta',
    alreadyHaveAccount: 'Já tem uma conta?',
    loginHere: 'Entre aqui',
    authorsIFollow: 'Autores que Sigo',
    noFollowedAuthors: 'Você ainda não segue nenhum autor.',
    booksFromAuthorsYouFollow: 'Livros de autores que você segue',
    noBooksFromFollowedAuthors: 'Nenhum livro encontrado dos autores que você segue.',
    favorites: 'Favoritos',
    noFavoritesMessage: 'Você ainda não tem favoritos.',
    purchaseHistory: 'Histórico de Compras',
    purchaseDate: 'Data da Compra',
    totalUsers: 'Total de Usuários',
    booksOnPlatform: 'Livros na Plataforma',
    totalRevenue: 'Receita Total',
    platformAnalytics: 'Analítica da Plataforma',
    views: 'Visualizações',
    visitors: 'Visitantes',
    likes: 'Curtidas',
    comments: 'Comentários',
    readingPerformance: 'Desempenho de Leitura',
    topReadBooks: 'Livros Mais Lidos',
    readers: 'Leitores',
    pendingApprovalBooks: 'Livros Pendentes de Aprovação',
    bookTitle: 'Título do Livro',
    author: 'Autor',
    actions: 'Ações',
    approve: 'Aprovar',
    reject: 'Rejeitar',
    pendingApprovalAuthors: 'Autores Pendentes',
    name: 'Nome',
    status: 'Status',
    financialReports: 'Relatórios Financeiros',
    searchAuthors: 'Buscar autores...',
    paymentDetails: 'Detalhes de Pagamento',
    totalSales: 'Vendas Totais',
    authorCommission: 'Comissão do Autor',
    platformRevenue: 'Receita da Plataforma',
    books: 'Livros',
    manageUsers: 'Gerenciar Usuários',
    role: 'Função',
    user: 'Usuário',
    item: 'Item',
    searchUsers: 'Buscar usuários...',
    block: 'Bloquear',
    activate: 'Ativar',
    manageAuthors: 'Gerenciar Autores',
    addAuthor: 'Adicionar Autor',
    authorName: 'Nome do Autor',
    authorBio: 'Biografia',
    photoUrl: 'URL da Foto',
    cancel: 'Cancelar',
    manageBooks: 'Gerenciar Livros',
    searchBooksAdmin: 'Buscar livros...',
    addBook: 'Adicionar Livro',
    managePaymentMethods: 'Gerenciar Métodos de Pagamento',
    addPaymentMethod: 'Adicionar Método',
    editPaymentMethod: 'Editar Método',
    icon: 'Ícone',
    enabled: 'Ativado',
    disabled: 'Desativado',
    edit: 'Editar',
    delete: 'Excluir',
    editBook: 'Editar Livro',
    updatePublicationDetails: 'Atualizar detalhes da publicação',
    description: 'Descrição',
    generating: 'Gerando...',
    regenerateWithAI: 'Regerar com IA',
    priceMZN: 'Preço (MZN)',
    putOnSale: 'Colocar em Promoção',
    salePrice: 'Preço Promocional',
    saleStartDate: 'Início da Promoção',
    saleEndDate: 'Fim da Promoção',
    highlightBook: 'Destacar Livro',
    saveChanges: 'Salvar Alterações',
    confirmDeleteGeneral: 'Tem certeza que deseja excluir {type} "{name}"?',
    account: 'Conta',
    myPurchases: 'Minhas Compras',
    updates: 'Atualizações',
    audiobooks: 'Audiolivros',
    notifications: 'Notificações',
    manageHiddenPurchases: 'Gerenciar Compras Ocultas',
    manageHiddenPurchasesDesc: 'Ver e restaurar compras ocultas.',
    redeemGiftCard: 'Resgatar Cartão Presente',
    accountSettings: 'Configurações da Conta',
    signOut: 'Sair',
    languageSelector: 'Seletor de Idioma',
    sections: 'Seções',
    toggleTheme: 'Alternar Tema',
    markAllRead: 'Marcar todas como lidas',
    noNotifications: 'Nenhuma notificação.',
    viewDetails: 'Ver detalhes',
    viewAll: 'Ver Todos',
    following: 'Seguindo',
    follow: 'Seguir',
    contactAuthor: 'Contatar Autor',
    searchBooks: 'Buscar livros...',
    changePhoto: 'Alterar Foto',
    paymentMethod: 'Método de Pagamento',
    enableNotifications: 'Habilitar Notificações',
    enableEmailNotifications: 'Notificações por Email',
    numPages: 'Número de Páginas',
    selectAuthor: 'Selecionar Autor',
    createNewAuthor: 'Criar Novo Autor',
    newCategoryName: 'Nome da Nova Categoria',
    add: 'Adicionar',
    generateWithAI: 'Gerar com IA',
    uploadPDFHint: 'Carregue seu PDF',
    uploading: 'Carregando...',
    flipbookHint: 'O livro (PDF) carregado aqui aparecerá no leitor como um flipbook.',
    success: 'Sucesso!',
    overview: 'Visão Geral',
    salesAnalytics: 'Análise de Vendas',
    myBooks: 'Meus Livros',
    addNewBook: 'Adicionar Novo Livro',
    pendingApproval: 'Pendente de Aprovação',
    readersCount: 'Leitores',
    salesCount: 'Vendas',
    revenue: 'Receita',
    editDetails: 'Editar Detalhes',
    deleteBook: 'Excluir Livro',
    bookCover: 'Capa do Livro',
    bookFile: 'Arquivo do Livro',
    clickToUpload: 'Clique para carregar',
    orDragAndDrop: 'ou arraste e solte',
    fileSizeLimit: 'Tamanho máx.',
    showingResults: 'Mostrando {start}-{end} de {total}',
    continueWithGoogle: 'Continuar com Google',
    signUpWithGoogle: 'Cadastrar com Google',
    or: 'ou',
    changePassword: 'Alterar Senha',
    newPassword: 'Nova Senha',
    confirmPassword: 'Confirmar Senha',
    passwordMismatch: 'As senhas não coincidem.',
    youBought: 'Você comprou',
    bookPublished: 'Livro Publicado',
    yourBook: 'Seu livro',
    wasPublished: 'foi publicado!',
    recoverPassword: 'Recuperar Senha',
    enterEmailRecover: 'Insira seu email para recuperar a senha.',
    sendRecoveryLink: 'Enviar Link de Recuperação',
    recoveryEmailSent: 'Email Enviado!',
    recoveryEmailSentDesc: 'Verifique sua caixa de entrada para redefinir sua senha.',
    backToLogin: 'Voltar para o Login',
    emailNotFound: 'Email não encontrado.',
    searchHistory: 'Histórico de Pesquisa',
    clearHistory: 'Limpar Histórico',
    suggestions: 'Sugestões',
    becomeAuthor: 'Torne-se um Autor',
    becomeAuthorDesc: 'Publique seus livros e alcance leitores em todo o mundo.',
    onboardingExpTitle: 'Como você se descreve como escritor?',
    onboardingExpOption1: 'Aspirante (Estou começando)',
    onboardingExpOption2: 'Hobby (Escrevo por diversão)',
    onboardingExpOption3: 'Profissional (Já publiquei antes)',
    onboardingGenreTitle: 'Qual é o seu gênero principal?',
    onboardingGenreOption1: 'Ficção (Romance, Fantasia, etc.)',
    onboardingGenreOption2: 'Não-Ficção (Biografia, Autoajuda)',
    onboardingGenreOption3: 'Acadêmico / Educacional',
    onboardingGoalTitle: 'Qual é seu principal objetivo?',
    onboardingGoalOption1: 'Ganhar Dinheiro',
    onboardingGoalOption2: 'Construir uma Audiência',
    onboardingGoalOption3: 'Apenas compartilhar minhas histórias',
    onboardingStatusTitle: 'Em que estágio você está?',
    onboardingStatusOption1: 'Tenho um livro pronto',
    onboardingStatusOption2: 'Ainda estou escrevendo',
    onboardingStatusOption3: 'Apenas planejando',
    continue: 'Continuar',
    creatingProfile: 'Criando seu perfil de autor...',
    tellUsWhatYouThink: 'Conte-nos o que você achou de',
    submitFeedback: 'Enviar Feedback',
    howWouldYouRateIt: 'Como você avaliaria?',
    terrible: 'Terrível',
    bad: 'Ruim',
    okay: 'Ok',
    good: 'Bom',
    awesome: 'Incrível',
    skip: 'Pular',
    recentReviews: 'Avaliações Recentes',
    applicationDetails: 'Detalhes da Candidatura',
    priceRange: 'Faixa de Preço',
    minPrice: 'Min',
    maxPrice: 'Max',
    publicationDate: 'Data de Publicação',
    startDate: 'Data Inicial',
    endDate: 'Data Final',
    onSale: 'Em Promoção',
    mostRead: 'Mais Lidos',
    recommended: 'Recomendados',
    applyFilters: 'Aplicar Filtros',
    filters: 'Filtros',
    loginSuccess: 'Login realizado com sucesso!',
    logoutSuccess: 'Você saiu da conta.',
    registeredSuccess: 'Conta criada com sucesso!',
    bookAddedSuccess: 'Livro adicionado com sucesso!',
    profileUpdatedSuccess: 'Informações atualizadas com sucesso.',
    favoriteAdded: 'Adicionado aos favoritos.',
    favoriteRemoved: 'Removido dos favoritos.',
    followingAuthor: 'Agora você está seguindo este autor.',
    unfollowingAuthor: 'Você deixou de seguir este autor.',
    bookApproved: 'Livro aprovado e publicado.',
    bookRejected: 'Livro rejeitado.',
    authorApproved: 'Autor aprovado.',
    bookDeleted: 'Livro excluído.',
    newPurchaseNotifTitle: 'Nova Compra',
    newPurchaseNotifMessage: 'O usuário {userName} comprou "{bookTitle}".',
    newAuthorPendingNotifTitle: 'Novo Autor Pendente',
    newAuthorPendingNotifMessage: '{userName} registrou-se como autor e aguarda aprovação.',
    newBookPendingNotifTitle: 'Novo Livro Pendente',
    newBookPendingNotifMessage: 'O autor {authorName} enviou o livro "{bookTitle}" para aprovação.',
    bookFeaturedNotifTitle: 'Livro em Destaque',
    bookFeaturedNotifMessage: 'O livro "{bookTitle}" foi marcado como destaque.',
    topSellersNotifTitle: 'Relatório Mensal',
    topSellersNotifMessage: 'Confira os livros mais vendidos deste mês no painel.',
    newReviewNotifTitle: 'Nova Avaliação',
    newReviewNotifMessage: '{userName} avaliou "{bookTitle}" com {rating} estrelas.',
    authorProfileUpdateNotifTitle: 'Perfil de Autor Atualizado',
    authorProfileUpdateNotifMessage: 'O autor {authorName} atualizou suas informações de perfil.',
    allBooks: 'Todos os Livros',
  },
  en: {
    home: 'Home',
    library: 'Library',
    bookStore: 'Store',
    search: 'Search',
    dashboard: 'Dashboard',
    adminPanel: 'Admin Panel',
    accountPending: 'Your author account is pending approval.',
    accountBlocked: 'Your account has been blocked. Contact support.',
    authorRegistrationPendingMessage: 'Registration successful! Your author account is awaiting approval.',
    cannotDeleteOwnAccount: 'You cannot delete your own account.',
    featuredCollection: 'Featured Collection',
    recentlyViewed: 'Recently Viewed',
    recommendedForYou: 'Recommended For You',
    categories: 'Categories',
    topSellers: 'Top Sellers',
    freeBooks: 'Free Books',
    paidBooks: 'Paid Books',
    libraryIsEmpty: 'Your library is empty',
    libraryIsEmptyDescription: 'Explore the store to add books to your collection.',
    biography: 'Biography',
    fictionAndLiterature: 'Fiction & Literature',
    allTimeBestsellers: 'All Time Bestsellers',
    searchForBooksOrAuthors: 'Search for books or authors...',
    allCategories: 'All Categories',
    filterByAuthor: 'Filter by Author',
    sortByRelevance: 'Relevance',
    sortByPriceAsc: 'Price: Low to High',
    sortByPriceDesc: 'Price: High to Low',
    sortByRating: 'Top Rated',
    sortByPublicationDate: 'Publication Date',
    activeFilters: 'Active Filters',
    clearFilters: 'Clear Filters',
    noResultsFound: 'No results found for',
    isFeatured: 'Featured',
    removeFromFavorites: 'Remove from Favorites',
    addToFavorites: 'Add to Favorites',
    book: 'Book',
    saleSettings: 'Sale Settings',
    portuguese: 'Portuguese',
    showPreview: 'Preview',
    read: 'Read',
    buyNow: 'Buy Now',
    buy: 'Buy',
    fromThePublisher: 'From the Publisher',
    more: 'more',
    less: 'less',
    relatedAuthors: 'Related Authors',
    reviews: 'Reviews',
    writeReview: 'Rate this Book',
    yourRating: 'Your Rating',
    rating: 'Rating',
    yourComment: 'Your Comment',
    submit: 'Submit',
    loginToReview: 'Login to review',
    login: 'Login',
    noReviewsYet: 'No reviews yet.',
    moreBy: 'More by',
    booksBy: 'Books by',
    customersAlsoBought: 'Customers also bought',
    moreLikeThis: 'More like this',
    information: 'Information',
    category: 'Category',
    published: 'Published',
    language: 'Language',
    pages: 'Pages',
    phoneNumber: 'Phone Number',
    phoneHint: 'Enter phone number for mobile payment.',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    paymentSuccessful: 'Payment Successful!',
    preparingYourBook: 'Preparing your book...',
    completePurchase: 'Complete Purchase',
    orderSummary: 'Order Summary',
    total: 'Total',
    selectPaymentMethod: 'Select Payment Method',
    processing: 'Processing...',
    pay: 'Pay',
    loadingBook: 'Loading book...',
    readerSettings: 'Reader Settings',
    fontSize: 'Font Size',
    lineHeight: 'Line Height',
    theme: 'Theme',
    light: 'Light',
    sepia: 'Sepia',
    dark: 'Dark',
    draft: 'Draft',
    likedTheSample: 'Liked the sample?',
    buyToContinue: 'Buy the book to continue reading.',
    invalidCredentials: 'Invalid credentials.',
    loginToYourAccount: 'Login to your account',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: 'Don\'t have an account?',
    registerHere: 'Register here',
    createNewAccount: 'Create new account',
    fullName: 'Full Name',
    yourName: 'Your Name',
    whatsapp: 'WhatsApp',
    createAStrongPassword: 'Create a strong password',
    registerAsAuthor: 'Register as Author',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login here',
    authorsIFollow: 'Authors I Follow',
    noFollowedAuthors: 'You are not following any authors yet.',
    booksFromAuthorsYouFollow: 'Books from authors you follow',
    noBooksFromFollowedAuthors: 'No books found from authors you follow.',
    favorites: 'Favorites',
    noFavoritesMessage: 'You have no favorites yet.',
    purchaseHistory: 'Purchase History',
    purchaseDate: 'Purchase Date',
    totalUsers: 'Total Users',
    booksOnPlatform: 'Books on Platform',
    totalRevenue: 'Total Revenue',
    platformAnalytics: 'Platform Analytics',
    views: 'Views',
    visitors: 'Visitors',
    likes: 'Likes',
    comments: 'Comments',
    readingPerformance: 'Reading Performance',
    topReadBooks: 'Top Read Books',
    readers: 'Readers',
    pendingApprovalBooks: 'Books Pending Approval',
    bookTitle: 'Book Title',
    author: 'Author',
    actions: 'Actions',
    approve: 'Approve',
    reject: 'Reject',
    pendingApprovalAuthors: 'Authors Pending Approval',
    name: 'Name',
    status: 'Status',
    financialReports: 'Financial Reports',
    searchAuthors: 'Search authors...',
    paymentDetails: 'Payment Details',
    totalSales: 'Total Sales',
    authorCommission: 'Author Commission',
    platformRevenue: 'Platform Revenue',
    books: 'Books',
    manageUsers: 'Manage Users',
    role: 'Role',
    user: 'User',
    item: 'Item',
    searchUsers: 'Search users...',
    block: 'Block',
    activate: 'Activate',
    manageAuthors: 'Manage Authors',
    addAuthor: 'Add Author',
    authorName: 'Author Name',
    authorBio: 'Author Bio',
    photoUrl: 'Photo URL',
    cancel: 'Cancel',
    manageBooks: 'Manage Books',
    searchBooksAdmin: 'Search books...',
    addBook: 'Add Book',
    managePaymentMethods: 'Manage Payment Methods',
    addPaymentMethod: 'Add Method',
    editPaymentMethod: 'Edit Method',
    icon: 'Icon',
    enabled: 'Enabled',
    disabled: 'Disabled',
    edit: 'Edit',
    delete: 'Delete',
    editBook: 'Edit Book',
    updatePublicationDetails: 'Update publication details',
    description: 'Description',
    generating: 'Generating...',
    regenerateWithAI: 'Regenerate with AI',
    priceMZN: 'Price (MZN)',
    putOnSale: 'Put on Sale',
    salePrice: 'Sale Price',
    saleStartDate: 'Sale Start Date',
    saleEndDate: 'Sale End Date',
    highlightBook: 'Highlight Book',
    saveChanges: 'Save Changes',
    confirmDeleteGeneral: 'Are you sure you want to delete {type} "{name}"?',
    account: 'Account',
    myPurchases: 'My Purchases',
    updates: 'Updates',
    audiobooks: 'Audiobooks',
    notifications: 'Notifications',
    manageHiddenPurchases: 'Manage Hidden Purchases',
    manageHiddenPurchasesDesc: 'View and restore hidden purchases.',
    redeemGiftCard: 'Redeem Gift Card',
    accountSettings: 'Account Settings',
    signOut: 'Sign Out',
    languageSelector: 'Language Selector',
    sections: 'Sections',
    toggleTheme: 'Toggle Theme',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications.',
    viewDetails: 'View details',
    viewAll: 'View All',
    following: 'Following',
    follow: 'Follow',
    contactAuthor: 'Contact Author',
    searchBooks: 'Search books...',
    changePhoto: 'Change Photo',
    paymentMethod: 'Payment Method',
    enableNotifications: 'Enable Notifications',
    enableEmailNotifications: 'Email Notifications',
    numPages: 'Number of Pages',
    selectAuthor: 'Select Author',
    createNewAuthor: 'Create New Author',
    newCategoryName: 'New Category Name',
    add: 'Add',
    generateWithAI: 'Generate with AI',
    uploadPDFHint: 'Upload your PDF',
    uploading: 'Uploading...',
    flipbookHint: 'The book (PDF) uploaded here will appear in the reader as a flipbook.',
    success: 'Success!',
    overview: 'Overview',
    salesAnalytics: 'Sales Analytics',
    myBooks: 'My Books',
    addNewBook: 'Add New Book',
    pendingApproval: 'Pending Approval',
    readersCount: 'Readers',
    salesCount: 'Sales',
    revenue: 'Revenue',
    editDetails: 'Edit Details',
    deleteBook: 'Delete Book',
    bookCover: 'Book Cover',
    bookFile: 'Book File',
    clickToUpload: 'Click to upload',
    orDragAndDrop: 'or drag and drop',
    fileSizeLimit: 'Max size',
    showingResults: 'Showing {start}-{end} of {total}',
    continueWithGoogle: 'Continue with Google',
    signUpWithGoogle: 'Sign up with Google',
    or: 'or',
    changePassword: 'Change Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordMismatch: 'Passwords do not match.',
    youBought: 'You bought',
    bookPublished: 'Book Published',
    yourBook: 'Your book',
    wasPublished: 'has been published!',
    recoverPassword: 'Recover Password',
    enterEmailRecover: 'Enter your email to recover your password.',
    sendRecoveryLink: 'Send Recovery Link',
    recoveryEmailSent: 'Email Sent!',
    recoveryEmailSentDesc: 'Check your inbox to reset your password.',
    backToLogin: 'Back to Login',
    emailNotFound: 'Email not found.',
    searchHistory: 'Search History',
    clearHistory: 'Clear History',
    suggestions: 'Suggestions',
    becomeAuthor: 'Become an Author',
    becomeAuthorDesc: 'Publish your books and reach readers worldwide.',
    onboardingExpTitle: 'How do you describe yourself as a writer?',
    onboardingExpOption1: 'Aspiring (Just starting)',
    onboardingExpOption2: 'Hobbyist (Writing for fun)',
    onboardingExpOption3: 'Professional (Published before)',
    onboardingGenreTitle: 'What is your primary genre?',
    onboardingGenreOption1: 'Fiction (Romance, Fantasy, etc.)',
    onboardingGenreOption2: 'Non-Fiction (Biography, Self-help)',
    onboardingGenreOption3: 'Academic / Educational',
    onboardingGoalTitle: 'What is your main goal?',
    onboardingGoalOption1: 'Earn Money',
    onboardingGoalOption2: 'Build an Audience',
    onboardingGoalOption3: 'Just share my stories',
    onboardingStatusTitle: 'What stage are you at?',
    onboardingStatusOption1: 'I have a book ready',
    onboardingStatusOption2: 'I am still writing',
    onboardingStatusOption3: 'Just planning',
    continue: 'Continue',
    creatingProfile: 'Creating your author profile...',
    tellUsWhatYouThink: 'Tell us what you think of',
    submitFeedback: 'Submit Feedback',
    howWouldYouRateIt: 'How would you rate it?',
    terrible: 'Terrible',
    bad: 'Bad',
    okay: 'Okay',
    good: 'Good',
    awesome: 'Awesome',
    skip: 'Skip',
    recentReviews: 'Recent Reviews',
    applicationDetails: 'Application Details',
    priceRange: 'Price Range',
    minPrice: 'Min',
    maxPrice: 'Max',
    publicationDate: 'Publication Date',
    startDate: 'Start Date',
    endDate: 'End Date',
    onSale: 'On Sale',
    mostRead: 'Most Read',
    recommended: 'Recommended',
    applyFilters: 'Apply Filters',
    filters: 'Filters',
    loginSuccess: 'Login Successful!',
    logoutSuccess: 'You have logged out.',
    registeredSuccess: 'Account created successfully!',
    bookAddedSuccess: 'Book added successfully!',
    profileUpdatedSuccess: 'Profile updated successfully.',
    favoriteAdded: 'Added to favorites.',
    favoriteRemoved: 'Removed from favorites.',
    followingAuthor: 'You are now following this author.',
    unfollowingAuthor: 'You have unfollowed this author.',
    bookApproved: 'Book approved and published.',
    bookRejected: 'Book rejected.',
    authorApproved: 'Author approved.',
    bookDeleted: 'Book deleted.',
    newPurchaseNotifTitle: 'New Purchase',
    newPurchaseNotifMessage: 'User {userName} purchased "{bookTitle}".',
    newAuthorPendingNotifTitle: 'New Pending Author',
    newAuthorPendingNotifMessage: '{userName} has registered as an author and is awaiting approval.',
    newBookPendingNotifTitle: 'New Pending Book',
    newBookPendingNotifMessage: 'Author {authorName} submitted the book "{bookTitle}" for approval.',
    bookFeaturedNotifTitle: 'Book Featured',
    bookFeaturedNotifMessage: 'The book "{bookTitle}" was marked as featured.',
    topSellersNotifTitle: 'Monthly Report',
    topSellersNotifMessage: 'Check out this month\'s top selling books in the dashboard.',
    newReviewNotifTitle: 'New Review',
    newReviewNotifMessage: '{userName} reviewed "{bookTitle}" with {rating} stars.',
    authorProfileUpdateNotifTitle: 'Author Profile Updated',
    authorProfileUpdateNotifMessage: 'Author {authorName} updated their profile information.',
    allBooks: 'All Books',
  }
};
