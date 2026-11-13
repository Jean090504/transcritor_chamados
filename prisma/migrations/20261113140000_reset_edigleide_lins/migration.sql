-- Redefine a credencial temporária de Edigleide Lins após falha de login.
-- A troca obrigatória impede que a senha temporária permaneça definitiva.
UPDATE "Usuario" SET "senhaHash" = 'b357f90b57bc0b2fdcf6c7cb12806be0:9b83788a0d88e76cf738f0a0e570a7084fafcaebcf16adbe8bbaa4167812660dd23a7691362f0856897743cbf97071f8ba06c1143eaf21dca7e514b1c5900795', "trocarSenha" = true, "atualizadoEm" = CURRENT_TIMESTAMP WHERE "username" = 'edigleide.lins';
