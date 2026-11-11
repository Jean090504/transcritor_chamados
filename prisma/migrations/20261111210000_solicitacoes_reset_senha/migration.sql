CREATE TABLE "SolicitacaoResetSenha" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidoEm" TIMESTAMP(3),
    "resolvidoPor" TEXT,

    CONSTRAINT "SolicitacaoResetSenha_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SolicitacaoResetSenha_username_status_idx" ON "SolicitacaoResetSenha"("username", "status");
CREATE INDEX "SolicitacaoResetSenha_status_solicitadoEm_idx" ON "SolicitacaoResetSenha"("status", "solicitadoEm");

ALTER TABLE "SolicitacaoResetSenha" ADD CONSTRAINT "SolicitacaoResetSenha_username_fkey" FOREIGN KEY ("username") REFERENCES "Usuario"("username") ON DELETE CASCADE ON UPDATE CASCADE;
