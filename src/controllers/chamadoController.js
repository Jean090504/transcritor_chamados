import { extrairDadosChamado } from '../services/aiService.js'
import { Chamado } from '../model/Chamado.js'
import { esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'
import { configuracaoAmbiente } from '../config/env.js'

export const preVisualizarChamado = async (requisicao, resposta) => {
  try {
    const { textoManual } = requisicao.body

    const dadosExtraidos = await extrairDadosChamado(textoManual)
    const dadosValidados = esquemaChamadoEstruturado.parse(dadosExtraidos)

    const linhaExistente = await Chamado.verificarDuplicado(dadosValidados.protocolo)

    return resposta.status(200).json({
      sucesso: true,
      dados: dadosValidados,
      duplicado: !!linhaExistente,
      linhaDuplicada: linhaExistente,
      sheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA
    })
  } catch (erro) {
    console.error('Falha na pré-visualização:', erro)
    return resposta.status(500).json({
      sucesso: false,
      erro: erro.message || 'Falha ao extrair dados do chamado.'
    })
  }
}

export const gravarChamado = async (requisicao, resposta) => {
  try {
    const dadosRecebidos = requisicao.body.dados
    const dadosValidados = esquemaChamadoEstruturado.parse(dadosRecebidos)

    const novoChamado = new Chamado(dadosValidados)
    await novoChamado.salvarNaPlanilha()

    return resposta.status(200).json({
      sucesso: true,
      mensagem: 'Registo inserido com sucesso na folha de cálculo.',
      dados: novoChamado,
      sheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA
    })
  } catch (erro) {
    console.error('Falha ao gravar:', erro)
    return resposta.status(500).json({
      sucesso: false,
      erro: erro.message || 'Falha ao gravar na folha de cálculo.'
    })
  }
}
