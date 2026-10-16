import rateLimit from 'express-rate-limit'

export const limitadorRequisicoes = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    erro: 'Muitas requisicoes realizadas. Aguarde um minuto antes de tentar novamente.'
  }
})