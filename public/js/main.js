document.addEventListener('DOMContentLoaded', () => {
  const campoTexto = document.getElementById('textoChamado')
  const botaoProcessar = document.getElementById('botaoProcessar')
  const botaoColar = document.getElementById('botaoColar')
  const botaoLimpar = document.getElementById('botaoLimpar')
  const contadorCaracteres = document.getElementById('contadorCaracteres')
  const conteudoBotao = botaoProcessar.querySelector('.conteudo-botao')
  const indicadorCarregamento = document.getElementById('indicadorCarregamento')
  const containerToasts = document.getElementById('containerToasts')

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

  // 1. Sistema de Toasts Flutuantes (100% DOM seguro sem innerHTML)
  function dispararToast(titulo, mensagem, tipo = 'sucesso', duracao = 3000, linkUrl = null) {
    if (!containerToasts) return

    const toast = document.createElement('div')
    toast.className = `toast-item toast-${tipo}`

    const corpo = document.createElement('div')
    corpo.className = 'toast-corpo'

    const elTitulo = document.createElement('div')
    elTitulo.className = 'toast-titulo'
    elTitulo.textContent = titulo

    const elMensagem = document.createElement('div')
    elMensagem.className = 'toast-mensagem'
    elMensagem.textContent = mensagem

    corpo.append(elTitulo, elMensagem)

    if (linkUrl) {
      const elLink = document.createElement('a')
      elLink.href = linkUrl
      elLink.target = '_blank'
      elLink.rel = 'noopener noreferrer'
      elLink.style.display = 'inline-block'
      elLink.style.marginTop = '6px'
      elLink.style.fontSize = '0.75rem'
      elLink.style.fontWeight = '700'
      elLink.style.color = 'var(--cor-primaria)'
      elLink.style.textDecoration = 'none'
      elLink.textContent = 'Abrir no Sheets ↗'
      corpo.appendChild(elLink)
    }

    const botaoFechar = document.createElement('button')
    botaoFechar.type = 'button'
    botaoFechar.className = 'toast-fechar'
    botaoFechar.textContent = '×'

    const trilhaProgresso = document.createElement('div')
    trilhaProgresso.className = 'toast-progresso'
    const barraProgresso = document.createElement('div')
    barraProgresso.className = 'toast-progresso-barra'
    trilhaProgresso.appendChild(barraProgresso)

    toast.append(corpo, botaoFechar, trilhaProgresso)
    containerToasts.appendChild(toast)

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

  // 2. Alternador de Tema Escuro / Claro
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

  // 3. Contador de Caracteres
  function atualizarContador() {
    contadorCaracteres.textContent = `${campoTexto.value.length} caracteres`
  }
  campoTexto.addEventListener('input', atualizarContador)

  // 4. Atalho de Envio Rápido (Ctrl+Enter / Cmd+Enter)
  campoTexto.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      botaoProcessar.click()
    }
  })

  botaoLimpar.addEventListener('click', () => {
    campoTexto.value = ''
    atualizarContador()
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

  // 5. Histórico Local (localStorage)
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

  // 6. Modal de Confirmação e Edição
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
      dispararToast('Duplicado Identificado', `Protocolo ${dados.protocolo} já está na linha ${linha}.`, 'aviso', 4000)
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

  // 7. Passo 1: Pré-visualização com IA
  botaoProcessar.addEventListener('click', async () => {
    const texto = campoTexto.value.trim()
    if (!texto || texto.length < 20) {
      dispararToast('Validação', 'Insira o texto completo do chamado antes de processar (mínimo de 20 caracteres).', 'aviso')
      return
    }

    alternarCarregamento(true)

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
      dispararToast('Erro na Análise', erro.message || 'Falha ao processar texto com a IA.', 'erro')
    } finally {
      alternarCarregamento(false)
    }
  })

  // 8. Passo 2: Gravação Definitiva na Planilha
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
      
      const urlPlanilha = idPlanilhaAtual 
        ? `https://docs.google.com/spreadsheets/d/${idPlanilhaAtual}/edit` 
        : null

      dispararToast(
        'Gravação Concluída',
        `Protocolo ${dadosParaGravar.protocolo} inserido na folha de cálculo com sucesso.`,
        'sucesso',
        3000,
        urlPlanilha
      )

      adicionarAoHistorico(dadosParaGravar)
      campoTexto.value = ''
      atualizarContador()
    } catch (erro) {
      dispararToast('Erro na Gravação', erro.message || 'Falha ao gravar registro na folha.', 'erro')
    } finally {
      botaoConfirmarGravacao.disabled = false
      botaoConfirmarGravacao.textContent = 'Gravar na Folha'
    }
  })
})
