import { Router } from 'express'
import { preVisualizarChamado, gravarChamado } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada, esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'
import { limitadorRequisicoes } from '../middlewares/rateLimiter.js'
import { z } from 'zod'

const roteador = Router()

// Schema para validar o payload da gravação final
const esquemaGravacaoFinal = z.object({
  dados: esquemaChamadoEstruturado
})

// 1. Extração com IA + Verificação de duplicados (abre o modal de revisão no frontend)
roteador.post(
  '/previsualizar',
  limitadorRequisicoes,
  validarRequisicao(esquemaTextoEntrada),
  preVisualizarChamado
)

// 2. Gravação definitiva no Google Sheets após confirmação/ajuste no modal
roteador.post(
  '/gravar',
  limitadorRequisicoes,
  validarRequisicao(esquemaGravacaoFinal),
  gravarChamado
)

export default roteador
