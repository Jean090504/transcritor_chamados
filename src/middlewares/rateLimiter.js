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

export const limitadorApi = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { sucesso: false, erro: 'Muitas requisicoes realizadas. Aguarde um minuto antes de tentar novamente.' }
})

export const limitadorAutenticacao = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { sucesso: false, erro: 'Muitas tentativas de login. Aguarde um minuto antes de tentar novamente.' }
})
