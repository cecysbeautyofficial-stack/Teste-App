
// Brand Colors
const COLORS = {
  primary: '#262261', // Brand Blue
  secondary: '#EE4036', // Brand Red
  text: '#333333',
  bg: '#f4f4f4',
  white: '#ffffff'
};

const LOGO_URL = "https://lh3.googleusercontent.com/d/1sOwYdoOunLfOpdoa0ycGyc2L-tDD15Qn";

const getBaseStyles = () => `
  body { font-family: 'Montserrat', sans-serif; line-height: 1.6; color: ${COLORS.text}; background-color: ${COLORS.bg}; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: ${COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
  .header { background: ${COLORS.primary}; padding: 30px 20px; text-align: center; }
  .header img { height: 45px; object-fit: contain; }
  .content { padding: 40px 30px; }
  .h1 { color: ${COLORS.primary}; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; }
  .h2 { color: ${COLORS.primary}; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; }
  .p { margin-bottom: 15px; color: #555; font-size: 15px; }
  .button { display: inline-block; background: ${COLORS.secondary}; color: ${COLORS.white} !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; margin-top: 25px; text-align: center; font-size: 16px; box-shadow: 0 4px 6px rgba(238, 64, 54, 0.2); }
  .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
  .divider { height: 1px; background-color: #eee; margin: 25px 0; }
  .info-box { background: #f0f8ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px; }
  .price { color: ${COLORS.secondary}; font-weight: 700; font-size: 18px; }
  strong { color: ${COLORS.primary}; }
`;

const wrapEmail = (content: string, title: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <style>${getBaseStyles()}</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${LOGO_URL}" alt="Leia Aqui">
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Leia Aqui Oficial. Todos os direitos reservados.</p>
        <p>Maputo, Moçambique</p>
        <p style="margin-top: 10px;">
          <a href="#" style="color: #999; text-decoration: none; margin: 0 5px;">Termos</a> | 
          <a href="#" style="color: #999; text-decoration: none; margin: 0 5px;">Privacidade</a>
        </p>
      </div>
    </div>
  </body>
  </html>
`;

export const templates = {
  welcome: (userName: string) => wrapEmail(`
    <h1 class="h1">Bem-vindo ao Leia Aqui, ${userName}!</h1>
    <p class="p">Estamos muito felizes por você ter se juntado à nossa comunidade de leitores e autores.</p>
    <p class="p">No <strong>Leia Aqui</strong>, você pode:</p>
    <ul style="padding-left: 20px; color: #555; margin-bottom: 20px;">
      <li style="margin-bottom: 10px;">Explorar uma vasta biblioteca de livros digitais.</li>
      <li style="margin-bottom: 10px;">Apoiar autores locais de Moçambique e do mundo.</li>
      <li style="margin-bottom: 10px;">Ler seus livros favoritos em qualquer lugar, a qualquer hora.</li>
    </ul>
    <p class="p">Comece sua jornada literária agora mesmo!</p>
    <center><a href="#" class="button">Explorar Livros</a></center>
  `, "Bem-vindo ao Leia Aqui"),

  purchaseReceipt: (userName: string, bookTitle: string, price: string, orderId: string) => wrapEmail(`
    <h1 class="h1">Recibo de Compra</h1>
    <p class="p">Olá, ${userName}.</p>
    <p class="p">Obrigado por sua compra! Aqui estão os detalhes do seu pedido:</p>
    
    <div class="info-box">
      <p style="margin: 5px 0;"><strong>Nº do Pedido:</strong> ${orderId}</p>
      <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; color: #555;">${bookTitle}</td>
        <td style="padding: 10px 0; text-align: right; color: #333; font-weight: 600;">${price}</td>
      </tr>
      <tr>
        <td style="padding: 15px 0; font-weight: 700; color: #262261;">Total</td>
        <td style="padding: 15px 0; text-align: right;" class="price">${price}</td>
      </tr>
    </table>

    <p class="p">Seu livro já está disponível na sua biblioteca digital.</p>
    <center><a href="#" class="button">Ler Agora</a></center>
  `, "Recibo da Sua Compra"),

  authorWelcome: (userName: string) => wrapEmail(`
    <h1 class="h1">Candidatura Recebida</h1>
    <p class="p">Olá, ${userName}!</p>
    <p class="p">Recebemos seu registro para se tornar um autor no <strong>Leia Aqui</strong>.</p>
    <p class="p">Nossa equipe está revisando seu perfil. Este processo geralmente leva até 48 horas. Você receberá um email assim que sua conta for aprovada.</p>
    <div class="info-box">
      <p style="margin: 0;">Enquanto isso, complete seu perfil para aumentar suas chances de aprovação rápida.</p>
    </div>
    <center><a href="#" class="button">Ir para o Painel</a></center>
  `, "Candidatura de Autor"),

  authorApproved: (userName: string) => wrapEmail(`
    <h1 class="h1">Parabéns, Autor! 🎉</h1>
    <p class="p">Olá, ${userName}.</p>
    <p class="p">Temos o prazer de informar que sua conta de autor foi <strong>aprovada</strong>!</p>
    <p class="p">Agora você pode publicar seus livros, gerenciar suas vendas e conectar-se com leitores diretamente através do seu painel.</p>
    <p class="p">Estamos ansiosos para ler suas obras.</p>
    <center><a href="#" class="button">Publicar Meu Primeiro Livro</a></center>
  `, "Conta de Autor Aprovada"),

  bookPublished: (userName: string, bookTitle: string) => wrapEmail(`
    <h1 class="h1">Livro Publicado!</h1>
    <p class="p">Olá, ${userName}.</p>
    <p class="p">Boas notícias! Seu livro <strong>"${bookTitle}"</strong> foi aprovado e publicado com sucesso na nossa loja.</p>
    <p class="p">Agora ele está visível para milhares de leitores. Compartilhe o link com seus amigos e nas redes sociais!</p>
    <center><a href="#" class="button">Ver Livro na Loja</a></center>
  `, "Livro Publicado com Sucesso"),

  passwordReset: (link: string) => wrapEmail(`
    <h1 class="h1">Recuperação de Senha</h1>
    <p class="p">Recebemos uma solicitação para redefinir a senha da sua conta no Leia Aqui.</p>
    <p class="p">Se você não fez esta solicitação, pode ignorar este email com segurança.</p>
    <p class="p">Para definir uma nova senha, clique no botão abaixo:</p>
    <center><a href="${link}" class="button">Redefinir Senha</a></center>
    <p class="p" style="margin-top: 20px; font-size: 13px;">Este link expira em 1 hora.</p>
  `, "Redefinir Senha")
};
