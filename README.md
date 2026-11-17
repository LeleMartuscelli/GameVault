# 🎮 GameVault

**GameVault** é uma aplicação web desenvolvida para organizar e acompanhar uma biblioteca pessoal de jogos.

O sistema permite visualizar jogos, acompanhar estatísticas, registrar horas jogadas, controlar o progresso, consultar favoritos e visualizar galerias de imagens. As operações de cadastro, edição e exclusão são restritas à área administrativa, protegida por autenticação.

O projeto foi desenvolvido na disciplina **Software Project**, do curso de **Análise e Desenvolvimento de Sistemas (ADS)**, evoluindo de uma aplicação com armazenamento local para uma arquitetura full stack com API REST e persistência em PostgreSQL.

## 🌐 Projeto online

**Aplicação web — Vercel**

https://game-vault-three-ebon.vercel.app/

**API REST — Render**

https://gamevault-vuz1.onrender.com/api/games

**Repositório GitHub**

https://github.com/LeleMartuscelli/GameVault

> O backend utiliza a infraestrutura do Render. Em instâncias gratuitas, o primeiro acesso após um período de inatividade pode apresentar um tempo de inicialização maior.

> A publicação online deve ser conferida após a integração das alterações mais recentes do projeto.

## 📸 Preview

### Dashboard

![Dashboard do GameVault](./screenshots/dashboard.png)

### Biblioteca

![Biblioteca do GameVault](./screenshots/biblioteca.png)

### Detalhes do jogo

![Detalhes de um jogo no GameVault](./screenshots/detalhes.png)

## ✨ Funcionalidades

### Funcionalidades públicas

- Dashboard com visão geral da biblioteca.
- Estatísticas calculadas a partir dos jogos cadastrados.
- Listagem de jogos por meio da API REST.
- Busca de jogos pelo nome.
- Consulta de detalhes individuais.
- Visualização de favoritos.
- Consulta do status e progresso de cada jogo.
- Visualização da galeria de imagens.
- Alternância entre temas claro e escuro.
- Interface responsiva com navegação adaptada para diferentes dispositivos.
- Tratamento de carregamento, erros e estados vazios.

### Funcionalidades administrativas

- Login administrativo.
- Cadastro de novos jogos.
- Edição de jogos existentes.
- Exclusão de jogos.
- Gerenciamento das imagens associadas aos jogos.
- Cadastro de imagens por URL.
- Upload de imagens diretamente do computador.
- Exclusão de imagens.
- Encerramento da sessão administrativa.

As funcionalidades de consulta são públicas. As operações que modificam os dados exigem autenticação administrativa.

## 🛠️ Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite
- React Router DOM
- Lucide React
- CSS
- Fetch API

### Backend

- Node.js
- Express
- API REST
- CORS
- Express Session
- Argon2
- Proteção CSRF
- Multer para upload de arquivos

### Banco de dados

- PostgreSQL
- Neon — hospedagem do banco de dados
- Armazenamento persistente de jogos e imagens

### Ferramentas e infraestrutura

- Git e GitHub
- GitHub Projects
- Visual Studio Code
- Vercel — hospedagem do frontend
- Render — hospedagem do backend
- draw.io — documentação UML

## 🏗️ Arquitetura do sistema

O GameVault utiliza uma arquitetura cliente-servidor composta por três camadas principais.

**Frontend:** responsável pela interface, navegação, apresentação das estatísticas e comunicação com a API.

**Backend:** responsável pelo processamento das requisições HTTP, validação dos dados, autenticação, autorização e gerenciamento das operações do sistema.

**Banco de dados:** responsável pela persistência dos jogos, metadados das imagens e arquivos enviados.

```text
                 USUÁRIO
                    |
                    v
          React + TypeScript
              (Vercel)
                    |
               HTTP / Fetch
                    |
                    v
            API REST Express
               (Render)
                    |
                    v
               PostgreSQL
                 (Neon)
```

Essa arquitetura permite separar a interface das regras de negócio e manter os dados armazenados independentemente do ciclo de vida do servidor.

## 🔄 API REST

### Gerenciamento de jogos

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| GET | `/api/games` | Listar jogos | Público |
| GET | `/api/games/:id` | Consultar jogo por ID | Público |
| POST | `/api/games` | Cadastrar jogo | Administrador |
| PUT | `/api/games/:id` | Atualizar jogo | Administrador |
| DELETE | `/api/games/:id` | Excluir jogo | Administrador |

### Galeria de imagens

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| GET | `/api/gallery/game/:gameId` | Listar imagens do jogo | Público |
| GET | `/api/gallery/file/:id` | Consultar arquivo armazenado | Público |
| POST | `/api/gallery/game/:gameId` | Adicionar imagem por URL | Administrador |
| POST | `/api/gallery/game/:gameId/upload` | Enviar imagem | Administrador |
| DELETE | `/api/gallery/:id` | Excluir imagem | Administrador |

As operações administrativas exigem sessão autenticada e validação CSRF, conforme as rotas implementadas no backend.

## 🔐 Autenticação e segurança

O GameVault possui uma área administrativa protegida por autenticação.

Entre os mecanismos implementados estão:

- Verificação de credenciais no backend.
- Utilização de Argon2 para verificação segura de senhas.
- Gerenciamento de sessão com Express Session.
- Persistência de sessões no PostgreSQL.
- Middleware de autorização para operações administrativas.
- Proteção CSRF em requisições que modificam dados.
- Validação dos parâmetros e dados recebidos pela API.
- Consultas parametrizadas ao PostgreSQL.

