UPDATE "Usuario"
SET "username" = 'sarah.fernandes',
    "nome" = 'SARAH SILVA DA COSTA FERNANDES',
    "papel" = 'supervisor',
    "aba" = NULL
WHERE "username" = 'sarah.silva';

UPDATE "Chamado"
SET "username" = 'sarah.fernandes'
WHERE "username" = 'sarah.silva';
