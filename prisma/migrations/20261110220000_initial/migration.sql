CREATE TABLE "Usuario" (
    "username" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "aba" TEXT,
    "senhaHash" TEXT NOT NULL,
    "trocarSenha" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("username")
);

CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "seguradora" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "previaServico" TEXT NOT NULL,
    "localidade" TEXT NOT NULL,
    "baseAcionada" TEXT NOT NULL,
    "dataMarcada" TEXT NOT NULL,
    "horarioMarcado" TEXT NOT NULL,
    "retratacaoInicial" TEXT NOT NULL,
    "retratacaoFinal" TEXT NOT NULL,
    "resumoTentativas" TEXT NOT NULL,
    "dataAtendimento" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Chamado_username_idx" ON "Chamado"("username");
CREATE INDEX "Chamado_dataAtendimento_idx" ON "Chamado"("dataAtendimento");
CREATE INDEX "Chamado_username_protocolo_idx" ON "Chamado"("username", "protocolo");

ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_username_fkey" FOREIGN KEY ("username") REFERENCES "Usuario"("username") ON DELETE CASCADE ON UPDATE CASCADE;