A autenticação separa as funcionalidades públicas das operações de administração da biblioteca.

## 🗄️ Persistência de dados

O GameVault utiliza **PostgreSQL hospedado no Neon** para armazenar os dados de maneira persistente.

### Jogos

Cada jogo possui os seguintes atributos utilizados pelo frontend:

| Atributo | Tipo |
|---|---|
| id | number |
| title | string |
| platform | string |
| hoursPlayed | number |
| timesCompleted | number |
| achievements | number |
| status | GameStatus |
| favorite | boolean |

### Status disponíveis

- Jogando
- Zerado
- Quero jogar
- Pausado
- Abandonado

### Galeria de imagens

Os registros de imagens são associados aos jogos por meio da tabela `game_media`.

Os arquivos enviados pelo usuário são armazenados no PostgreSQL por meio da tabela `game_media_files`.

A aplicação oferece duas formas de adicionar imagens:

1. Informar uma URL HTTP ou HTTPS válida.
2. Enviar um arquivo diretamente do computador.

Os formatos aceitos para upload são **JPG, PNG, WebP e GIF**, com tamanho máximo de **5 MB por imagem**.

O backend verifica o formato declarado e a assinatura do arquivo antes de armazená-lo.

## 📂 Organização do projeto

A estrutura está organizada em frontend e backend, com separação de responsabilidades.

```text
GameVault/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── package.json
│   └── server.js
│
├── src/
│   ├── assets/
│   ├── components/
│   │   └── GameGallery/
│   ├── layouts/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Library/
│   │   ├── Favorites/
│   │   ├── GameDetails/
│   │   ├── AddGame/
│   │   └── EditGame/
│   ├── services/
│   │   ├── gameApi.ts
│   │   └── galleryApi.ts
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── screenshots/
├── package.json
└── README.md
```

*Estrutura resumida dos principais diretórios e arquivos. A organização completa pode ser consultada no repositório.*

## 🚀 Executando o projeto localmente

### Pré-requisitos

- Node.js
- npm
- Git
- Acesso a um banco PostgreSQL compatível

### 1. Clonar o repositório

```bash
git clone https://github.com/LeleMartuscelli/GameVault.git
cd GameVault
```

### 2. Configurar o backend

Entre na pasta do backend:

```bash
cd backend
npm install
```

Configure as variáveis de ambiente exigidas pela implementação, incluindo a conexão com o PostgreSQL e os segredos utilizados na autenticação e no gerenciamento de sessões.

As credenciais e os segredos devem permanecer fora do controle de versão.

Inicie o backend:

```bash
npm run dev
```

### 3. Executar o frontend

Em outro terminal, acesse a raiz do projeto:

```bash
npm install
npm run dev
```

Abra no navegador o endereço informado pelo Vite.

### 4. Configuração da API

O frontend utiliza a variável de ambiente:

```env
VITE_API_URL=
```

Essa variável deve apontar para o endereço da API configurado para o ambiente utilizado.

A URL local ou de produção precisa ser compatível com a configuração dos serviços de comunicação do frontend.

## 📐 Documentação UML

O projeto possui dois diagramas elaborados no draw.io:

**Diagrama de Classes**

Representa as estruturas principais dos jogos, seus status e os registros associados à galeria de imagens.

**Diagrama de Casos de Uso**

Representa as funcionalidades disponíveis para os atores Visitante e Administrador, incluindo consultas públicas, autenticação e operações de gerenciamento.

Os diagramas são mantidos em arquivos editáveis no formato `.drawio`.

## 📚 Evolução do projeto

### V1 — Interface e armazenamento local

A primeira versão foi desenvolvida com React, com foco na interface e na organização da biblioteca de jogos.

Os dados eram armazenados localmente no navegador utilizando `localStorage`.

### V2 — API REST

Na segunda etapa, o projeto evoluiu para uma arquitetura cliente-servidor.

Foram implementados:

- Backend com Node.js e Express.
- API REST para gerenciamento de jogos.
- Operações CRUD.
- Integração do frontend com a API.
- Validações e tratamento de erros.
- Publicação do frontend na Vercel.
- Publicação do backend no Render.

### V3 — PostgreSQL, autenticação e galeria

Na terceira etapa, foram implementados:

- Persistência de dados no PostgreSQL.
- Hospedagem do banco de dados no Neon.
- Integração das operações CRUD com o banco.
- Autenticação administrativa.
- Controle de acesso às operações de escrita.
- Gerenciamento de sessões.
- Proteção CSRF.
- Galeria de imagens associadas aos jogos.
- Upload e armazenamento de imagens no banco de dados.
- Melhorias na interface e na navegação.
- Documentação UML do sistema.

## 📌 Status do projeto

**GameVault — AC3: integração com PostgreSQL e evolução da aplicação full stack.**

As principais funcionalidades foram implementadas. O projeto encontra-se na fase de testes finais, validação do ambiente publicado e preparação da entrega acadêmica.

## 👩‍💻 Autora

Desenvolvido por **Letícia Martuscelli de Moraes**.

Projeto acadêmico do curso de **Análise e Desenvolvimento de Sistemas (ADS)**, desenvolvido na disciplina **Software Project**.