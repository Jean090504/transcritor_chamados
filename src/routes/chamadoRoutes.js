import { Router } from 'express'
import { processarChamado } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada } from '../schemas/chamadoSchema.js'
import { limitadorRequisicoes } from '../middlewares/rateLimiter.js'

const roteador = Router()

roteador.post(
  '/processar', 
  limitadorRequisicoes, 
  validarRequisicao(esquemaTextoEntrada), 
  processarChamado
)

export default roteador