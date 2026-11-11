document.addEventListener('DOMContentLoaded', async () => {
  const telaLogin = document.getElementById('telaLogin')
  const telaTrocaSenha = document.getElementById('telaTrocaSenha')
  const formularioLogin = document.getElementById('formularioLogin')
  const erroLogin = document.getElementById('erroLogin')
  const formularioTrocaSenha = document.getElementById('formularioTrocaSenha')
  const erroTrocaSenha = document.getElementById('erroTrocaSenha')
  const usuarioTrocaSenha = document.getElementById('usuarioTrocaSenha')
  const botaoSairTrocaSenha = document.getElementById('botaoSairTrocaSenha')
  const modalMensagemSistema = document.getElementById('modalMensagemSistema')
  const tituloMensagemSistema = document.getElementById('tituloMensagemSistema')
  const textoMensagemSistema = document.getElementById('textoMensagemSistema')
  const botaoFecharMensagemSistema = document.getElementById('botaoFecharMensagemSistema')
  const botaoEsqueciSenha = document.getElementById('botaoEsqueciSenha')
  const seletorAba = document.getElementById('seletorAba')
  const botaoSair = document.getElementById('botaoSair')
  const criarElemento = (tag, classes = [], texto = '') => {
    const elemento = document.createElement(tag)
    elemento.classList.add(...classes.filter(Boolean))
    if (texto) elemento.textContent = texto
    return elemento
  }
  const criarIconeOlho = (visivel) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('aria-hidden', 'true')
    const adicionar = (tag, atributos) => {
      const elemento = document.createElementNS('http://www.w3.org/2000/svg', tag)
      Object.entries(atributos).forEach(([nome, valor]) => elemento.setAttribute(nome, valor))
      svg.append(elemento)
    }
    if (visivel) {
      adicionar('path', { d: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z' })
      adicionar('circle', { cx: '12', cy: '12', r: '2.5' })
    } else {
      adicionar('path', { d: 'm3 3 18 18' })
      adicionar('path', { d: 'M10.6 10.6a2 2 0 0 0 2.8 2.8' })
      adicionar('path', { d: 'M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 3.9' })
      adicionar('path', { d: 'M6.1 6.1C3.4 8.1 2 12 2 12s3.5 7 10 7c1.1 0 2.1-.2 3-.5' })
    }
    return svg
  }
  const iconeOlhoAberto = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>'
  const iconeOlhoFechado = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18"></path><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 3.9"></path><path d="M6.1 6.1C3.4 8.1 2 12 2 12s3.5 7 10 7c1.1 0 2.1-.2 3-.5"></path></svg>'
  document.querySelectorAll('[data-toggle-password]').forEach((botao) => {
    botao.replaceChildren(criarIconeOlho(false))
    botao.addEventListener('click', () => {
      const campo = document.getElementById(botao.dataset.togglePassword)
      const vaiFicarVisivel = campo.type === 'password'
      campo.type = vaiFicarVisivel ? 'text' : 'password'
      botao.replaceChildren(criarIconeOlho(vaiFicarVisivel))
      botao.setAttribute('aria-label', vaiFicarVisivel ? 'Esconder senha' : 'Mostrar senha')
      botao.title = vaiFicarVisivel ? 'Esconder senha' : 'Mostrar senha'
    })
  })
  localStorage.removeItem('token_jwt')
  let token = sessionStorage.getItem('token_jwt')
  let usuarioAtual = null

  function mostrarModalMensagem(titulo, mensagem) {
    tituloMensagemSistema.textContent = titulo
    textoMensagemSistema.textContent = mensagem
    modalMensagemSistema.classList.remove('oculto')
    botaoFecharMensagemSistema.focus()
  }

  function fecharModalMensagem() { modalMensagemSistema.classList.add('oculto') }
  botaoFecharMensagemSistema.addEventListener('click', fecharModalMensagem)
  botaoEsqueciSenha?.addEventListener('click', () => {
    mostrarModalMensagem('Recuperação de senha', 'Solicite ao ROOT ou ao administrador do sistema a redefinição da sua senha. Por segurança, não é possível redefinir a senha apenas informando o usuário.')
  })
  modalMensagemSistema.addEventListener('click', (evento) => { if (evento.target === modalMensagemSistema) fecharModalMensagem() })
  document.addEventListener('keydown', (evento) => { if (evento.key === 'Escape') fecharModalMensagem() })

  async function requisicaoAutenticada(url, opcoes = {}) {
    const headers = new Headers(opcoes.headers || {})
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const resposta = await fetch(url, { ...opcoes, headers })
    if (resposta.status === 401) {
      sessionStorage.removeItem('token_jwt')
      window.location.reload()
    }
    return resposta
  }

  async function iniciarSessao() {
    if (!token) return false
    try {
      const resposta = await requisicaoAutenticada('/api/auth/me')
      if (!resposta.ok) return false
      usuarioAtual = (await resposta.json()).usuario
      if (usuarioAtual.acessoDashboard) {
        document.body.classList.add('modo-dashboard')
        document.body.classList.remove('sessao-carregando')
        telaLogin.classList.add('oculto')
        return true
      }
      const abasResposta = await requisicaoAutenticada('/api/abas')
      if (!abasResposta.ok) return false
      const { abas } = await abasResposta.json()
      seletorAba.replaceChildren(...abas.map((aba) => {
        const opcao = criarElemento('option', [], aba.nome)
        opcao.value = aba.id
        return opcao
      }))
      seletorAba.disabled = abas.length <= 1
      seletorAba.value = abas[0]?.id || ''
      document.body.classList.remove('sessao-carregando')
      telaLogin.classList.add('oculto')
      return Boolean(seletorAba.value)
    } catch {
      sessionStorage.removeItem('token_jwt')
      token = null
      usuarioAtual = null
      return false
    }
  }

  if (!token || !(await iniciarSessao())) {
    document.body.classList.remove('sessao-carregando')
    telaLogin.classList.remove('oculto')
    formularioLogin.addEventListener('submit', async (evento) => {
      evento.preventDefault()
      erroLogin.classList.add('oculto')
      const username = document.getElementById('loginUsuario').value.trim().toLowerCase()
      const senha = document.getElementById('loginSenha').value
      if (!username || !senha) { mostrarModalMensagem('Campos obrigat\u00f3rios', 'Informe seu usu\u00e1rio e sua senha para entrar.'); return }
      if (!username || !senha) { mostrarModalMensagem('Campos obrigatórios', 'Informe seu usuário e sua senha para entrar.'); return }
      try {
        const resposta = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, senha }) })
      const dados = await resposta.json()
      if (!resposta.ok) { mostrarModalMensagem('Não foi possível entrar', dados.erro || 'Confira seus dados e tente novamente.'); return }
      sessionStorage.setItem('token_jwt', dados.token)
        window.location.reload()
      } catch {
        mostrarModalMensagem('Sistema indisponível', 'A API não está respondendo. Inicie o servidor e tente novamente.')
      }
    })
    return
  }

  if (usuarioAtual.precisaTrocarSenha) {
    usuarioTrocaSenha.textContent = `Usuário autenticado: ${usuarioAtual.nome} (${usuarioAtual.sub})`
    telaTrocaSenha.classList.remove('oculto')
    botaoSairTrocaSenha.addEventListener('click', () => { sessionStorage.removeItem('token_jwt'); window.location.reload() })
    formularioTrocaSenha.addEventListener('submit', async (evento) => {
      evento.preventDefault()
      const novaSenha = document.getElementById('novaSenha').value
      const confirmacao = document.getElementById('confirmacaoSenha').value
      if (novaSenha.length < 8) { mostrarModalMensagem('Senha muito curta', 'Escolha uma senha com pelo menos 8 caracteres.'); return }
      if (novaSenha !== confirmacao) { mostrarModalMensagem('As senhas não conferem', 'Digite a mesma senha nos dois campos para continuar.'); return }
      const resposta = await requisicaoAutenticada('/api/auth/alterar-senha', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ novaSenha }) })
      const dados = await resposta.json()
      if (!resposta.ok) { mostrarModalMensagem('Não foi possível alterar', dados.erro || 'Tente novamente em instantes.'); return }
      sessionStorage.setItem('token_jwt', dados.token)
      window.location.reload()
    })
    return
  }

  botaoSair.addEventListener('click', () => { sessionStorage.removeItem('token_jwt'); window.location.reload() })
  seletorAba.addEventListener('change', () => sincronizarComPlanilhaReal())

  if (usuarioAtual.acessoDashboard) {
    const painelSarah = document.getElementById('painelSarah')
    const listaAnalistas = document.getElementById('listaAnalistasDashboard')
    const carregarDashboard = async () => {
      const resposta = await requisicaoAutenticada('/api/dashboard')
      if (!resposta.ok) return
      const dados = await resposta.json()
      document.body.classList.add('modo-dashboard')
      painelSarah.classList.remove('oculto')
      document.getElementById('dataDashboard').textContent = ''
      document.getElementById('subtituloDashboard').textContent = ''
      document.getElementById('totalAtendimentosHoje').textContent = dados.totalHoje
      document.getElementById('totalAtendimentosAcionadosHoje').textContent = dados.statusAtendimentosHoje.acionados
      document.getElementById('totalAtendimentosPendentesHoje').textContent = dados.statusAtendimentosHoje.pendentes
      document.getElementById('totalAtendimentosCanceladosHoje').textContent = dados.statusAtendimentosHoje.cancelados
      const maiorTotal = Math.max(...dados.ultimosSeteDias.map((dia) => dia.total), 1)
      const grafico = document.getElementById('graficoUltimosSeteDias')
      grafico.replaceChildren(...dados.ultimosSeteDias.map((dia) => {
        const barra = criarElemento('div', ['barra-dia-dashboard'])
        barra.title = String(dia.data)
        const total = criarElemento('strong', [], String(dia.total))
        const preenchimento = criarElemento('i')
        preenchimento.style.height = `${Math.max(Number(dia.total) / maiorTotal * 100, 4)}%`
        const diaLabel = criarElemento('span', [], String(dia.data).slice(8))
        barra.append(total, preenchimento, diaLabel)
        return barra
      }))
      const analistasOrdenados = [...dados.analistas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      listaAnalistas.replaceChildren(...analistasOrdenados.map((analista) => {
        const iniciais = analista.nome.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()
        const ativo = analista.status.toLowerCase().startsWith('ativo')
        const card = criarElemento('article', ['card-analista', 'max-w-none'])
        card.tabIndex = 0
        card.setAttribute('role', 'button')
        card.dataset.username = analista.username
        const topo = criarElemento('div', ['card-analista-topo'])
        const avatar = criarElemento('span', ['avatar-analista'], iniciais)
        const status = criarElemento('span', ['status-analista', ativo ? 'status-ativo' : ''], analista.status)
        status.prepend(criarElemento('i'))
        topo.append(avatar, status)
        const nome = criarElemento('strong', [], analista.nome)
        const rodape = criarElemento('div', ['card-analista-rodape'])
        rodape.append(criarElemento('span', [], 'Hoje'), criarElemento('b', [], String(analista.atendimentosHoje)))
        card.append(topo, nome, rodape)
        return card
      }))
      listaAnalistas.querySelectorAll('.card-analista').forEach((card) => {
        const abrir = () => abrirDetalhesAnalista(card.dataset.username)
        card.addEventListener('click', abrir)
        card.addEventListener('keydown', (evento) => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); abrir() } })
      })
    }
    const modalDetalhes = document.getElementById('modalDetalhesAnalista')
    const listaDetalhes = document.getElementById('listaDetalhesAnalista')
    const resumoDetalhes = document.getElementById('resumoDetalhesAnalista')
    const modalDetalhesChamado = document.getElementById('modalDetalhesChamado')
    const camposDetalhesChamado = document.getElementById('camposDetalhesChamado')
    const statusDetalhesChamado = document.getElementById('statusDetalhesChamado')
    const fecharDetalhes = () => modalDetalhes.classList.add('oculto')
    const fecharDetalhesChamado = () => modalDetalhesChamado.classList.add('oculto')
    document.getElementById('fecharDetalhesAnalista').addEventListener('click', fecharDetalhes)
    document.getElementById('fecharDetalhesChamado').addEventListener('click', fecharDetalhesChamado)
    modalDetalhes.addEventListener('click', (evento) => { if (evento.target === modalDetalhes) fecharDetalhes() })
    modalDetalhesChamado.addEventListener('click', (evento) => { if (evento.target === modalDetalhesChamado) fecharDetalhesChamado() })
    function classificarChamado(chamado) {
      const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const base = normalizar(chamado.baseAcionada)
      const estado = normalizar([chamado.retratacaoFinal, chamado.retratacaoInicial, chamado.resumoTentativas].filter(Boolean).join(' '))
      const baseAcionada = base && !base.includes('nao acionad') && !base.includes('nao informado')
      if (estado.includes('cancelad') || estado.includes('nao acionad') || estado.includes('sem acionamento')) return { classe: 'status-vermelho', texto: 'Não acionado ou cancelado' }
      if (baseAcionada || estado.includes('acionad')) return { classe: 'status-verde', texto: 'Acionado' }
      if (estado.includes('agend')) return { classe: 'status-laranja', texto: 'Agendamento' }
      if (base.includes('nao acionad')) return { classe: 'status-vermelho', texto: 'Não acionado ou cancelado' }
      return { classe: 'status-laranja', texto: 'Agendamento' }
    }
    function abrirDetalhesChamado(chamado) {
      const status = classificarChamado(chamado)
      const campos = [
        ['PROTOCOLO', chamado.protocolo], ['SEGURADORA', chamado.seguradora], ['SERVIÇO', chamado.servico],
        ['PRÉVIA DO SERVIÇO', chamado.previaServico], ['LOCALIDADE', chamado.localidade], ['BASE ACIONADA', chamado.baseAcionada],
        ['DATA MARCADA', chamado.dataMarcada], ['HORÁRIO MARCADO', chamado.horarioMarcado],
        ['RETRATAÇÃO INICIAL', chamado.retratacaoInicial], ['RETRATAÇÃO FINAL', chamado.retratacaoFinal],
        ['RESUMO TENTATIVAS', chamado.resumoTentativas]
      ]
      statusDetalhesChamado.className = `status-detalhe-chamado ${status.classe}`
      statusDetalhesChamado.textContent = status.texto
      camposDetalhesChamado.replaceChildren(...campos.map(([rotulo, valor]) => {
        const campo = criarElemento('div', ['campo-detalhe-chamado'])
        campo.append(criarElemento('span', [], rotulo), criarElemento('strong', [], valor || 'Não informado'))
        return campo
      }))
      modalDetalhesChamado.classList.remove('oculto')
    }
    async function abrirDetalhesAnalista(username) {
      const resposta = await requisicaoAutenticada(`/api/dashboard/analistas/${encodeURIComponent(username)}`)
      if (!resposta.ok) { mostrarModalMensagem('Não foi possível carregar', 'Tente novamente em instantes.'); return }
      const dados = await resposta.json()
      document.getElementById('tituloDetalhesAnalista').textContent = dados.analista.nome
      const totalResumo = criarElemento('div', ['resumo-detalhes-item'], 'Total de chamados')
      totalResumo.append(criarElemento('strong', [], String(dados.total)))
      const hojeResumo = criarElemento('div', ['resumo-detalhes-item'], 'Atendidos hoje')
      hojeResumo.append(criarElemento('strong', [], String(dados.atendimentosHoje)))
      resumoDetalhes.replaceChildren(totalResumo, hojeResumo)
      listaDetalhes.replaceChildren(...(dados.chamados.length ? dados.chamados.map((chamado, indice) => {
        const status = classificarChamado(chamado)
        const item = criarElemento('article', ['item-detalhe-chamado', status.classe])
        item.tabIndex = 0
        item.setAttribute('role', 'button')
        item.dataset.chamadoIndice = String(indice)
        const cabecalho = criarElemento('div', ['item-detalhe-cabecalho'])
        cabecalho.append(criarElemento('span', [], 'Protocolo ' + (chamado.protocolo || '')), criarElemento('time', [], chamado.dataAtendimento || ''))
        const camposItem = criarElemento('div', ['item-detalhe-campos'])
        camposItem.append(criarElemento('span', [], 'Seguradora: ' + (chamado.seguradora || '')), criarElemento('span', [], 'Serviço: ' + (chamado.servico || '')), criarElemento('span', [], 'Localidade: ' + (chamado.localidade || '')), criarElemento('span', [], 'Base: ' + (chamado.baseAcionada || '')))
        item.append(cabecalho, camposItem)
        return item
      }) : [criarElemento('p', [], 'Nenhum chamado registrado para este analista.')]))
      listaDetalhes.querySelectorAll('.item-detalhe-chamado').forEach((item) => {
        const abrir = () => abrirDetalhesChamado(dados.chamados[Number(item.dataset.chamadoIndice)])
        item.addEventListener('click', abrir)
        item.addEventListener('keydown', (evento) => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); abrir() } })
      })
      modalDetalhes.classList.remove('oculto')
    }
    const sairSarah = () => { sessionStorage.removeItem('token_jwt'); window.location.reload() }
    document.getElementById('botaoSairDashboard').addEventListener('click', sairSarah)
    document.getElementById('botaoAtualizarDashboard').addEventListener('click', carregarDashboard)
    await carregarDashboard()
    return
  }

  const campoTexto = document.getElementById('textoChamado')
  const botaoProcessar = document.getElementById('botaoProcessar')
  const botaoColar = document.getElementById('botaoColar')
  const botaoLimpar = document.getElementById('botaoLimpar')
  const contadorCaracteres = document.getElementById('contadorCaracteres')
  const conteudoBotao = botaoProcessar.querySelector('.conteudo-botao')
  const indicadorCarregamento = document.getElementById('indicadorCarregamento')
  const containerToasts = document.getElementById('containerToasts')

  // Elementos das Métricas
  const metricaTotal = document.getElementById('metricaTotal')
  const metricaMediaPrevia = document.getElementById('metricaMediaPrevia')
  const metricaSeguradoras = document.getElementById('metricaSeguradoras')

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

  // Tema
  const botaoTema = document.getElementById('botaoTema')
  const iconeSol = document.getElementById('iconeSol')
  const iconeLua = document.getElementById('iconeLua')

  // Histórico e Pesquisa
  const toggleHistorico = document.getElementById('toggleHistorico')
  const painelHistorico = document.getElementById('painelHistorico')
  const listaHistorico = document.getElementById('listaHistorico')
  const totalHistorico = document.getElementById('totalHistorico')
  const campoPesquisaHistorico = document.getElementById('campoPesquisaHistorico')
  const botaoSincronizar = document.getElementById('botaoSincronizar')
  const botaoLimparHistorico = document.getElementById('botaoLimparHistorico')

  const abaAtual = () => seletorAba.value

  // 1. Disparar Toast Flutuante com Suporte a Undo e Link
  function dispararToast(titulo, mensagem, tipo = 'sucesso', duracao = 3000, opcoes = {}) {
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

    // Ações inline (Link Sheets ou Botão Desfazer)
    if (opcoes.linkUrl || opcoes.onDesfazer) {
      const containerAcoes = document.createElement('div')
      containerAcoes.className = 'acoes-toast'

      if (opcoes.linkUrl) {
        const elLink = document.createElement('a')
        elLink.href = opcoes.linkUrl
        elLink.target = '_blank'
        elLink.rel = 'noopener noreferrer'
        elLink.style.fontSize = '0.72rem'
        elLink.style.fontWeight = '700'
        elLink.style.color = 'var(--cor-primaria)'
        elLink.style.textDecoration = 'none'
        elLink.textContent = 'Abrir no Sheets ↗'
        containerAcoes.appendChild(elLink)
      }

      if (opcoes.onDesfazer) {
        const botaoUndo = document.createElement('button')
        botaoUndo.type = 'button'
        botaoUndo.className = 'botao-desfazer-toast'
        botaoUndo.textContent = 'Desfazer (Undo)'
        botaoUndo.addEventListener('click', () => {
          removerToast()
          opcoes.onDesfazer()
        })
        containerAcoes.appendChild(botaoUndo)
      }

      corpo.appendChild(containerAcoes)
    }

    const botaoFechar = document.createElement('button')
    botaoFechar.type = 'button'
    botaoFechar.className = 'toast-fechar'
    botaoFechar.textContent = '×'

    const trilhaProgresso = document.createElement('div')
    trilhaProgresso.className = 'toast-progresso'
    const barraProgresso = document.createElement('div')
    barraProgresso.className = 'toast-progresso-barra'
    barraProgresso.style.animationDuration = `${duracao}ms`
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

  // 2. Desfazer Última Gravação (Undo)
  async function executarDesfazer(id, protocolo) {
    try {
      const res = await requisicaoAutenticada('/api/desfazer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, username: abaAtual() })
      })

      const resposta = await res.json()
      if (!res.ok) throw new Error(resposta.erro || 'Falha ao desfazer gravação.')

      removerDoHistorico(protocolo)
      dispararToast('Chamado removido', `O registro ${protocolo} foi removido do sistema.`, 'aviso', 3000)
    } catch (erro) {
      dispararToast('Falha no Undo', erro.message, 'erro')
    }
  }

  // 3. Sanitização de Textos
  function sanitizarProtocolo(str = '') {
    return str.trim().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ')
  }

  function sanitizarTexto(str = '') {
    return str.trim().replace(/\s+/g, ' ')
  }

  // 4. Métricas do Turno
  function atualizarPainelMetricas() {
    const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    metricaTotal.textContent = historico.length

    if (historico.length === 0) {
      metricaMediaPrevia.textContent = '--'
      metricaSeguradoras.textContent = 'Nenhum registo'
      return
    }

    let minutosTotal = 0
    let contagemMinutos = 0
    const contagemSeguradoras = {}

    historico.forEach((item) => {
      const seg = item.seguradora || 'OUTROS'
      contagemSeguradoras[seg] = (contagemSeguradoras[seg] || 0) + 1

      if (item.previaServico) {
        const extraido = item.previaServico.match(/\d+/)
        if (extraido) {
          minutosTotal += parseInt(extraido[0], 10)
          contagemMinutos++
        }
      }
    })

    if (contagemMinutos > 0) {
      const media = Math.round(minutosTotal / contagemMinutos)
      metricaMediaPrevia.textContent = `${media} min`
    } else {
      metricaMediaPrevia.textContent = '--'
    }

    metricaSeguradoras.replaceChildren()
    Object.entries(contagemSeguradoras).slice(0, 3).forEach(([seg, total]) => {
      const tag = document.createElement('span')
      tag.className = 'tag-seguradora'
      tag.textContent = `${seg}: ${total}`
      metricaSeguradoras.appendChild(tag)
    })
  }

  // 5. Sincronização em tempo real com a Planilha
  async function sincronizarComPlanilhaReal() {
    try {
      const res = await requisicaoAutenticada(`/api/sincronizar?username=${encodeURIComponent(abaAtual())}`)
      const dados = await res.json()
      if (!res.ok) return

      let historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
      const protocolosAtivos = new Set(dados.protocolosAtivos || [])

      // Se a planilha estiver vazia, zera o histórico local
      if (!dados.totalNaPlanilha || dados.totalNaPlanilha === 0) {
        localStorage.removeItem('historico_chamados')
        carregarHistorico()
        return
      }

      // Mantém apenas os itens que realmente existem na planilha
      const historicoAtualizado = historico.filter(item => protocolosAtivos.has(item.protocolo))
      localStorage.setItem('historico_chamados', JSON.stringify(historicoAtualizado))
      carregarHistorico()
    } catch {
      // Ignora falhas de conexão de background
    }
  }

  // 6. Histórico e Consulta Rápida (Filtro Dinâmico + Botão Excluir)
  function renderizarListaHistorico(filtro = '') {
    const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    totalHistorico.textContent = historico.length
    listaHistorico.replaceChildren()

    const termo = filtro.trim().toLowerCase()
    const filtrados = historico.filter((item) => {
      if (!termo) return true
      return (
        item.protocolo.toLowerCase().includes(termo) ||
        item.seguradora.toLowerCase().includes(termo) ||
        item.servico.toLowerCase().includes(termo) ||
        (item.baseAcionada && item.baseAcionada.toLowerCase().includes(termo))
      )
    })

    if (filtrados.length === 0) {
      const vazio = document.createElement('div')
      vazio.style.padding = '8px'
      vazio.style.color = 'var(--cor-texto-secundario)'
      vazio.textContent = termo ? 'Nenhum resultado encontrado.' : 'Nenhum envio recente guardado.'
      listaHistorico.appendChild(vazio)
      return
    }

    filtrados.forEach((item) => {
      const card = document.createElement('div')
      card.className = 'item-historico'

      const detalhes = document.createElement('div')
      detalhes.className = 'item-historico-detalhes'

      const linhaPrincipal = document.createElement('strong')
      linhaPrincipal.textContent = `${item.protocolo} - ${item.seguradora}`

      const subLinha = document.createElement('span')
      subLinha.className = 'item-historico-sub'
      subLinha.textContent = `${item.servico} | Base: ${item.baseAcionada || 'N/D'}`

      detalhes.append(linhaPrincipal, subLinha)

      const containerDireita = document.createElement('div')
      containerDireita.className = 'item-historico-direita'

      const hora = document.createElement('span')
      hora.style.color = 'var(--cor-texto-secundario)'
      hora.style.fontSize = '0.75rem'
      hora.textContent = item.dataHora

      const botaoExcluirItem = document.createElement('button')
      botaoExcluirItem.type = 'button'
      botaoExcluirItem.className = 'botao-remover-item-historico'
      botaoExcluirItem.title = 'Remover do histórico local'
      botaoExcluirItem.textContent = '✕'
      botaoExcluirItem.addEventListener('click', (e) => {
        e.stopPropagation()
        removerDoHistorico(item.protocolo)
      })

      containerDireita.append(hora, botaoExcluirItem)
      card.append(detalhes, containerDireita)
      listaHistorico.appendChild(card)
    })
  }

  function carregarHistorico() {
    renderizarListaHistorico(campoPesquisaHistorico ? campoPesquisaHistorico.value : '')
    atualizarPainelMetricas()
  }

  function adicionarAoHistorico(dados, linhaCriada) {
    const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    historico.unshift({
      protocolo: dados.protocolo,
      seguradora: dados.seguradora,
      servico: dados.servico,
      baseAcionada: dados.baseAcionada,
      previaServico: dados.previaServico,
      linha: linhaCriada,
      dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })

    if (historico.length > 25) historico.pop()
    localStorage.setItem('historico_chamados', JSON.stringify(historico))
    carregarHistorico()
  }

  function removerDoHistorico(protocolo) {
    let historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    historico = historico.filter((item) => item.protocolo !== protocolo)
    localStorage.setItem('historico_chamados', JSON.stringify(historico))
    carregarHistorico()
  }

  if (campoPesquisaHistorico) {
    campoPesquisaHistorico.addEventListener('input', (e) => {
      renderizarListaHistorico(e.target.value)
    })
  }

  if (toggleHistorico) {
    toggleHistorico.addEventListener('click', () => {
      painelHistorico.classList.toggle('oculto')
    })
  }

  if (botaoSincronizar) {
    botaoSincronizar.addEventListener('click', async () => {
      botaoSincronizar.disabled = true
      await sincronizarComPlanilhaReal()
      dispararToast('Histórico atualizado', 'Os dados do sistema foram atualizados.', 'sucesso', 2000)
      botaoSincronizar.disabled = false
    })
  }

  if (botaoLimparHistorico) {
    botaoLimparHistorico.addEventListener('click', () => {
      localStorage.removeItem('historico_chamados')
      carregarHistorico()
      dispararToast('Histórico Limpo', 'Todos os envios locais foram zerados.', 'aviso', 2000)
    })
  }

  // Inicializa e sincroniza
  carregarHistorico()
  sincronizarComPlanilhaReal()

  // Sincroniza e faz Auto-Paste ao focar na janela
  let ultimoTextoAutoColado = ''
  window.addEventListener('focus', async () => {
    sincronizarComPlanilhaReal()

    try {
      if (campoTexto.value.trim().length > 0) return

      const conteudoClipboard = await navigator.clipboard.readText()
      if (
        conteudoClipboard &&
        conteudoClipboard !== ultimoTextoAutoColado &&
        (conteudoClipboard.includes('PROTOCOLO') || conteudoClipboard.includes('[ DADOS DO CHAMADO ]'))
      ) {
        campoTexto.value = conteudoClipboard
        ultimoTextoAutoColado = conteudoClipboard
        atualizarContador()
        dispararToast('Reconhecimento Automático', 'Texto de chamado identificado e colado.', 'aviso', 2500)
      }
    } catch {
      // Ignora restrições de permissão silenciosamente
    }
  })

  // 7. Tema Escuro / Claro
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

  function atualizarContador() {
    contadorCaracteres.textContent = `${campoTexto.value.length} caracteres`
  }
  campoTexto.addEventListener('input', atualizarContador)

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

  // 8. Modal de Confirmação
  function abrirModalComDados(dados, duplicado, linha) {
    campoProtocolo.value = sanitizarProtocolo(dados.protocolo || '')
    campoSeguradora.value = sanitizarTexto(dados.seguradora || '').toUpperCase()
    campoServico.value = sanitizarTexto(dados.servico || '').toUpperCase()
    campoPreviaServico.value = sanitizarTexto(dados.previaServico || '').toUpperCase()
    campoLocalidade.value = sanitizarTexto(dados.localidade || '').toUpperCase()
    campoBaseAcionada.value = sanitizarTexto(dados.baseAcionada || '').toUpperCase()
    campoDataMarcada.value = sanitizarTexto(dados.dataMarcada || '')
    campoHorarioMarcado.value = sanitizarTexto(dados.horarioMarcado || '').toUpperCase()
    campoRetratacaoInicial.value = sanitizarTexto(dados.retratacaoInicial || '')
    campoRetratacaoFinal.value = sanitizarTexto(dados.retratacaoFinal || '')
    campoResumoTentativas.value = String(dados.resumoTentativas || '').trim()

    if (duplicado) {
      avisoDuplicadoModal.textContent = `Atenção: O protocolo "${campoProtocolo.value}" já existe no histórico do sistema (registro ${linha})!`
      avisoDuplicadoModal.classList.remove('oculto')
      dispararToast('Duplicado Identificado', `Protocolo ${campoProtocolo.value} já está na linha ${linha}.`, 'aviso', 4000)
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
  modalConfirmacao.addEventListener('click', (evento) => { if (evento.target === modalConfirmacao) fecharModalEdicao() })

  // 9. Extração com IA
  botaoProcessar.addEventListener('click', async () => {
    const texto = campoTexto.value.trim()
    if (!texto || texto.length < 20) {
      dispararToast('Validação', 'Insira o texto completo do chamado antes de processar.', 'aviso')
      return
    }

    alternarCarregamento(true)

    try {
      const res = await requisicaoAutenticada('/api/previsualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoManual: texto, username: abaAtual() })
      })

      const resposta = await res.json()
      if (!res.ok) throw new Error(resposta.erro || 'Falha ao analisar chamado.')

      abrirModalComDados(resposta.dados, resposta.duplicado, resposta.chamadoDuplicado)
    } catch (erro) {
      dispararToast('Erro na Análise', erro.message, 'erro')
    } finally {
      alternarCarregamento(false)
    }
  })

  // 10. Gravação com Opção de Undo (30s)
  botaoConfirmarGravacao.addEventListener('click', async () => {
    const dadosParaGravar = {
      protocolo: sanitizarProtocolo(campoProtocolo.value),
      seguradora: sanitizarTexto(campoSeguradora.value).toUpperCase(),
      servico: sanitizarTexto(campoServico.value).toUpperCase(),
      previaServico: sanitizarTexto(campoPreviaServico.value).toUpperCase(),
      localidade: sanitizarTexto(campoLocalidade.value).toUpperCase(),
      baseAcionada: sanitizarTexto(campoBaseAcionada.value).toUpperCase(),
      dataMarcada: sanitizarTexto(campoDataMarcada.value),
      horarioMarcado: sanitizarTexto(campoHorarioMarcado.value).toUpperCase(),
      retratacaoInicial: sanitizarTexto(campoRetratacaoInicial.value),
      retratacaoFinal: sanitizarTexto(campoRetratacaoFinal.value),
      resumoTentativas: campoResumoTentativas.value.trim()
    }

    botaoConfirmarGravacao.disabled = true
    botaoConfirmarGravacao.textContent = 'A formatar e gravar...'

    try {
      const res = await requisicaoAutenticada('/api/gravar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: dadosParaGravar, username: abaAtual() })
      })

      const resposta = await res.json()
      if (!res.ok) throw new Error(resposta.erro || 'Falha ao gravar o chamado.')

      fecharModalEdicao()
      
      const idChamado = resposta.id

      dispararToast(
        'Gravação Concluída',
        `Protocolo ${dadosParaGravar.protocolo} salvo no sistema em ${resposta.dataAtendimento}.`,
        'sucesso',
        30000,
        {
          onDesfazer: idChamado ? () => executarDesfazer(idChamado, dadosParaGravar.protocolo) : null
        }
      )

      adicionarAoHistorico(dadosParaGravar, idChamado)
      campoTexto.value = ''
      atualizarContador()
    } catch (erro) {
      dispararToast('Erro na Gravação', erro.message, 'erro')
    } finally {
      botaoConfirmarGravacao.disabled = false
      botaoConfirmarGravacao.textContent = 'Salvar chamado'
    }
  })
})
