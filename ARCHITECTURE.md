# GreenMint — Arquitetura Técnica

## 1. Visão geral

O GreenMint é um marketplace de NFTs desenvolvido com React e TypeScript, utilizando uma arquitetura frontend baseada em funcionalidades (feature-based architecture).

A aplicação utiliza uma API REST simulada com Mock Service Worker (MSW), permitindo executar os principais fluxos de navegação, autenticação, carrinho e compra sem depender de um backend externo.

## 2. Tecnologias e responsabilidades

| Tecnologia | Responsabilidade |
|---|---|
| React | Construção da interface |
| TypeScript | Tipagem estática e contratos de dados |
| Vite | Desenvolvimento e build |
| Tailwind CSS | Estilização responsiva |
| TanStack Router | Navegação e parâmetros de URL |
| TanStack Query | Cache, consultas e mutações assíncronas |
| Axios | Cliente HTTP |
| MSW | Simulação da API REST |
| Socket.IO | Infraestrutura de comunicação em tempo real |
| Playwright | Testes de ponta a ponta |

## 3. Organização do código

O diretório `src/features` separa as funcionalidades principais:

- `catalog`: listagem, busca, filtros e detalhes dos NFTs.
- `cart`: gerenciamento dos itens e cupons.
- `checkout`: finalização de compras e consulta de pedidos.
- `auth`: cadastro, login e gerenciamento da sessão.
- `account`: perfil do colecionador e histórico de compras.

Os diretórios compartilhados incluem:

- `services`: comunicação HTTP por meio do Axios.
- `mocks`: handlers, dados simulados e persistência.
- `types`: contratos TypeScript.
- `components`: componentes reutilizáveis.
- `app`: configuração de rotas.

## 4. Fluxo de dados

O fluxo principal segue a estrutura:

Componente React → Hook TanStack Query → Serviço Axios → Handler MSW → Dados simulados

As consultas utilizam chaves de cache para controlar carregamento e atualização.

As mutações invalidam consultas relacionadas quando necessário, permitindo atualizar a interface após alterações no carrinho ou criação de pedidos.

## 5. Catálogo e navegação

O catálogo utiliza TanStack Router para armazenar parâmetros de busca, filtros, ordenação e paginação na URL.

Essa abordagem permite compartilhar links com filtros aplicados e preservar o estado de navegação.

A busca utiliza debounce para reduzir requisições durante a digitação.

## 6. Carrinho e valores monetários

O carrinho é gerenciado pela API simulada.

Os valores em ETH são calculados utilizando inteiros com `BigInt`, evitando problemas de precisão associados a operações monetárias com números de ponto flutuante.

A API valida quantidades, disponibilidade e cupons antes de atualizar o carrinho.

## 7. Autenticação e isolamento

A autenticação utiliza endpoints simulados para cadastro, login, consulta de sessão e logout.

O cliente envia um token nas requisições autenticadas.

Os carrinhos e pedidos são associados ao identificador do usuário autenticado. Para visitantes, utiliza-se um identificador de sessão separado.

A consulta de pedidos verifica a associação entre o pedido e seu proprietário.

Limitação: como o MSW e o armazenamento estão no navegador, esse mecanismo demonstra o fluxo de autorização, mas não oferece a segurança de um backend real.

## 8. Checkout e idempotência

O checkout permite selecionar carteira, rede e informar um endereço de carteira.

A criação de pedidos utiliza uma chave de idempotência, permitindo reconhecer tentativas repetidas de uma mesma operação.

Após uma compra confirmada, a API simulada registra o pedido, atualiza o estoque e limpa o carrinho correspondente.

Nenhuma transação real é enviada para uma blockchain.

## 9. Persistência

Os dados simulados são armazenados no `localStorage`.

Isso permite preservar usuários, sessões, carrinhos, pedidos e estoque após atualizar a página.

Os dados não são compartilhados entre navegadores ou dispositivos, pois não existe um banco de dados centralizado.

## 10. Comunicação em tempo real

A aplicação possui um cliente Socket.IO e um servidor local separado.

O cliente registra listeners para eventos `nft.updated` e `order.updated`, que invalidam consultas relacionadas no TanStack Query.

A infraestrutura também contempla conexão, desconexão e tentativas de reconexão.

O servidor de eventos não faz parte do deploy estático da Vercel. A publicação de eventos a partir das operações da API simulada ainda precisa ser integrada e validada.

## 11. Testes

O Playwright é utilizado para executar testes de ponta a ponta.

Os cenários implementados incluem navegação pelo catálogo, consulta de detalhes e fluxo de compra até a confirmação do pedido.

A aplicação também possui estados de carregamento e erro para consultas assíncronas.

## 12. Deploy

O frontend é publicado na Vercel, com integração ao GitHub.

O MSW permite que a demonstração funcione sem um backend REST hospedado.

A configuração de rotas permite acessar diretamente as páginas da aplicação.

## 13. Evoluções futuras

Entre as possibilidades de evolução estão:

- Integração completa dos eventos Socket.IO com as operações simuladas.
- Backend real com autenticação e persistência centralizada.
- Integração com carteiras e redes blockchain.
- Ampliação da cobertura de testes automatizados.
- Monitoramento de desempenho e acessibilidade.

---

GreenMint — NFT Marketplace

Arquitetura desenvolvida para demonstrar organização de código, integração de APIs, gerenciamento de estado assíncrono, persistência simulada e testes de interface.