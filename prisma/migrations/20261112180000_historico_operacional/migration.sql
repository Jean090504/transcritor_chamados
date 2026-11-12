CREATE TABLE "RegistroOperacional" (
    "id" TEXT NOT NULL,
    "chaveIdempotencia" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "dados" JSONB NOT NULL,
    "linhaPlanilha" TEXT,
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroOperacional_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RegistroOperacional_chaveIdempotencia_key" ON "RegistroOperacional"("chaveIdempotencia");
CREATE INDEX "RegistroOperacional_username_criadoEm_idx" ON "RegistroOperacional"("username", "criadoEm");
CREATE INDEX "RegistroOperacional_username_status_idx" ON "RegistroOperacional"("username", "status");

ALTER TABLE "RegistroOperacional" ADD CONSTRAINT "RegistroOperacional_username_fkey" FOREIGN KEY ("username") REFERENCES "Usuario"("username") ON DELETE CASCADE ON UPDATE CASCADE;
