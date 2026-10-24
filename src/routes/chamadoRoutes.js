import { Router } from 'express'
import { preVisualizarChamado, gravarChamado, desfazerGravacao } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada, esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'
import { limitadorRequisicoes } from '../middlewares/rateLimiter.js'
import { z } from 'zod'

const roteador = Router()

const esquemaGravacaoFinal = z.object({
  dados: esquemaChamadoEstruturado
})

roteador.post(
  '/previsualizar',
  limitadorRequisicoes,
  validarRequisicao(esquemaTextoEntrada),
  preVisualizarChamado
)

roteador.post(
  '/gravar',
  limitadorRequisicoes,
  validarRequisicao(esquemaGravacaoFinal),
  gravarChamado
)

// Rota de Desfazer
roteador.post('/desfazer', desfazerGravacao)

export default roteador
