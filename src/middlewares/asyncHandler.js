export const asyncHandler = (funcao) => (requisicao, resposta, proximo) => {
  Promise.resolve(funcao(requisicao, resposta, proximo)).catch(proximo)
}
