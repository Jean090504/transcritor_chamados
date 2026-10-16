export const validarRequisicao = (esquemaValidacao) => (requisicao, resposta, proximoPasso) => {
  const resultadoValidacao = esquemaValidacao.safeParse(requisicao.body)

  if (!resultadoValidacao.success) {
    const listaErros = resultadoValidacao.error.errors.map(itemErro => itemErro.message)
    return resposta.status(400).json({ sucesso: false, listaErros })
  }

  requisicao.body = resultadoValidacao.data
  proximoPasso()
}