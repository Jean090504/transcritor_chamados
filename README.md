# Transcritor de Chamados

## Configuração

Crie o arquivo `.env` com `GEMINI_API_KEY` e `JWT_SECRET`. Os chamados são armazenados no próprio sistema, em `data/chamados.json`, e não são enviados à planilha.

Para gerar o hash de uma senha:

```powershell
node scripts/gerarHashSenha.js "senha-com-8-ou-mais-caracteres"
```

Depois configure `AUTH_USERS_JSON` como uma lista de objetos com `username` e `senhaHash`. Os usuários disponíveis são `root`, `sarah.silva` e os usernames definidos em `src/config/analistas.js`.

Ao iniciar, o sistema disponibiliza o perfil de cada analista. Analistas acessam apenas seus próprios chamados; Sarah visualiza o dashboard global e `root` tem acesso administrativo.

```powershell
npm start
```
