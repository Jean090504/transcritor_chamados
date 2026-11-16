-- Redefine a credencial temporária de Maria Souza para ajustar o acesso.
-- A troca obrigatória impede que a senha temporária permaneça definitiva.
UPDATE "Usuario" SET "senhaHash" = '98ab14aab400f694230057e15ac53968:3beff52e94ab83114b1561f8ed6142bea0f79a35b4379a38c64a4a1f9fe4ab058068e85d6395ae6206c5c051c1960b71d635db4712833d5a2c87a31e889dd350', "trocarSenha" = true, "atualizadoEm" = CURRENT_TIMESTAMP WHERE "username" = 'maria.souza';
