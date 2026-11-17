function normalizar(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function baseValida(valor) {
  const base = normalizar(valor)
  if (!base || /nao acionad|nao informado|sem acionamento|sem base|nenhum|nenhuma|^na$|^n\/a$/.test(base)) return false
  return base.length >= 3 || /^t\d+$/.test(base)
}

export function classificarChamado(chamado = {}) {
  const texto = normalizar([
    chamado.servico, chamado.previaServico, chamado.baseAcionada,
    chamado.retratacaoInicial, chamado.retratacaoFinal,
    chamado.resumoTentativas, chamado.observacao
  ].filter(Boolean).join(' '))

  if (/cancel/.test(texto) || /reembols/.test(texto)) return 'cancelados'
  // Uma base confirmada é o fato operacional mais específico. O valor legado
  // "AGENDAMENTO" não deve apagar uma base que já foi aceita/acionada.
  if (baseValida(chamado.baseAcionada)) return 'acionados'

  const acionamentoConfirmado = /\bacionad[oa]s?\b/.test(texto) && !/sem base acionad|nao acionad|sem acionamento/.test(texto)
  const voucherConfirmado = /\bvouchers?\b/.test(texto) && !/sem vouchers?|nao vouchers?/.test(texto)
  if (acionamentoConfirmado || voucherConfirmado) return 'acionados'
  return 'pendentes'
}

export function statusVisualChamado(chamado = {}) {
  const categoria = classificarChamado(chamado)
  if (categoria === 'cancelados') return { classe: 'status-vermelho', texto: 'Cancelado' }
  if (categoria === 'acionados') return { classe: 'status-verde', texto: 'Acionado' }
  return { classe: 'status-laranja', texto: 'Agendamento' }
}
