import { extrairDadosChamado } from '../services/aiService.js'
import { Chamado } from '../model/Chamado.js'
import { esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'

export const processarChamado = async (requisicao, resposta) => {
  try {
    const { textoManual } = requisicao.body

    const dadosExtraidos = await extrairDadosChamado(textoManual)
    const dadosValidados = esquemaChamadoEstruturado.parse(dadosExtraidos)

    const novoChamado = new Chamado(dadosValidados)
    await novoChamado.salvarNaPlanilha()

    return resposta.status(200).json({
      sucesso: true,
      mensagem: 'Chamado gravado com sucesso na planilha',
      dados: novoChamado
    })
  } catch (erroProcessamento) {
    console.error('Falha no processamento:', erroProcessamento.message)
    return resposta.status(500).json({
      sucesso: false,
      erro: 'Falha ao processar chamado. Verifique o formato ou tente mais tarde.'
    })
  }
}