document.addEventListener('DOMContentLoaded', () => {
  const campoTexto = document.getElementById('textoChamado')
  const botaoProcessar = document.getElementById('botaoProcessar')
  const botaoColar = document.getElementById('botaoColar')
  const botaoLimpar = document.getElementById('botaoLimpar')
  const contadorCaracteres = document.getElementById('contadorCaracteres')
  const painelAlerta = document.getElementById('alertaFeedback')
  const conteudoBotao = botaoProcessar.querySelector('.conteudo-botao')
  const indicadorCarregamento = document.getElementById('indicadorCarregamento')

  // Elementos do Modal
  const modalConfirmacao = document.getElementById('modalConfirmacao')
  const fecharModal = document.getElementById('fecharModal')
  const botaoCancelarModal = document.getElementById('botaoCancelarModal')
  const botaoConfirmarGravacao = document.getElementById('botaoConfirmarGravacao')
  const avisoDuplicadoModal = document.getElementById('avisoDuplicadoModal')

  // Campos do Modal
  const campoProtocolo = document.getElementById('campoProtocolo')
  const campoSeguradora = document.getElementById('campoSeguradora')
  const campoServico = document.getElementById('campoServico')
  const campoPreviaServico = document.getElementById('campoPreviaServico')
  const campoLocalidade = document.getElementById('campoLocalidade')
  const campoBaseAcionada = document.getElementById('campoBaseAcionada')
  const campoDataMarcada = document.getElementById('campoDataMarcada')
  const campoHorarioMarcado = document.getElementById('campoHorarioMarcado')
  const campoRetratacaoInicial = document.getElementById('campoRetratacaoInicial')
  const campoRetratacaoFinal = document.getElementById('campoRetratacaoFinal')
  const campoResumoTentativas = document.getElementById('campoResumoTentativas')

  // Tema Escuro
  const botaoTema = document.getElementById('botaoTema')
  const iconeSol = document.getElementById('iconeSol')
  const iconeLua = document.getElementById('iconeLua')

  // Histórico
  const toggleHistorico = document.getElementById('toggleHistorico')
  const listaHistorico = document.getElementById('listaHistorico')
  const totalHistorico = document.getElementById('totalHistorico')

  let idPlanilhaAtual = ''

  // 1. Alternador de Tema Escuro / Claro
  const temaSalvo = localStorage.getItem('tema_transcritor') || 'light'
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode')
    iconeSol.classList.add('oculto')
    iconeLua.classList.remove('oculto')
  }

  botaoTema.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode')
    localStorage.setItem('tema_transcritor', isDark ? 'dark' : 'light')
    iconeSol.classList.toggle('oculto', isDark)
    iconeLua.classList.toggle('oculto', !isDark)
  })

  // 2. Contador de Caracteres
  function atualizarContador() {
    contadorCaracteres.textContent = `${campoTexto.value.length} caracteres`
  }
  campoTexto.addEventListener('input', atualizarContador)

  // 3. Atalho de Envio Rápido
  campoTexto.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      botaoProcessar.click()
    }
  })

  function limparAlerta() {
    painelAlerta.className = 'painel-alerta oculto'
    painelAlerta.replaceChildren()
  }

  botaoLimpar.addEventListener('click', () => {
    campoTexto.value = ''
    atualizarContador()
    limparAlerta()
    campoTexto.focus()
  })

  botaoColar.addEventListener('click', async () => {
    try {
      const texto = await navigator.clipboard.readText()
      if (texto) {
        campoTexto.value = texto
        atualizarContador()
      }
    } catch {
      campoTexto.focus()
    }
  })

  function alternarCarregamento(estaCarregando) {
    botaoProcessar.disabled = estaCarregando
    campoTexto.disabled = estaCarregando
    conteudoBotao.classList.toggle('oculto', estaCarregando)
    indicadorCarregamento.classList.toggle('oculto', !estaCarregando)
  }

  // 4. Gestão do Histórico no LocalStorage
  function carregarHistorico() {
    const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    totalHistorico.textContent = historico.length
    listaHistorico.replaceChildren()

    if (historico.length === 0) {
      const vazio = document.createElement('div')
      vazio.style.padding = '8px'
      vazio.style.color = 'var(--cor-texto-secundario)'
      vazio.textContent = 'Nenhum envio recente guardado neste navegador.'
      listaHistorico.appendChild(vazio)
      return
    }

    historico.forEach((item) => {
      const card = document.createElement('div')
      card.className = 'item-historico'

      const info = document.createElement('div')
      info.textContent = `${item.protocolo} - ${item.seguradora} (${item.servico})`

      const data = document.createElement('span')
      data.style.color = 'var(--cor-texto-secundario)'
      data.textContent = item.dataHora

      card.append(info, data)
      listaHistorico.appendChild(card)
    })
  }

  function adicionarAoHistorico(dados) {
    const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    historico.unshift({
      protocolo: dados.protocolo,
      seguradora: dados.seguradora,
      servico: dados.servico,
      dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })

    if (historico.length > 8) historico.pop()
    localStorage.setItem('historico_chamados', JSON.stringify(historico))
    carregarHistorico()
  }

  toggleHistorico.addEventListener('click', () => {
    listaHistorico.classList.toggle('oculto')
  })
  carregarHistorico()

  // 5. Modal de Confirmação e Edição
  function abrirModalComDados(dados, duplicado, linha) {
    campoProtocolo.value = dados.protocolo || ''
    campoSeguradora.value = dados.seguradora || ''
    campoServico.value = dados.servico || ''
    campoPreviaServico.value = dados.previaServico || ''
    campoLocalidade.value = dados.localidade || ''
    campoBaseAcionada.value = dados.baseAcionada || ''
    campoDataMarcada.value = dados.dataMarcada || ''
    campoHorarioMarcado.value = dados.horarioMarcado || ''
    campoRetratacaoInicial.value = dados.retratacaoInicial || ''
    campoRetratacaoFinal.value = dados.retratacaoFinal || ''
    campoResumoTentativas.value = dados.resumoTentativas || ''

    if (duplicado) {
      avisoDuplicadoModal.textContent = `Atenção: O protocolo "${dados.protocolo}" já existe na folha de cálculo (Linha ${linha})!`
      avisoDuplicadoModal.classList.remove('oculto')
    } else {
      avisoDuplicadoModal.classList.add('oculto')
    }

    modalConfirmacao.classList.remove('oculto')
  }

  function fecharModalEdicao() {
    modalConfirmacao.classList.add('oculto')
  }

  fecharModal.addEventListener('click', fecharModalEdicao)
  botaoCancelarModal.addEventListener('click', fecharModalEdicao)

  // 6. Passo 1: Disparo da Análise (Pré-visualização)
  botaoProcessar.addEventListener('click', async () => {
    const texto = campoTexto.value.trim()
    if (!texto || texto.length < 20) {
      exibirErro('Insira o texto completo do chamado antes de processar.')
      return
    }

    alternarCarregamento(true)
    limparAlerta()

    try {
      const res = await fetch('/api/previsualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoManual: texto })
      })

      const resposta = await res.json()
      if (!res.ok) throw new Error(resposta.erro || 'Falha ao analisar chamado.')

      idPlanilhaAtual = resposta.sheetId
      abrirModalComDados(resposta.dados, resposta.duplicado, resposta.linhaDuplicada)
    } catch (erro) {
      exibirErro(erro.message)
    } finally {
      alternarCarregamento(false)
    }
  })

  // 7. Passo 2: Gravação Definitiva na Folha
  botaoConfirmarGravacao.addEventListener('click', async () => {
    const dadosParaGravar = {
      protocolo: campoProtocolo.value,
      seguradora: campoSeguradora.value,
      servico: campoServico.value,
      previaServico: campoPreviaServico.value,
      localidade: campoLocalidade.value,
      baseAcionada: campoBaseAcionada.value,
      dataMarcada: campoDataMarcada.value,
      horarioMarcado: campoHorarioMarcado.value,
      retratacaoInicial: campoRetratacaoInicial.value,
      retratacaoFinal: campoRetratacaoFinal.value,
      resumoTentativas: campoResumoTentativas.value
    }

    botaoConfirmarGravacao.disabled = true
    botaoConfirmarGravacao.textContent = 'A gravar...'

    try {
      const res = await fetch('/api/gravar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: dadosParaGravar })
      })

      const resposta = await res.json()
      if (!res.ok) throw new Error(resposta.erro || 'Falha ao gravar na folha.')

      fecharModalEdicao()
      exibirSucesso(resposta.mensagem, resposta.dados, idPlanilhaAtual)
      adicionarAoHistorico(dadosParaGravar)
      campoTexto.value = ''
      atualizarContador()
    } catch (erro) {
      alert(`Erro: ${erro.message}`)
    } finally {
      botaoConfirmarGravacao.disabled = false
      botaoConfirmarGravacao.textContent = 'Gravar na Folha'
    }
  })

  function criarChip(chave, valor) {
    const chip = document.createElement('span')
    chip.className = 'chip-info'

    const rotuloChave = document.createElement('span')
    rotuloChave.className = 'chip-chave'
    rotuloChave.textContent = `${chave}: `

    const rotuloValor = document.createElement('span')
    rotuloValor.className = 'chip-valor'
    rotuloValor.textContent = valor

    chip.append(rotuloChave, rotuloValor)
    return chip
  }

  function exibirSucesso(mensagem, dados, sheetId) {
    limparAlerta()
    painelAlerta.className = 'painel-alerta alerta-sucesso'

    const cabecalhoMensagem = document.createElement('div')
    const rotuloDestaque = document.createElement('strong')
    rotuloDestaque.textContent = 'Sucesso: '
    cabecalhoMensagem.append(rotuloDestaque, document.createTextNode(mensagem))
    painelAlerta.appendChild(cabecalhoMensagem)

    if (dados) {
      const containerDetalhes = document.createElement('div')
      containerDetalhes.className = 'detalhes-extracao'

      const itens = [
        { chave: 'PROTOCOLO', valor: dados.protocolo || 'N/D' },
        { chave: 'SEGURADORA', valor: dados.seguradora || 'N/D' },
        { chave: 'SERVIÇO', valor: dados.servico || 'N/D' },
        { chave: 'PRÉVIA', valor: dados.previaServico || 'N/D' },
        { chave: 'LOCALIDADE', valor: dados.localidade || 'N/D' },
        { chave: 'BASE ACIONADA', valor: dados.baseAcionada || 'N/D' },
        { chave: 'DATA MARCADA', valor: dados.dataMarcada || 'N/D' },
        { chave: 'HORÁRIO MARCADO', valor: dados.horarioMarcado || 'N/D' }
      ]

      itens.forEach((item) => {
        containerDetalhes.appendChild(criarChip(item.chave, item.valor))
      })

      painelAlerta.appendChild(containerDetalhes)
    }

    // Botão de acesso direto à folha de cálculo
    if (sheetId) {
      const linkPlanilha = document.createElement('a')
      linkPlanilha.className = 'link-planilha'
      linkPlanilha.href = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
      linkPlanilha.target = '_blank'
      linkPlanilha.rel = 'noopener noreferrer'
      linkPlanilha.textContent = 'Abrir no Google Sheets ↗'
      painelAlerta.appendChild(linkPlanilha)
    }
  }

  function exibirErro(mensagem) {
    limparAlerta()
    painelAlerta.className = 'painel-alerta alerta-erro'

    const rotuloErro = document.createElement('strong')
    rotuloErro.textContent = 'Erro de Processamento: '
    painelAlerta.append(rotuloErro, document.createTextNode(mensagem))
  }
})

