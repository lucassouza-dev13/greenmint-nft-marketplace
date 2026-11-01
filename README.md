# GreenMint — NFT Marketplace

Marketplace de NFTs desenvolvido com React e TypeScript como parte de um desafio técnico de Frontend.

A aplicação permite explorar coleções digitais, consultar detalhes de NFTs, gerenciar um carrinho, simular compras e acompanhar pedidos por meio de uma área do colecionador.

O projeto utiliza uma API REST simulada com Mock Service Worker (MSW), permitindo testar fluxos completos sem depender de um backend ou de uma blockchain real.

## Demonstração

Aplicação: https://greenmint-nft-marketplace.vercel.app/

Repositório: https://github.com/lucassouza-dev13/greenmint-nft-marketplace

## Tecnologias

- React + TypeScript: interface e tipagem estática.
- Vite: ambiente de desenvolvimento e build.
- Tailwind CSS: estilização e responsividade.
- TanStack Router: navegação e parâmetros de URL.
- TanStack Query: consultas, mutações e gerenciamento de cache.
- Axios: comunicação com a API REST.
- Mock Service Worker (MSW): simulação dos endpoints HTTP.
- Socket.IO: infraestrutura de comunicação em tempo real.
- Lucide React: ícones da interface.
- Playwright: testes automatizados de ponta a ponta.

## Funcionalidades implementadas

### Catálogo de NFTs

- Listagem de NFTs com imagens, nomes, coleções e preços.
- Busca textual com debounce.
- Filtros por rede e coleção.
- Ordenação por preço e novidades.
- Paginação e persistência dos parâmetros de navegação na URL.
- Consulta de detalhes, edições e disponibilidade.

### Carrinho de compras

- Adição e remoção de NFTs.
- Atualização de quantidades.
- Validação de disponibilidade.
- Aplicação e remoção de cupons promocionais.
- Cálculo de subtotal, desconto e total em ETH.
- Persistência dos dados no navegador.

Cupons disponíveis para teste: `GREEN10` e `WELCOME5`.

### Checkout e pedidos

- Seleção de carteira digital simulada.
- Seleção de rede de pagamento.
- Validação dos dados informados.
- Criação de pedidos por meio da API simulada.
- Uso de chave de idempotência para evitar pedidos duplicados.
- Atualização do estoque após a compra.
- Página de confirmação com detalhes do pedido.
- Consulta de pedidos anteriormente realizados.

Importante: não existe transferência real de criptomoedas nem integração com blockchain.

### Autenticação e área do colecionador

- Cadastro de usuário.
- Login e logout.
- Consulta do usuário autenticado.
- Carrinhos separados por usuário.
- Controle de acesso aos pedidos na API simulada.
- Página Minha conta com informações do perfil.
- Histórico de compras e indicadores de NFTs adquiridos.

A autenticação é demonstrativa e não substitui um serviço de autenticação seguro em produção.

## Como executar localmente

### Pré-requisitos

- Node.js 20 ou superior.
- npm.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/lucassouza-dev13/greenmint-nft-marketplace.git
```

Entre na pasta:

```bash
cd greenmint-nft-marketplace
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_ENABLE_MOCKS=true
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse:

http://localhost:5173

O comando de desenvolvimento também inicia o servidor Socket.IO local.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o frontend e o servidor Socket.IO |
| `npm run dev:client` | Inicia apenas o Vite |
| `npm run dev:socket` | Inicia o servidor Socket.IO |
| `npm run build` | Executa a verificação TypeScript e gera o build |
| `npm run preview` | Visualiza o build de produção |
| `npm run lint` | Executa a análise estática |
| `npx playwright test` | Executa os testes E2E |

## Testes automatizados

O projeto utiliza Playwright para validar fluxos reais da interface.

Cenários implementados:

- Carregamento do catálogo.
- Navegação para os detalhes de um NFT.
- Fluxo de compra: catálogo, carrinho, checkout e confirmação de pedido.
- Persistência da confirmação após atualização da página.

Para executar os testes:

```bash
npx playwright test
```

Os testes utilizam uma configuração local de mocks e o navegador Chromium.

## Organização do projeto

```text
greenmint/
├── public/
│   └── nfts/
├── server/
│   └── socket.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── account/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── catalog/
│   │   └── checkout/
│   ├── lib/
│   ├── mocks/
│   ├── services/
│   └── types/
├── tests/
├── playwright.config.ts
└── vercel.json
```

O código é organizado por funcionalidades, separando componentes, hooks, serviços, tipos e handlers da API simulada.

## API simulada

O MSW intercepta requisições HTTP e fornece respostas para os principais fluxos:

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/nfts` | Listar e filtrar NFTs |
| GET | `/api/nfts/:id` | Consultar NFT |
| GET | `/api/cart` | Consultar carrinho |
| POST | `/api/cart/items` | Adicionar item |
| PATCH | `/api/cart/items/:id` | Atualizar quantidade |
| DELETE | `/api/cart/items/:id` | Remover item |
| POST | `/api/orders` | Criar pedido |
| GET | `/api/orders` | Consultar histórico |
| GET | `/api/orders/:orderId` | Consultar pedido |
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Autenticar usuário |
| GET | `/api/auth/me` | Consultar sessão |
| POST | `/api/auth/logout` | Encerrar sessão |

Os dados simulados são persistidos no `localStorage`, permitindo manter carrinhos, usuários, estoque e pedidos após atualizar a página.

## Comunicação em tempo real

## Comunicação em tempo real

O GreenMint possui uma arquitetura preparada para comunicação em tempo real utilizando Socket.IO, integrada ao TanStack Query.

O cliente gerencia conexões e reconexões e possui listeners para eventos como `nft.updated` e `order.updated`, permitindo a invalidação de consultas e a atualização dos dados exibidos na interface.

A infraestrutura de eventos conta com um servidor Socket.IO local, separado da aplicação frontend.
## Limitações conhecidas

- O projeto utiliza dados e autenticação simulados.
- O armazenamento é local a cada navegador/dispositivo; não há banco de dados compartilhado.
- As compras não movimentam ativos reais.
- A confirmação do pedido é simulada.
- A infraestrutura Socket.IO local não representa um serviço de eventos implantado em produção.
- A implementação não deve ser utilizada para pagamentos reais ou armazenamento de credenciais sensíveis.

## Deploy

O frontend está publicado na Vercel, com integração ao repositório GitHub.

O ambiente publicado utiliza o MSW para simular os endpoints necessários à navegação e aos fluxos de compra.

As rotas da aplicação são tratadas como uma SPA, permitindo acessar páginas diretamente pela URL.

## Arquitetura

As decisões técnicas, os fluxos de dados e as limitações da solução são detalhados no arquivo `ARCHITECTURE.md`.

---

GreenMint — NFT Marketplace

Projeto desenvolvido para demonstrar competências em React, TypeScript, integração REST, gerenciamento de estado assíncrono, testes automatizados e desenvolvimento de interfaces responsivas.