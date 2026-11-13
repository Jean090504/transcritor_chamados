-- Redefine a credencial temporária de Deborah Luna após falha de login.
-- A troca obrigatória impede que a senha temporária permaneça definitiva.
UPDATE "Usuario" SET "senhaHash" = 'b9021064945e531466af25ab6bdc96bb:aee4aadb239944e54966fa969ac93a0c75fbe2488157e750ca85d36aae638388f39ad49b6f80f793322bdb6a137141cd7be71aa15a428f306ce9a241392fbbc5', "trocarSenha" = true, "atualizadoEm" = CURRENT_TIMESTAMP WHERE "username" = 'deborah.luna';
