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
    const resultado = await novoChamado.salvarNaPlanilha()

    return resposta.status(200).json({
      sucesso: true,
      mensagem: 'Registo formatado e inserido na folha com sucesso.',
      dados: resultado.chamado,
      linhaCriada: resultado.linhaCriada,
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

// Desfazer (Undo)
export const desfazerGravacao = async (requisicao, resposta) => {
  try {
    const { linha } = requisicao.body
    if (!linha) {
      return resposta.status(400).json({ sucesso: false, erro: 'Linha não informada.' })
    }

    await Chamado.apagarLinhaPlanilha(Number(linha))

    return resposta.status(200).json({
      sucesso: true,
      mensagem: `Registo da linha ${linha} removido com sucesso.`
    })
  } catch (erro) {
    console.error('Falha ao desfazer:', erro)
    return resposta.status(500).json({
      sucesso: false,
      erro: erro.message || 'Falha ao excluir linha da folha.'
    })
  }
}
