# Biblioteca Online

Aplicativo de descoberta de livros com interface em português. O projeto usa Expo e React Native e pode ser executado na web, Android e iOS.

## Funcionalidades

- Cadastro e login de leitores durante a sessão atual, com senha de no mínimo 6 caracteres.
- Catálogo inicial de livros, com busca por título ou autor e filtro por categoria.
- Tela de detalhes com descrição, preço e opção de adicionar livros ao carrinho.
- Carrinho com ajuste de quantidades, remoção de itens e resumo do pedido.
- Checkout demonstrativo com QR Code Pix de exemplo e formulário de cartão que não envia nem armazena dados.
- Área de administrador para publicar e editar livros com gêneros pré-definidos, excluir títulos e escolher uma foto para a capa.
- Layout adaptado para dispositivos móveis e execução na web.

### Acesso de demonstração

Na tela de login, use:

- **Nome:** `admin`
- **Senha:** `admin123`

Esse acesso existe apenas para demonstração e não deve ser usado em produção.

## Requisitos

- Node.js e npm instalados.
- Para testar em um dispositivo físico, o aplicativo Expo Go ou um dispositivo/emulador configurado.

## Como executar

Na pasta do projeto, instale as dependências:

```bash
npm install
```

Inicie o servidor Expo:

```bash
npm start
```

No terminal do Expo, escolha a plataforma desejada. Também é possível iniciar diretamente:

```bash
npm run web
npm run android
npm run ios
```

Os comandos Android e iOS iniciam o projeto pelo Expo; a execução nativa depende de um dispositivo ou ambiente de desenvolvimento configurado.

## Uso do aplicativo

1. Abra o app e entre com a conta de demonstração ou crie uma conta.
2. Na biblioteca, pesquise por título ou autor e selecione uma categoria para filtrar os livros.
3. Toque em um livro para ver os detalhes e o preço; use **Adicionar ao carrinho** para incluí-lo no pedido.
4. No carrinho, ajuste quantidades ou remova itens e avance para escolher entre Pix, débito ou crédito.
5. O checkout exibe um QR Code Pix demonstrativo ou campos de cartão para teste. Não use dados reais: nenhuma cobrança é realizada.
6. Para gerenciar o catálogo, entre como administrador. Use **Publicar um livro** para adicionar um título; na tela de detalhes, use **Editar informações do livro** para alterar os dados. Para excluir, toque em **Excluir livro** no cartão e confirme a ação.

## Estrutura do projeto

```text
.
├── app/
│   ├── App.tsx                 # Estado principal e navegação entre telas
│   ├── AuthScreen.tsx          # Formulários compartilhados de login e cadastro
│   ├── LoginScreen.tsx         # Tela de login
│   ├── RegisterScreen.tsx      # Tela de cadastro
│   ├── HomeScreen.tsx          # Catálogo, busca e filtros
│   ├── BookDetailScreen.tsx    # Detalhes e adição ao carrinho
│   ├── CartScreen.tsx          # Itens, quantidades e total do carrinho
│   ├── CheckoutScreen.tsx      # Opções de pagamento demonstrativas
│   ├── AdminBookScreen.tsx     # Formulário de publicação de livros
│   ├── books.ts                # Tipos, catálogo inicial e formatação de preço
│   └── types.ts                # Tipos das telas e da autenticação
├── assets/                     # Ícones e imagens da aplicação
├── fotos/                      # Imagens da biblioteca
├── index.ts                    # Registro da aplicação Expo
└── app.json                    # Configuração do Expo
```

## Tecnologias

- Expo SDK 57
- React 19
- React Native 0.86
- React Native Web
- TypeScript
- `expo-image-picker` para selecionar capas da galeria

## Verificações

Executar o linter:

```bash
npm run lint
```

Verificar os tipos TypeScript:

```bash
npx tsc --noEmit
```

## Limitações da demonstração

- Contas, sessão e livros publicados ficam somente no estado em memória do aplicativo. Eles são perdidos ao fechar ou recarregar o app.
- Não há servidor, banco de dados ou autenticação persistente.
- A conta de demonstração tem credenciais fixas; as contas criadas não devem ser consideradas protegidas.
- O QR Code Pix contém uma chave fictícia e não pode ser pago.
- O formulário de cartão serve apenas para demonstração; os dados ficam somente no estado temporário da tela, são apagados ao confirmar e não são enviados.
- A confirmação de pedido não processa pagamentos nem organiza entrega.
- Para uso real, será necessário integrar um provedor de pagamentos, além de serviços de autenticação e armazenamento de dados.
- Para uso real, será necessário integrar serviços de autenticação, armazenamento de dados e pagamentos, além de remover as credenciais de demonstração.
