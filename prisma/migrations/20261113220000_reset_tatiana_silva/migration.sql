-- Redefine a credencial temporária de Tatiana Silva após falha na redefinição.
-- A troca obrigatória impede que a senha temporária permaneça definitiva.
UPDATE "Usuario"
SET "senhaHash" = '36e3825dd7a69d4b66cf0ea085dce74d:e2bfac0053ae7d6ae9b91202c38ace32f34866af19fde1bb9586cd3add8d9a1cd664ab02c74e9a7b9e2589e4630e116658e8094b533858df9bed90689f6b2e3f',
    "trocarSenha" = true,
    "tokenVersao" = "tokenVersao" + 1,
    "atualizadoEm" = CURRENT_TIMESTAMP
WHERE "username" = 'tatiana.silva';
