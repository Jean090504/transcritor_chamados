-- Acelera as consultas do dashboard que restringem por analista e data.
CREATE INDEX "Chamado_username_dataAtendimento_idx" ON "Chamado"("username", "dataAtendimento");
