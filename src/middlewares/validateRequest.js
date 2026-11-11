export const validarRequisicao = (esquemaValidacao, fonte = 'body') => (requisicao, resposta, proximoPasso) => {
  const resultadoValidacao = esquemaValidacao.safeParse(requisicao[fonte])

  if (!resultadoValidacao.success) {
    const listaErros = resultadoValidacao.error.errors.map(itemErro => itemErro.message)
    return resposta.status(400).json({ sucesso: false, listaErros })
  }

  requisicao[fonte] = resultadoValidacao.data
  proximoPasso()
}
