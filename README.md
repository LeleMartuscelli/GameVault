# 🎮 GameVault

GameVault é uma aplicação web desenvolvida para organizar e acompanhar uma biblioteca pessoal de jogos.

O sistema permite cadastrar, visualizar, editar e excluir jogos, acompanhar horas jogadas, visualizar estatísticas, controlar o status dos jogos e gerenciar favoritos através de uma interface moderna e responsiva.

O projeto foi desenvolvido como parte da disciplina **Software Project**, do curso de **Análise e Desenvolvimento de Sistemas**, evoluindo de uma aplicação front-end com armazenamento local para uma arquitetura integrada entre **front-end e API REST**.

## 🌐 Projeto online

Acesse a aplicação publicada:

https://game-vault-three-ebon.vercel.app/

### API

A API do GameVault está publicada no Render:

https://gamevault-vuz1.onrender.com/api/games

> O backend utiliza o plano gratuito do Render e pode levar cerca de 50 segundos ou mais para iniciar após um período de inatividade.

## 📸 Preview

### Dashboard

![Dashboard do GameVault](./screenshots/dashboard.png)

### Biblioteca

![Biblioteca do GameVault](./screenshots/biblioteca.png)

### Detalhes do jogo

![Detalhes de um jogo no GameVault](./screenshots/detalhes.png)

## ✨ Funcionalidades

- Dashboard com visão geral da biblioteca
- Estatísticas atualizadas dinamicamente
- Listagem dos jogos através da API
- Cadastro de novos jogos
- Visualização dos detalhes de cada jogo
- Edição de jogos cadastrados
- Exclusão de jogos
- Busca de jogos pelo nome
- Sistema de favoritos
- Página dedicada aos jogos favoritos
- Controle de status dos jogos
- Validação dos dados enviados para a API
- Tratamento de jogos não encontrados
- Integração completa entre front-end e backend
- Layout responsivo para desktop e dispositivos móveis
- Tratamento de estados vazios

## 🔄 Operações CRUD

A API REST implementa as principais operações de gerenciamento dos jogos:

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/api/games` | Listar todos os jogos |
| `GET` | `/api/games/:id` | Buscar um jogo pelo ID |
| `POST` | `/api/games` | Cadastrar um novo jogo |
| `PUT` | `/api/games/:id` | Atualizar um jogo |
| `DELETE` | `/api/games/:id` | Excluir um jogo |

## 🛠️ Tecnologias

### Front-end

- React
- TypeScript
- Vite
- React Router DOM
- Lucide React
- CSS

### Backend

- Node.js
- Express
- CORS
- Nodemon

### Ferramentas e deploy

- Git
- GitHub
- GitHub Projects
- Visual Studio Code
- Vercel
- Render

## 🏗️ Arquitetura

O GameVault está atualmente dividido em duas partes principais:

**Front-end:** responsável pela interface, navegação, formulários, estatísticas e interação com o usuário.

**Backend:** responsável pela API REST, regras de validação e operações CRUD dos jogos.

O front-end se comunica com o backend através de requisições HTTP utilizando a Fetch API.

```text
Usuário
   │
   ▼
React + TypeScript
   │
   │ HTTP / Fetch
   ▼
API REST
Node.js + Express
   │
   ▼
Dados em memória
```

A persistência definitiva em banco de dados será implementada em uma etapa posterior do projeto.

## 📂 Estrutura do projeto

```text
GameVault/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── data/
│   │   └── routes/
│   ├── package.json
│   └── server.js
│
├── src/
│   ├── assets/
│   │   └── games/
│   ├── components/
│   │   └── Sidebar/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   │   ├── AddGame/
│   │   ├── Dashboard/
│   │   ├── EditGame/
│   │   ├── Favorites/
│   │   ├── GameDetails/
│   │   └── Library/
│   ├── services/
│   │   └── gameApi.ts
│   ├── types/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
└── README.md
```

## 🚀 Como executar o projeto

### Pré-requisitos

Antes de começar, é necessário ter o **Node.js**, **npm** e **Git** instalados.

### 1. Clonar o repositório

```bash
git clone https://github.com/LeleMartuscelli/GameVault.git
```

Entre na pasta:

```bash
cd GameVault
```

### 2. Executar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm run dev
```

Por padrão, a API ficará disponível em:

```text
http://localhost:3000
```

### 3. Executar o front-end

Abra outro terminal e volte para a raiz do projeto:

```bash
cd ..
```

Instale as dependências do front-end, caso ainda não tenha feito:

```bash
npm install
```

Execute:

```bash
npm run dev
```

Depois, abra no navegador o endereço exibido pelo Vite.

## ⚙️ Variável de ambiente

Em produção, o front-end utiliza a variável:

```text
VITE_API_URL
```

Ela define o endereço da API utilizada pela aplicação.

Caso a variável não esteja configurada, o ambiente de desenvolvimento utiliza:

```text
http://localhost:3000/api/games
```

## 💾 Armazenamento de dados

Na versão atual, os dados são gerenciados pelo **backend através da API REST**.

O backend ainda utiliza uma estrutura de dados em memória. Isso significa que alterações realizadas durante a execução podem ser perdidas quando o servidor é reiniciado ou quando ocorre um novo deploy.

Essa implementação é temporária e permite demonstrar a arquitetura front-end/backend e as operações CRUD antes da integração com um banco de dados.

## 🛡️ Validações da API

A API possui validações para garantir maior consistência dos dados, incluindo:

- título, plataforma e status obrigatórios;
- valores numéricos não negativos;
- validação dos status permitidos;
- tratamento de jogos inexistentes;
- geração de IDs sem reutilização indevida após exclusões.

Os status atualmente aceitos são:

- Jogando
- Zerado
- Quero jogar
- Pausado
- Abandonado

## 📚 Evolução do projeto

### V1 — Front-end

A primeira etapa do GameVault foi desenvolvida com foco na construção da interface e das principais funcionalidades do sistema.

Os dados eram armazenados localmente no navegador utilizando `localStorage`.

### V2 — Backend e API REST

Na segunda etapa, o projeto passou a utilizar uma arquitetura cliente-servidor.

Foram implementados:

- backend com Node.js e Express;
- API REST;
- operações CRUD;
- integração do React com a API;
- validação dos dados;
- tratamento de erros;
- publicação do backend no Render;
- integração da aplicação publicada no Vercel com a API em produção.

### Próximas etapas

Estão planejadas para a evolução do projeto:

- integração com PostgreSQL;
- persistência definitiva dos dados;
- modelagem do banco de dados;
- autenticação de usuários;
- perfil do usuário;
- upload e armazenamento de capas;
- expansão das informações dos jogos;
- melhorias na identidade visual e experiência do usuário;
- possíveis integrações com plataformas de jogos.

## 📌 Status do projeto

**GameVault — AC2: Front-end integrado à API REST.**

A aplicação possui atualmente front-end e backend funcionais e publicados.

A próxima etapa do projeto será focada na implementação do banco de dados e na evolução da aplicação.

## 👩‍💻 Autora

Desenvolvido por **Letícia Martuscelli de Moraes**.

Projeto acadêmico desenvolvido no curso de **Análise e Desenvolvimento de Sistemas**.