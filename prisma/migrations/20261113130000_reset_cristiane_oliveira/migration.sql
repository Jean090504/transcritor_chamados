-- Redefine a credencial temporária de Cristiane Oliveira após falha de login.
-- A troca obrigatória impede que a senha temporária permaneça definitiva.
UPDATE "Usuario" SET "senhaHash" = 'e8a75cbe87d6715068efe7d9e725a1cf:3ea59d7eeac4a1fcd61b2c753725e4e3b7cdba7235b86314f83865408dea35f8a06295a257e1313c491bbd52503ba99e4a18118956e83388fc891bf0a0c4cd93', "trocarSenha" = true, "atualizadoEm" = CURRENT_TIMESTAMP WHERE "username" = 'cristiane.oliveira';
