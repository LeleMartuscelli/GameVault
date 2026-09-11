]# 🎮 GameVault

GameVault é uma aplicação web para organizar e acompanhar uma biblioteca pessoal de jogos.

O projeto permite cadastrar jogos, acompanhar horas jogadas, visualizar estatísticas, marcar favoritos e gerenciar informações da biblioteca através de uma interface moderna e responsiva.

Esta é a primeira versão do projeto, desenvolvida com foco no front-end e persistência de dados local.

## 🌐 Projeto online

Acesse a versão publicada do GameVault:

https://game-vault-three-ebon.vercel.app/

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
- Cadastro de novos jogos
- Visualização dos detalhes de cada jogo
- Edição de jogos cadastrados
- Exclusão de jogos
- Busca de jogos pelo nome
- Sistema de favoritos
- Página dedicada aos jogos favoritos
- Notificações com informações da biblioteca
- Persistência dos dados utilizando Local Storage
- Layout responsivo para desktop e dispositivos móveis
- Tratamento de estados vazios e jogos não encontrados

## 🛠️ Tecnologias

O projeto foi desenvolvido utilizando:

- React
- TypeScript
- Vite
- React Router DOM
- Lucide React
- CSS
- Local Storage

## 📂 Estrutura do projeto

```text
src/
├── assets/
│   └── games/
├── components/
│   └── Sidebar/
├── data/
├── layouts/
├── pages/
│   ├── AddGame/
│   ├── Dashboard/
│   ├── EditGame/
│   ├── Favorites/
│   ├── GameDetails/
│   └── Library/
├── types/
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

## 🚀 Como executar o projeto

### Pré-requisitos

Antes de começar, é necessário ter o Node.js e o npm instalados.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/LeleMartuscelli/GameVault.git
```

Entre na pasta do projeto:

```bash
cd GameVault
```

Instale as dependências:

```bash
npm install
```

Execute o projeto em ambiente de desenvolvimento:

```bash
npm run dev
```

Depois, abra no navegador o endereço exibido pelo Vite.

## 💾 Armazenamento de dados

Nesta primeira versão, os dados da biblioteca são armazenados no `localStorage` do navegador.

Isso permite que jogos adicionados, editados ou removidos continuem disponíveis após atualizar ou fechar a página no mesmo navegador.

## 🔮 Próximas melhorias

Para versões futuras do GameVault, estão planejadas funcionalidades como:

- Backend para persistência dos dados
- Banco de dados
- Autenticação de usuários
- Perfil do usuário
- Página de configurações
- Upload e armazenamento de capas dos jogos
- Expansão das informações disponíveis para cada jogo

## 📌 Status do projeto

**GameVault V1 — Front-end concluído.**

O projeto continuará recebendo novas funcionalidades em versões futuras.

## 👩‍💻 Autora

Desenvolvido por **Letícia Martuscelli**.