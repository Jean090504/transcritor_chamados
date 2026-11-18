-- Redefine o acesso operacional e exige troca no primeiro login.
UPDATE "Usuario"
SET "senhaHash" = 'cc7d6aac0b55d7f4b26c5af5681f7da1:5e184347f1a1674669e563385751f0636a657b9380b4129e6d8be094eba13792313243c9aa0da08281a8bbc9cf49b31beb43a69cd3de2df24efd75cdd369a6c2',
    "trocarSenha" = true,
    "tokenVersao" = "tokenVersao" + 1,
    "atualizadoEm" = CURRENT_TIMESTAMP
WHERE "username" = 'elaine.marreiros';
