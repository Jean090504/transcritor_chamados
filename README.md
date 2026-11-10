# Transcritor de Chamados

Aplicação operacional para transformar textos de chamados em registros estruturados, com autenticação por perfil, dashboard e histórico persistente.

## Variáveis de ambiente

Crie um arquivo `.env` local ou configure estas variáveis no Vercel:

```env
GEMINI_API_KEY=chave-do-Gemini
JWT_SECRET=uma-chave-com-pelo-menos-32-caracteres
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
AUTH_USERS_JSON=[{"username":"...","senhaHash":"..."}]
```

`AUTH_USERS_JSON` é usado pelo seed inicial. No ambiente local, o seed também pode ler `data/users.json`. Não versionar `.env`, `credentials.json`, `data/users.json` ou `senhas-iniciais.txt`.

## Banco de dados com Prisma

O projeto usa Prisma ORM com PostgreSQL. Para preparar um banco local ou remoto:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm start
```

No Vercel, o comando de build executa automaticamente a geração do cliente, as migrações e o seed:

```text
npm run build
```

Configure `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET` e `AUTH_USERS_JSON` nas variáveis de ambiente do projeto antes do deploy.