// Substitua ou adicione no escopo do seu DOMContentLoaded:
const containerToasts = document.getElementById('containerToasts')

function dispararToast(titulo, mensagem, tipo = 'sucesso', duracao = 3000) {
  const toast = document.createElement('div')
  toast.className = `toast-item toast-${tipo}`

  // Corpo do texto
  const corpo = document.createElement('div')
  corpo.className = 'toast-corpo'

  const elTitulo = document.createElement('div')
  elTitulo.className = 'toast-titulo'
  elTitulo.textContent = titulo

  const elMensagem = document.createElement('div')
  elMensagem.className = 'toast-mensagem'
  elMensagem.textContent = mensagem

  corpo.append(elTitulo, elMensagem)

  // Botão de fechar manual (X)
  const botaoFechar = document.createElement('button')
  botaoFechar.type = 'button'
  botaoFechar.className = 'toast-fechar'
  botaoFechar.textContent = '×'

  // Barra de progresso
  const trilhaProgresso = document.createElement('div')
  trilhaProgresso.className = 'toast-progresso'
  const barraProgresso = document.createElement('div')
  barraProgresso.className = 'toast-progresso-barra'
  trilhaProgresso.appendChild(barraProgresso)

  toast.append(corpo, botaoFechar, trilhaProgresso)
  containerToasts.appendChild(toast)

  // Dispara animação de entrada
  requestAnimationFrame(() => {
    toast.classList.add('toast-visivel')
  })

  let temporizador = null

  function removerToast() {
    if (temporizador) clearTimeout(temporizador)
    toast.classList.remove('toast-visivel')
    toast.classList.add('toast-saindo')
    toast.addEventListener('transitionend', () => {
      toast.remove()
    }, { once: true })
  }

  temporizador = setTimeout(removerToast, duracao)
  botaoFechar.addEventListener('click', removerToast)
}
