-- Redefine a credencial temporária de Barbara Lima para recuperar o acesso.
-- A troca obrigatória impede que a senha temporária permaneça definitiva.
UPDATE "Usuario" SET "senhaHash" = 'cd7715c8bc54aa32f2841a274dce6657:2ead14ccab8ea57b8bd888a70d9117fa3e95e82bca77bed1e35364e2c612a7a259e01f57baab8ab32a909c5b39e0a72f3d4160b0f1b7d75601e74e97445a46d4', "trocarSenha" = true, "atualizadoEm" = CURRENT_TIMESTAMP WHERE "username" = 'barbara.lima';
