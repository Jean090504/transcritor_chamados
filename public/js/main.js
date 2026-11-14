document.addEventListener('DOMContentLoaded', async () => {
  const telaLogin = document.getElementById('telaLogin')
  const telaEsqueciSenha = document.getElementById('telaEsqueciSenha')
  const telaTrocaSenha = document.getElementById('telaTrocaSenha')
  const formularioLogin = document.getElementById('formularioLogin')
  const formularioEsqueciSenha = document.getElementById('formularioEsqueciSenha')
  const erroLogin = document.getElementById('erroLogin')
  const erroEsqueciSenha = document.getElementById('erroEsqueciSenha')
  const formularioTrocaSenha = document.getElementById('formularioTrocaSenha')
  const erroTrocaSenha = document.getElementById('erroTrocaSenha')
  const usuarioTrocaSenha = document.getElementById('usuarioTrocaSenha')
  const botaoSairTrocaSenha = document.getElementById('botaoSairTrocaSenha')
  const modalMensagemSistema = document.getElementById('modalMensagemSistema')
  const tituloMensagemSistema = document.getElementById('tituloMensagemSistema')
  const textoMensagemSistema = document.getElementById('textoMensagemSistema')
  const botaoFecharMensagemSistema = document.getElementById('botaoFecharMensagemSistema')
  const botaoEsqueciSenha = document.getElementById('botaoEsqueciSenha')
  const botaoVoltarLogin = document.getElementById('botaoVoltarLogin')
  const modalAjudaPlataforma = document.getElementById('modalAjudaPlataforma')
  const conteudoAjudaPlataforma = document.getElementById('conteudoAjudaPlataforma')
  const prepararAjudaPlataforma = () => {
    const perfil = usuarioAtual?.acessoOperacional ? 'operacional' : usuarioAtual?.acessoDashboard ? 'gestao' : 'analista'
    conteudoAjudaPlataforma?.querySelectorAll('[data-ajuda-perfil]').forEach((bloco) => bloco.classList.toggle('oculto', bloco.dataset.ajudaPerfil !== perfil))
  }
  const fecharAjudaPlataforma = () => modalAjudaPlataforma.classList.add('oculto')
  document.getElementById('botaoAjudaPlataforma')?.addEventListener('click', () => { prepararAjudaPlataforma(); modalAjudaPlataforma.classList.remove('oculto') })
  document.getElementById('fecharAjudaPlataforma')?.addEventListener('click', fecharAjudaPlataforma)
  modalAjudaPlataforma?.addEventListener('click', (evento) => { if (evento.target === modalAjudaPlataforma) fecharAjudaPlataforma() })
  const seletorAba = document.getElementById('seletorAba')
  const botaoSair = document.getElementById('botaoSair')
  const criarElemento = (tag, classes = [], texto = '') => {
    const elemento = document.createElement(tag)
    elemento.classList.add(...classes.filter(Boolean))
    if (texto) elemento.textContent = texto
    return elemento
  }
  const fusoBrasilia = 'America/Sao_Paulo'
  const formatarDataBrasilia = (data = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: fusoBrasilia }).format(data)
  const formatarHoraBrasilia = (data = new Date()) => new Intl.DateTimeFormat('pt-BR', { timeZone: fusoBrasilia, hour: '2-digit', minute: '2-digit' }).format(data)
  const formatarDataPtBr = (valor = '') => {
    const texto = String(valor || '').trim()
    const correspondencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
    return correspondencia ? `${correspondencia[3]}/${correspondencia[2]}/${correspondencia[1]}` : texto
  }
  const criarCalendarioData = (input) => {
    if (!input || input.dataset.calendarioPersonalizado) return
    input.dataset.calendarioPersonalizado = 'true'
    const seletor = document.createElement('div')
    seletor.className = 'seletor-data-historico'
    const botao = document.createElement('button')
    botao.className = 'botao-data-historico'
    botao.type = 'button'
    botao.setAttribute('aria-haspopup', 'dialog')
    botao.setAttribute('aria-expanded', 'false')
    botao.append(document.createElement('span'), Object.assign(document.createElement('i'), { ariaHidden: 'true' }))
    const calendario = document.createElement('div')
    calendario.className = 'calendario-historico'
    calendario.setAttribute('role', 'dialog')
    calendario.setAttribute('aria-label', 'Selecionar data')
    calendario.hidden = true
    const cabecalho = document.createElement('div')
    cabecalho.className = 'cabecalho-calendario-historico'
    const anterior = document.createElement('button')
    anterior.type = 'button'
    anterior.setAttribute('aria-label', 'Mês anterior')
    anterior.textContent = '‹'
    const titulo = document.createElement('strong')
    const seguinte = document.createElement('button')
    seguinte.type = 'button'
    seguinte.setAttribute('aria-label', 'Próximo mês')
    seguinte.textContent = '›'
    cabecalho.append(anterior, titulo, seguinte)
    const semana = document.createElement('div')
    semana.className = 'dias-semana-calendario'
    'DSTQQSS'.split('').forEach((dia) => semana.appendChild(document.createElement('span')).textContent = dia)
    const dias = document.createElement('div')
    dias.className = 'dias-calendario-historico'
    const rodape = document.createElement('div')
    rodape.className = 'rodape-calendario-historico'
    const campoHora = input.type === 'datetime-local' ? document.createElement('input') : null
    if (campoHora) {
      campoHora.type = 'time'
      campoHora.className = 'hora-calendario-historico'
      campoHora.setAttribute('aria-label', 'Horário')
      campoHora.value = input.value.slice(11, 16)
    }
    const limpar = document.createElement('button')
    limpar.type = 'button'
    limpar.textContent = 'Limpar'
    const hojeBotao = document.createElement('button')
    hojeBotao.type = 'button'
    hojeBotao.textContent = 'Hoje'
    rodape.append(...(campoHora ? [campoHora] : []), limpar, hojeBotao)
    calendario.append(cabecalho, semana, dias, rodape)
    const valorInicial = input.value.slice(0, 10)
    const mesInicial = valorInicial ? new Date(`${valorInicial}T12:00:00`) : new Date()
    let mesAtual = mesInicial
    input.parentNode.insertBefore(seletor, input)
    seletor.append(botao, calendario, input)
    const formatarData = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
    const atualizarBotao = () => { botao.querySelector('span').textContent = input.value ? `${formatarDataPtBr(input.value.slice(0, 10))}${campoHora?.value ? ` • ${campoHora.value}` : ''}` : 'Selecionar data' }
    const fechar = () => { calendario.hidden = true; botao.setAttribute('aria-expanded', 'false'); seletor.classList.remove('aberto') }
    const renderizar = () => {
      const ano = mesAtual.getFullYear()
      const mes = mesAtual.getMonth()
      titulo.textContent = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)
      dias.replaceChildren()
      const primeiroDia = new Date(ano, mes, 1).getDay()
      const quantidadeDias = new Date(ano, mes + 1, 0).getDate()
      const quantidadeDiasAnterior = new Date(ano, mes, 0).getDate()
      for (let indice = 0; indice < 42; indice += 1) {
        const deslocamento = indice - primeiroDia + 1
        const dia = document.createElement('button')
        dia.type = 'button'
        dia.className = 'dia-calendario-historico'
        let data
        if (deslocamento < 1) { data = new Date(ano, mes - 1, quantidadeDiasAnterior + deslocamento); dia.classList.add('outro-mes') }
        else if (deslocamento > quantidadeDias) { data = new Date(ano, mes + 1, deslocamento - quantidadeDias); dia.classList.add('outro-mes') }
        else data = new Date(ano, mes, deslocamento)
        const valor = formatarData(data)
        dia.textContent = String(data.getDate())
        if (valor === formatarData(new Date())) dia.classList.add('hoje')
        if (valor === input.value.slice(0, 10)) dia.classList.add('selecionado')
        dia.addEventListener('click', () => { input.value = campoHora ? `${valor}T${campoHora.value || '00:00'}` : valor; atualizarBotao(); fechar(); input.dispatchEvent(new Event('change', { bubbles: true })) })
        dias.appendChild(dia)
      }
    }
    botao.addEventListener('click', () => { const aberto = !calendario.hidden; calendario.hidden = aberto; botao.setAttribute('aria-expanded', String(!aberto)); seletor.classList.toggle('aberto', !aberto); if (!aberto) renderizar() })
    anterior.addEventListener('click', () => { mesAtual.setMonth(mesAtual.getMonth() - 1); renderizar() })
    seguinte.addEventListener('click', () => { mesAtual.setMonth(mesAtual.getMonth() + 1); renderizar() })
    limpar.addEventListener('click', () => { input.value = ''; if (campoHora) campoHora.value = ''; atualizarBotao(); fechar(); input.dispatchEvent(new Event('change', { bubbles: true })) })
    hojeBotao.addEventListener('click', () => { const hoje = new Date(); mesAtual = hoje; input.value = campoHora ? `${formatarData(hoje)}T${campoHora.value || '00:00'}` : formatarData(hoje); atualizarBotao(); fechar(); input.dispatchEvent(new Event('change', { bubbles: true })) })
    campoHora?.addEventListener('change', () => { if (input.value) input.value = `${input.value.slice(0, 10)}T${campoHora.value}`; atualizarBotao(); input.dispatchEvent(new Event('change', { bubbles: true })) })
    document.addEventListener('click', (evento) => { if (!seletor.contains(evento.target)) fechar() })
    input._atualizarCalendario = () => { if (campoHora) campoHora.value = input.value.slice(11, 16); atualizarBotao(); if (input.value) mesAtual = new Date(`${input.value.slice(0, 10)}T12:00:00`) }
    atualizarBotao()
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
  const manterSessaoAposFluxo = sessionStorage.getItem('manter_sessao_apos_recarga') === '1'
  sessionStorage.removeItem('manter_sessao_apos_recarga')
  if (!manterSessaoAposFluxo) sessionStorage.removeItem('token_jwt')
  let token = sessionStorage.getItem('token_jwt')
  let usuarioAtual = null

  window.addEventListener('pageshow', (evento) => {
    if (!evento.persisted) return
    sessionStorage.removeItem('token_jwt')
    window.location.reload()
  })

  function mostrarModalMensagem(titulo, mensagem) {
    tituloMensagemSistema.textContent = titulo
    textoMensagemSistema.textContent = mensagem
    modalMensagemSistema.classList.remove('oculto')
    botaoFecharMensagemSistema.focus()
  }

  function fecharModalMensagem() { modalMensagemSistema.classList.add('oculto') }
  botaoEsqueciSenha?.addEventListener('click', () => {
    setTimeout(() => {
      fecharModalMensagem()
      telaLogin.classList.add('oculto')
      telaEsqueciSenha.classList.remove('oculto')
      document.getElementById('usuarioEsqueciSenha').focus()
    }, 0)
  })
  botaoVoltarLogin?.addEventListener('click', () => {
    telaEsqueciSenha.classList.add('oculto')
    telaLogin.classList.remove('oculto')
    erroEsqueciSenha.classList.add('oculto')
  })
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
      if (usuarioAtual.acessoOperacional) {
        document.body.classList.add('modo-administrativo')
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
      document.body.classList.add('modo-analista')
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
        sessionStorage.setItem('manter_sessao_apos_recarga', '1')
        window.location.reload()
      } catch {
        mostrarModalMensagem('Não foi possível conectar', 'Verifique sua conexão e tente novamente em instantes.')
      }
    })
    formularioEsqueciSenha?.addEventListener('submit', async (evento) => {
      evento.preventDefault()
      erroEsqueciSenha.classList.add('oculto')
      const username = document.getElementById('usuarioEsqueciSenha').value.trim().toLowerCase()
      if (!username) {
        erroEsqueciSenha.textContent = 'Informe seu usuário.'
        erroEsqueciSenha.classList.remove('oculto')
        return
      }
      try {
        const resposta = await fetch('/api/auth/solicitar-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
        const dados = await resposta.json()
        if (!resposta.ok) {
          mostrarModalMensagem('Não foi possível solicitar', dados.erro || 'Confira o usuário e tente novamente.')
          return
        }
        mostrarModalMensagem('Solicitação enviada', dados.mensagem)
        formularioEsqueciSenha.reset()
      } catch {
        mostrarModalMensagem('Não foi possível enviar', 'Tente novamente em instantes.')
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
      sessionStorage.setItem('manter_sessao_apos_recarga', '1')
      window.location.reload()
    })
    return
  }

  if (usuarioAtual.acessoOperacional) {
    const painelOperacional = document.getElementById('painelOperacional')
    const textoOperacional = document.getElementById('textoOperacional')
    const formularioOperacional = document.getElementById('formularioOperacional')
    const camposOperacionais = document.getElementById('camposOperacionais')
    const botaoAnalisarOperacional = document.getElementById('botaoAnalisarOperacional')
    const botaoEnviarOperacional = document.getElementById('botaoEnviarOperacional')
    const subtituloOperacional = document.getElementById('subtituloOperacional')
    const identidadeOperacional = document.getElementById('identidadeOperacional')
    const listaHistoricoOperacional = document.getElementById('listaHistoricoOperacional')
    const mensagemHistoricoOperacional = document.getElementById('mensagemHistoricoOperacional')
    const botaoAtualizarHistoricoOperacional = document.getElementById('botaoAtualizarHistoricoOperacional')
    const nomeAdmOperacional = usuarioAtual.nome.includes('FLAVIO') ? 'FLAVIO MARCOLINO' : usuarioAtual.nome.includes('ELAINE') ? 'ELAINE MARREIROS' : usuarioAtual.nome
    const chaveRascunhoOperacional = `rascunho_operacional:${usuarioAtual.sub}`
    let idempotenciaOperacional = null
    const criarIdempotenciaOperacional = () => window.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (caractere) => { const aleatorio = Math.random() * 16 | 0; const valor = caractere === 'x' ? aleatorio : aleatorio & 3 | 8; return valor.toString(16) })
    const campos = [
      ['protocolo', 'Protocolo', 'text'], ['assistencia', 'Assistência', 'text'], ['barra', 'Barra', 'text', true], ['outraAssist', 'Outra assist.', 'text'],
      ['servico', 'Serviço', 'text'], ['cidade', 'Cidade', 'text'], ['uf', 'UF', 'text'], ['cliente', 'Cliente', 'text'],
      ['dataHoraSolicitacao', 'Data e hora da solicitação', 'datetime-local'], ['dataHoraRetorno', 'Data e hora do retorno', 'datetime-local'],
      ['tempoRetorno', 'Tempo de retorno', 'text', true], ['faixaRetorno', 'Faixa de retorno', 'text', true],
      ['porQuePedimosAuxilio', 'Por que pedimos auxílio?', 'text'], ['houveAtuacaoRede', 'Houve atuação da rede?', 'text'],
      ['retornoAuxilio', 'Retorno do auxílio', 'text'], ['servicoBaseIndicada', 'Serviço acionado com a base indicada', 'text'],
      ['resolucaoAcionamento', 'Resolução do acionamento', 'text'], ['baseAcionada', 'Base acionada', 'text'],
      ['respondidoPor', 'Respondido por', 'text', true], ['adm', 'Administrador responsável', 'text', true]
    ]
    const campoElementos = new Map()
    camposOperacionais.replaceChildren(...campos.map(([chave, rotulo, tipo, readonly]) => {
      const grupo = criarElemento('label', ['campo-operacional'])
      grupo.append(criarElemento('span', [], rotulo))
      const campo = document.createElement('input')
      campo.id = `operacional-${chave}`
      campo.name = chave
      campo.type = tipo
      campo.readOnly = Boolean(readonly)
      if (chave === 'adm') grupo.classList.add('campo-adm-operacional')
      campo.addEventListener('input', () => {
        if (chave === 'protocolo') {
          const barra = campoElementos.get('barra')
          const correspondencia = campo.value.match(/\/\s*(\d+)\s*$/)
          barra.value = correspondencia ? correspondencia[1] : ''
        }
        atualizarTempoOperacional()
        salvarRascunhoOperacional()
      })
      campoElementos.set(chave, campo)
      grupo.append(campo)
      if (tipo === 'datetime-local') criarCalendarioData(campo)
      return grupo
    }))
    const atualizarTempoOperacional = () => {
      const inicio = campoElementos.get('dataHoraSolicitacao').value
      const fim = campoElementos.get('dataHoraRetorno').value
      if (!inicio || !fim) { campoElementos.get('tempoRetorno').value = 'Não informado'; campoElementos.get('faixaRetorno').value = 'Não informado'; return }
      const minutos = Math.round((Date.parse(fim) - Date.parse(inicio)) / 60000)
      const valido = Number.isFinite(minutos) && minutos >= 0
      const total = valido ? `${minutos} min` : 'Não informado'
      const faixa = !valido ? 'Não informado' : minutos <= 15 ? 'Até 15 min' : minutos <= 30 ? '16–30 min' : minutos <= 60 ? '31–60 min' : 'Acima de 60 min'
      campoElementos.get('tempoRetorno').value = total
      campoElementos.get('faixaRetorno').value = faixa
    }
    const obterDadosOperacionais = () => Object.fromEntries([...campoElementos.entries()].map(([chave, campo]) => [chave, campo.value]))
    const salvarRascunhoOperacional = () => {
      const dados = obterDadosOperacionais()
      if (!textoOperacional.value.trim() && !dados.protocolo) {
        localStorage.removeItem(chaveRascunhoOperacional)
        return
      }
      localStorage.setItem(chaveRascunhoOperacional, JSON.stringify({ texto: textoOperacional.value, dados, idempotencia: idempotenciaOperacional }))
    }
    const validarDadosOperacionais = (dados) => {
      const obrigatorios = [['protocolo', 'protocolo'], ['assistencia', 'assistência'], ['servico', 'serviço'], ['cidade', 'cidade'], ['uf', 'UF'], ['cliente', 'cliente'], ['dataHoraSolicitacao', 'data e hora da solicitação'], ['dataHoraRetorno', 'data e hora do retorno']]
      const ausentes = obrigatorios.filter(([chave]) => !String(dados[chave] || '').trim()).map(([, rotulo]) => rotulo)
      if (ausentes.length) return `Preencha: ${ausentes.join(', ')}.`
      if (String(dados.uf).trim().length !== 2) return 'A UF deve ter 2 letras.'
      if (Date.parse(dados.dataHoraRetorno) < Date.parse(dados.dataHoraSolicitacao)) return 'A data do retorno não pode ser anterior à solicitação.'
      return null
    }
    const formatarDataHistorico = (valor) => {
      const data = new Date(valor)
      return Number.isNaN(data.getTime()) ? '' : data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    }
    const carregarHistoricoOperacional = async () => {
      try {
        const resposta = await requisicaoAutenticada('/api/operacional/historico?limite=20')
        const resultado = await resposta.json()
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível carregar o histórico.')
        listaHistoricoOperacional.replaceChildren()
        if (!resultado.historico.length) {
          mensagemHistoricoOperacional.textContent = 'Nenhum envio realizado ainda.'
          return
        }
        mensagemHistoricoOperacional.textContent = ''
        resultado.historico.forEach((item) => {
          const cartao = criarElemento('article', ['item-historico-operacional'])
          const informacoes = criarElemento('div', ['informacoes-historico-operacional'])
          const titulo = criarElemento('strong', [], item.protocolo || 'Protocolo não informado')
          const detalhe = criarElemento('span', [], `${item.assistencia || 'Assistência não informada'} · ${item.servico || 'Serviço não informado'}`)
          const data = criarElemento('time', [], formatarDataHistorico(item.criadoEm))
          informacoes.append(titulo, detalhe, data)
          const acoes = criarElemento('div', ['acoes-historico-operacional'])
          const status = criarElemento('span', [`status-historico-${String(item.status).toLowerCase()}`], item.status === 'ENVIADO' ? 'Enviado' : item.status === 'FALHA' ? 'Não enviado' : 'Enviando')
          acoes.append(status)
          if (item.status === 'FALHA') {
            const tentarNovamente = criarElemento('button', ['botao-secundario'], 'Tentar novamente')
            tentarNovamente.type = 'button'
            tentarNovamente.addEventListener('click', () => {
              preencherCamposOperacionais(item.dados)
              idempotenciaOperacional = item.chaveIdempotencia
              formularioOperacional.classList.remove('oculto')
              formularioOperacional.scrollIntoView({ behavior: 'smooth', block: 'start' })
        mensagemHistoricoOperacional.textContent = 'Você pode revisar os dados e tentar enviar novamente.'
            })
            acoes.append(tentarNovamente)
          }
          cartao.append(informacoes, acoes)
          listaHistoricoOperacional.append(cartao)
        })
      } catch (erro) {
      mensagemHistoricoOperacional.textContent = 'Não foi possível carregar os envios. Tente atualizar novamente.'
      }
    }
    const preencherCamposOperacionais = (dados) => {
      campos.forEach(([chave]) => { if (campoElementos.has(chave)) campoElementos.get(chave).value = dados[chave] || '' })
      campoElementos.forEach((campo) => campo._atualizarCalendario?.())
      campoElementos.get('respondidoPor').value = usuarioAtual.nome
      campoElementos.get('adm').value = nomeAdmOperacional
      atualizarTempoOperacional()
      salvarRascunhoOperacional()
    }
    identidadeOperacional.textContent = `Adm - ${nomeAdmOperacional}`
    subtituloOperacional.textContent = `Adm - ${nomeAdmOperacional} · envio independente para a planilha operacional`
    painelOperacional.classList.remove('oculto')
    document.body.classList.remove('sessao-carregando')
    const rascunhoSalvo = JSON.parse(localStorage.getItem(chaveRascunhoOperacional) || 'null')
    if (rascunhoSalvo) {
      textoOperacional.value = rascunhoSalvo.texto || ''
      idempotenciaOperacional = rascunhoSalvo.idempotencia || null
      if (rascunhoSalvo.dados && Object.values(rascunhoSalvo.dados).some(Boolean)) {
        preencherCamposOperacionais(rascunhoSalvo.dados)
        formularioOperacional.classList.remove('oculto')
      }
      mensagemHistoricoOperacional.textContent = 'Rascunho restaurado automaticamente.'
    }
    textoOperacional.addEventListener('input', salvarRascunhoOperacional)
    botaoAtualizarHistoricoOperacional?.addEventListener('click', carregarHistoricoOperacional)
    carregarHistoricoOperacional()
    botaoAnalisarOperacional.addEventListener('click', async () => {
      const texto = textoOperacional.value.trim()
      if (texto.length < 20) { mostrarModalMensagem('Texto insuficiente', 'Cole um atendimento com pelo menos 20 caracteres.'); return }
      if (!idempotenciaOperacional) idempotenciaOperacional = criarIdempotenciaOperacional()
      botaoAnalisarOperacional.disabled = true
      botaoAnalisarOperacional.textContent = 'Analisando...'
      try {
        const resposta = await requisicaoAutenticada('/api/operacional/previsualizar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ textoManual: texto }) })
        const dados = await resposta.json()
        if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível analisar o atendimento.')
        preencherCamposOperacionais(dados.dados)
        formularioOperacional.classList.remove('oculto')
      } catch (erro) { mostrarModalMensagem('Falha na análise', erro.message) } finally { botaoAnalisarOperacional.disabled = false; botaoAnalisarOperacional.textContent = 'Analisar atendimento' }
    })
    formularioOperacional.addEventListener('submit', async (evento) => {
      evento.preventDefault()
      const dados = obterDadosOperacionais()
      const erroValidacao = validarDadosOperacionais(dados)
      if (erroValidacao) { mostrarModalMensagem('Revise os dados', erroValidacao); return }
      if (!idempotenciaOperacional) idempotenciaOperacional = criarIdempotenciaOperacional()
      botaoEnviarOperacional.disabled = true
      try {
        const resposta = await requisicaoAutenticada('/api/operacional/gravar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dados, idempotencia: idempotenciaOperacional }) })
        const resultado = await resposta.json()
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível enviar o registro.')
        mostrarModalMensagem(resultado.duplicado ? 'Registro já enviado' : 'Registro enviado', resultado.duplicado ? 'Este atendimento já estava registrado e não foi duplicado.' : 'O atendimento foi enviado para a aba operacional da planilha.')
        textoOperacional.value = ''
        formularioOperacional.reset()
        campoElementos.forEach((campo) => campo._atualizarCalendario?.())
        campoElementos.get('respondidoPor').value = usuarioAtual.nome
        campoElementos.get('adm').value = nomeAdmOperacional
        campoElementos.get('barra').value = ''
        campoElementos.get('tempoRetorno').value = 'Não informado'
        campoElementos.get('faixaRetorno').value = 'Não informado'
        localStorage.removeItem(chaveRascunhoOperacional)
        idempotenciaOperacional = null
        carregarHistoricoOperacional()
      } catch (erro) { mostrarModalMensagem('Falha no envio', erro.message); carregarHistoricoOperacional() } finally { botaoEnviarOperacional.disabled = false }
    })
    document.getElementById('botaoColarOperacional')?.addEventListener('click', async () => { try { textoOperacional.value = await navigator.clipboard.readText(); textoOperacional.focus() } catch { mostrarModalMensagem('Não foi possível colar', 'Permita o acesso à área de transferência no navegador.') } })
    document.getElementById('botaoLimparOperacional')?.addEventListener('click', () => { formularioOperacional.reset(); campoElementos.forEach((campo) => campo._atualizarCalendario?.()); formularioOperacional.classList.add('oculto'); textoOperacional.value = ''; campoElementos.get('respondidoPor').value = usuarioAtual.nome; campoElementos.get('adm').value = nomeAdmOperacional; localStorage.removeItem(chaveRascunhoOperacional); idempotenciaOperacional = null; carregarHistoricoOperacional() })
    document.getElementById('botaoSairOperacional')?.addEventListener('click', () => { sessionStorage.removeItem('token_jwt'); window.location.reload() })
    return
  }

  botaoSair.addEventListener('click', () => { sessionStorage.removeItem('token_jwt'); window.location.reload() })
  seletorAba.addEventListener('change', () => sincronizarComPlanilhaReal())

  if (usuarioAtual.acessoDashboard) {
    const painelSarah = document.getElementById('painelSarah')
    const listaAnalistas = document.getElementById('listaAnalistasDashboard')
    const dataInicioDashboard = document.getElementById('dataInicioDashboard')
    const dataFimDashboard = document.getElementById('dataFimDashboard')
    const aplicarPeriodoDashboard = document.getElementById('aplicarPeriodoDashboard')
    const erroPeriodoDashboard = document.getElementById('erroPeriodoDashboard')
    const graficoComparativoStatus = document.getElementById('graficoComparativoStatus')
    const subtituloDashboard = document.getElementById('subtituloDashboard')
    const campoBuscaAssistenciasDashboard = document.getElementById('campoBuscaAssistenciasDashboard')
    const filtroStatusAssistenciasDashboard = document.getElementById('filtroStatusAssistenciasDashboard')
    const seletorStatusDashboard = document.getElementById('seletorStatusDashboard')
    const botaoStatusAssistenciasDashboard = document.getElementById('botaoStatusAssistenciasDashboard')
    const opcoesStatusAssistenciasDashboard = document.getElementById('opcoesStatusAssistenciasDashboard')
    criarCalendarioData(dataInicioDashboard)
    criarCalendarioData(dataFimDashboard)
    const listaGeralAssistenciasDashboard = document.getElementById('listaGeralAssistenciasDashboard')
    const contadorListaGeralDashboard = document.getElementById('contadorListaGeralDashboard')
    let dataReferenciaDashboard = ''
    let chamadosDashboard = []
    const renderizarListaGeralAssistencias = (filtro = '', statusFiltro = filtroStatusAssistenciasDashboard.value) => {
      const termo = String(filtro || '').trim().toLowerCase()
      const chamadosFiltrados = chamadosDashboard.filter((chamado) => {
        const status = classificarChamado(chamado)
        const correspondeStatus = statusFiltro === 'todos' || status.classe === statusFiltro
        const correspondeBusca = [chamado.protocolo, chamado.seguradora, chamado.servico, chamado.baseAcionada, chamado.nome, chamado.observacao].join(' ').toLowerCase().includes(termo)
        return correspondeStatus && correspondeBusca
      })
      contadorListaGeralDashboard.textContent = `${chamadosFiltrados.length} assistência${chamadosFiltrados.length === 1 ? '' : 's'}`
      if (!chamadosFiltrados.length) {
        listaGeralAssistenciasDashboard.replaceChildren(criarElemento('p', ['mensagem-lista-geral-dashboard'], termo ? 'Nenhuma assistência encontrada.' : 'Nenhuma assistência registrada ainda.'))
        return
      }
      listaGeralAssistenciasDashboard.replaceChildren(...chamadosFiltrados.map((chamado) => {
        const status = classificarChamado(chamado)
        const item = criarElemento('article', ['item-lista-geral-dashboard', status.classe])
        item.tabIndex = 0
        item.setAttribute('role', 'button')
        const topo = criarElemento('div', ['item-lista-geral-topo'])
        topo.append(criarElemento('strong', [], chamado.protocolo || 'Protocolo não informado'), criarElemento('time', [], formatarDataPtBr(chamado.dataAtendimento)))
        const detalhes = criarElemento('div', ['item-lista-geral-detalhes'])
        detalhes.append(criarElemento('span', [], chamado.seguradora || 'Seguradora não informada'), criarElemento('span', [], chamado.servico || 'Serviço não informado'), criarElemento('span', [], `Analista: ${chamado.nome || 'Não informado'}`), criarElemento('span', [], `Base: ${chamado.baseAcionada || 'Não informada'}`))
        if (chamado.observacao) detalhes.append(criarElemento('span', [], `Observação: ${chamado.observacao}`))
        item.append(topo, detalhes)
        const abrir = () => abrirDetalhesChamado(chamado)
        item.addEventListener('click', abrir)
        item.addEventListener('keydown', (evento) => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); abrir() } })
        return item
      }))
    }
    campoBuscaAssistenciasDashboard.addEventListener('input', () => renderizarListaGeralAssistencias(campoBuscaAssistenciasDashboard.value))
    const fecharOpcoesStatusDashboard = () => {
      opcoesStatusAssistenciasDashboard.hidden = true
      botaoStatusAssistenciasDashboard.setAttribute('aria-expanded', 'false')
      seletorStatusDashboard.classList.remove('aberto')
    }
    botaoStatusAssistenciasDashboard.addEventListener('click', () => {
      const aberto = !opcoesStatusAssistenciasDashboard.hidden
      opcoesStatusAssistenciasDashboard.hidden = aberto
      botaoStatusAssistenciasDashboard.setAttribute('aria-expanded', String(!aberto))
      seletorStatusDashboard.classList.toggle('aberto', !aberto)
    })
    opcoesStatusAssistenciasDashboard.querySelectorAll('[data-value]').forEach((opcao) => {
      opcao.addEventListener('click', () => {
        filtroStatusAssistenciasDashboard.value = opcao.dataset.value
        botaoStatusAssistenciasDashboard.querySelector('span').textContent = opcao.querySelector('span').textContent
        opcoesStatusAssistenciasDashboard.querySelectorAll('[data-value]').forEach((item) => item.setAttribute('aria-selected', String(item === opcao)))
        fecharOpcoesStatusDashboard()
        renderizarListaGeralAssistencias(campoBuscaAssistenciasDashboard.value, filtroStatusAssistenciasDashboard.value)
      })
    })
    document.addEventListener('click', (evento) => {
      if (!seletorStatusDashboard.contains(evento.target)) fecharOpcoesStatusDashboard()
    })
    const nomePerfil = usuarioAtual.papel === 'root'
      ? 'Root'
      : `Supervisora ${usuarioAtual.sub.split('.').map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1)).join(' ')}`
    subtituloDashboard.textContent = nomePerfil
    const painelSolicitacoesReset = document.getElementById('painelSolicitacoesReset')
    const listaSolicitacoesReset = document.getElementById('listaSolicitacoesReset')
    const contadorSolicitacoesReset = document.getElementById('contadorSolicitacoesReset')
    const carregarSolicitacoesReset = async () => {
      const resposta = await requisicaoAutenticada('/api/auth/solicitacoes-reset')
      if (!resposta.ok) return
      const { solicitacoes } = await resposta.json()
      if (!solicitacoes.length) {
        painelSolicitacoesReset.classList.add('oculto')
        listaSolicitacoesReset.replaceChildren()
        return
      }

      painelSolicitacoesReset.classList.remove('oculto')
      contadorSolicitacoesReset.textContent = `${solicitacoes.length} pendente${solicitacoes.length === 1 ? '' : 's'}`
      listaSolicitacoesReset.replaceChildren(...solicitacoes.map((solicitacao) => {
        const item = criarElemento('article', ['item-solicitacao-reset'])
        const informacoes = criarElemento('div', ['informacoes-solicitacao-reset'])
        informacoes.append(
          criarElemento('strong', [], solicitacao.nome),
          criarElemento('span', [], solicitacao.username),
          criarElemento('time', [], `Solicitado em ${new Date(solicitacao.solicitadoEm).toLocaleString('pt-BR')}`)
        )
        const acoes = criarElemento('div', ['acoes-solicitacao-reset'])
        const aprovar = criarElemento('button', ['botao-primario'], 'Aprovar reset')
        const rejeitar = criarElemento('button', ['botao-secundario'], 'Rejeitar')
        aprovar.addEventListener('click', async () => {
          aprovar.disabled = true
          const respostaAprovacao = await requisicaoAutenticada(`/api/auth/solicitacoes-reset/${encodeURIComponent(solicitacao.id)}/aprovar`, { method: 'POST' })
          const dadosAprovacao = await respostaAprovacao.json()
          if (!respostaAprovacao.ok) {
            aprovar.disabled = false
            mostrarModalMensagem('Não foi possível aprovar', dadosAprovacao.erro || 'Tente novamente em instantes.')
            return
          }
          await carregarSolicitacoesReset()
          mostrarModalMensagem('Reset aprovado', `Usuário: ${dadosAprovacao.reset.username}\nSenha temporária: ${dadosAprovacao.reset.senhaTemporaria}\n\nInforme essa senha ao usuário. Ela será trocada no primeiro login.`)
        })
        rejeitar.addEventListener('click', async () => {
          rejeitar.disabled = true
          const respostaRejeicao = await requisicaoAutenticada(`/api/auth/solicitacoes-reset/${encodeURIComponent(solicitacao.id)}/rejeitar`, { method: 'POST' })
          const dadosRejeicao = await respostaRejeicao.json()
          if (!respostaRejeicao.ok) {
            rejeitar.disabled = false
            mostrarModalMensagem('Não foi possível rejeitar', dadosRejeicao.erro || 'Tente novamente em instantes.')
            return
          }
          await carregarSolicitacoesReset()
        })
        acoes.append(aprovar, rejeitar)
        item.append(informacoes, acoes)
        return item
      }))
    }
    const formatarDataGrafico = (data) => `${data.slice(8)}/${data.slice(5, 7)}`
    const renderizarGraficoVolume = (serieDiaria) => {
      const maiorTotal = Math.max(...serieDiaria.map((dia) => dia.total), 1)
      const grafico = document.getElementById('graficoUltimosSeteDias')
      grafico.replaceChildren(...serieDiaria.map((dia) => {
        const barra = criarElemento('div', ['barra-dia-dashboard'])
        barra.tabIndex = 0
        barra.setAttribute('role', 'img')
        barra.setAttribute('aria-label', `${formatarDataGrafico(dia.data)}: ${dia.total} atendimento${dia.total === 1 ? '' : 's'}`)
        const total = criarElemento('strong', [], String(dia.total))
        const preenchimento = criarElemento('i')
        preenchimento.style.height = `${Math.max(Number(dia.total) / maiorTotal * 100, 4)}%`
        const diaLabel = criarElemento('span', [], formatarDataGrafico(dia.data))
        const tooltip = criarElemento('div', ['tooltip-volume-dashboard'])
        tooltip.append(criarElemento('strong', [], formatarDataGrafico(dia.data)), criarElemento('span', [], `${dia.total} atendimento${dia.total === 1 ? '' : 's'}`))
        barra.addEventListener('mouseenter', () => tooltip.classList.add('tooltip-visivel'))
        barra.addEventListener('mouseleave', () => tooltip.classList.remove('tooltip-visivel'))
        barra.addEventListener('focus', () => tooltip.classList.add('tooltip-visivel'))
        barra.addEventListener('blur', () => tooltip.classList.remove('tooltip-visivel'))
        barra.append(total, preenchimento, diaLabel, tooltip)
        return barra
      }))
    }
    const renderizarGraficoStatus = (serieDiaria) => {
      const categorias = [
        ['acionados', 'Acionados'],
        ['agendados', 'Agendados'],
        ['cancelados', 'Cancelados']
      ]
      const maiorStatus = Math.max(...serieDiaria.flatMap((dia) => categorias.map(([chave]) => dia[chave])), 1)
      graficoComparativoStatus.replaceChildren(...serieDiaria.map((dia) => {
        const grupo = criarElemento('div', ['grupo-status-dashboard'])
        grupo.tabIndex = 0
        grupo.setAttribute('role', 'img')
        grupo.setAttribute('aria-label', `${formatarDataGrafico(dia.data)}: ${dia.acionados} acionados, ${dia.agendados} agendados e ${dia.cancelados} cancelados`)
        const barras = criarElemento('div', ['barras-status-dashboard'])
        categorias.forEach(([chave, rotulo]) => {
          const barra = criarElemento('div', ['barra-status-dashboard', `barra-status-${chave}`])
          barra.style.height = `${Math.max(Number(dia[chave]) / maiorStatus * 100, 3)}%`
          barras.append(barra)
        })
        const tooltip = criarElemento('div', ['tooltip-status-dashboard'])
        tooltip.append(criarElemento('strong', [], formatarDataGrafico(dia.data)), criarElemento('span', ['total-tooltip-status'], `Total: ${dia.total}`))
        categorias.forEach(([chave, rotulo]) => {
          const linha = criarElemento('span', ['linha-tooltip-status', `linha-tooltip-${chave}`])
          linha.append(criarElemento('i'), criarElemento('span', [], `${rotulo}: ${dia[chave]}`))
          tooltip.append(linha)
        })
        grupo.addEventListener('mouseenter', () => tooltip.classList.add('tooltip-visivel'))
        grupo.addEventListener('mouseleave', () => tooltip.classList.remove('tooltip-visivel'))
        grupo.addEventListener('focus', () => tooltip.classList.add('tooltip-visivel'))
        grupo.addEventListener('blur', () => tooltip.classList.remove('tooltip-visivel'))
        grupo.append(barras, criarElemento('span', [], formatarDataGrafico(dia.data)), tooltip)
        return grupo
      }))
    }
    const carregarDashboard = async (inicio = '', fim = '') => {
      const parametros = inicio && fim ? `?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}` : ''
      const resposta = await requisicaoAutenticada(`/api/dashboard${parametros}`)
      if (!resposta.ok) return
      const dados = await resposta.json()
      chamadosDashboard = dados.chamados || []
      renderizarListaGeralAssistencias(campoBuscaAssistenciasDashboard.value)
      dataReferenciaDashboard = dados.data
      document.body.classList.add('modo-dashboard')
      painelSarah.classList.remove('oculto')
      document.getElementById('dataDashboard').textContent = `${formatarDataGrafico(dados.periodo.inicio)} a ${formatarDataGrafico(dados.periodo.fim)}`
      subtituloDashboard.textContent = nomePerfil
      document.getElementById('totalAtendimentosHoje').textContent = dados.totalHoje
      document.getElementById('totalAtendimentosAcionadosHoje').textContent = dados.statusAtendimentosHoje.acionados
      document.getElementById('totalAtendimentosPendentesHoje').textContent = dados.statusAtendimentosHoje.pendentes
      document.getElementById('totalAtendimentosCanceladosHoje').textContent = dados.statusAtendimentosHoje.cancelados
      dataInicioDashboard.value = dados.periodo.inicio
      dataFimDashboard.value = dados.periodo.fim
      dataInicioDashboard._atualizarCalendario?.()
      dataFimDashboard._atualizarCalendario?.()
      renderizarGraficoVolume(dados.resumoPeriodo.serieDiaria)
      renderizarGraficoStatus(dados.resumoPeriodo.serieDiaria)
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
        const statusHoje = analista.statusHoje || { acionados: 0, pendentes: 0, cancelados: 0 }
        const resumoStatus = criarElemento('small', ['card-analista-status'], `${statusHoje.acionados} acionados · ${statusHoje.pendentes} agendados · ${statusHoje.cancelados} cancelado${statusHoje.cancelados === 1 ? '' : 's'}`)
        rodape.append(criarElemento('span', [], 'Hoje'), criarElemento('b', [], String(analista.atendimentosHoje)), resumoStatus)
        card.append(topo, nome, rodape)
        return card
      }))
      listaAnalistas.querySelectorAll('.card-analista').forEach((card) => {
        const abrir = () => abrirDetalhesAnalista(card.dataset.username)
        card.addEventListener('click', abrir)
        card.addEventListener('keydown', (evento) => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); abrir() } })
      })
    }
    const somarDiasData = (data, quantidade) => {
      const dataCalculada = new Date(`${data}T12:00:00Z`)
      dataCalculada.setUTCDate(dataCalculada.getUTCDate() + quantidade)
      return dataCalculada.toISOString().slice(0, 10)
    }
    const obterPeriodoAtalho = (atalho) => {
      const fim = dataReferenciaDashboard
      if (atalho === 'hoje') return { inicio: fim, fim }
      if (atalho === '7') return { inicio: somarDiasData(fim, -6), fim }
      if (atalho === '30') return { inicio: somarDiasData(fim, -29), fim }
      if (atalho === 'mes') return { inicio: `${fim.slice(0, 7)}-01`, fim }
      const ultimoDiaMesAnterior = new Date(`${fim.slice(0, 7)}-01T12:00:00Z`)
      ultimoDiaMesAnterior.setUTCDate(0)
      const fimMesAnterior = ultimoDiaMesAnterior.toISOString().slice(0, 10)
      return { inicio: `${fimMesAnterior.slice(0, 7)}-01`, fim: fimMesAnterior }
    }
    const aplicarPeriodo = async (inicio, fim) => {
      if (!inicio || !fim) {
        erroPeriodoDashboard.textContent = 'Informe a data inicial e a data final.'
        erroPeriodoDashboard.classList.remove('oculto')
        return
      }
      if (inicio > fim) {
        erroPeriodoDashboard.textContent = 'A data inicial deve ser anterior ou igual à data final.'
        erroPeriodoDashboard.classList.remove('oculto')
        return
      }
      erroPeriodoDashboard.classList.add('oculto')
      await carregarDashboard(inicio, fim)
    }
    document.querySelectorAll('.botao-periodo-dashboard').forEach((botao) => {
      botao.addEventListener('click', async () => {
        const periodo = obterPeriodoAtalho(botao.dataset.periodo)
        dataInicioDashboard.value = periodo.inicio
        dataFimDashboard.value = periodo.fim
        dataInicioDashboard._atualizarCalendario?.()
        dataFimDashboard._atualizarCalendario?.()
        document.querySelectorAll('.botao-periodo-dashboard').forEach((item) => item.classList.remove('periodo-ativo'))
        botao.classList.add('periodo-ativo')
        await aplicarPeriodo(periodo.inicio, periodo.fim)
      })
    })
    aplicarPeriodoDashboard.addEventListener('click', async () => {
      document.querySelectorAll('.botao-periodo-dashboard').forEach((item) => item.classList.remove('periodo-ativo'))
      await aplicarPeriodo(dataInicioDashboard.value, dataFimDashboard.value)
    })
    const modalDetalhes = document.getElementById('modalDetalhesAnalista')
    const listaDetalhes = document.getElementById('listaDetalhesAnalista')
    const resumoDetalhes = document.getElementById('resumoDetalhesAnalista')
    const modalDetalhesChamado = document.getElementById('modalDetalhesChamado')
    const camposDetalhesChamado = document.getElementById('camposDetalhesChamado')
    const statusDetalhesChamado = document.getElementById('statusDetalhesChamado')
    const botaoSalvarEdicaoChamado = document.getElementById('botaoSalvarEdicaoChamado')
    let chamadoEmEdicao = null
    let usernameEmEdicao = null
    const fecharDetalhes = () => modalDetalhes.classList.add('oculto')
    const fecharDetalhesChamado = () => modalDetalhesChamado.classList.add('oculto')
    document.getElementById('fecharDetalhesAnalista').addEventListener('click', fecharDetalhes)
    document.getElementById('fecharDetalhesChamado').addEventListener('click', fecharDetalhesChamado)
    modalDetalhes.addEventListener('click', (evento) => { if (evento.target === modalDetalhes) fecharDetalhes() })
    modalDetalhesChamado.addEventListener('click', (evento) => { if (evento.target === modalDetalhesChamado) fecharDetalhesChamado() })
    function classificarChamado(chamado) {
      const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const base = normalizar(chamado.baseAcionada)
      const estado = normalizar([chamado.servico, chamado.previaServico, chamado.baseAcionada, chamado.retratacaoFinal, chamado.retratacaoInicial, chamado.resumoTentativas, chamado.observacao].filter(Boolean).join(' '))
      const retratacaoFinal = normalizar(chamado.retratacaoFinal)
      const baseAcionada = base && !/nao acionad|nao informado|sem acionamento|sem base/.test(base)
      const cancelamentoExplicito = /cancel/.test(estado)
      const agendamentoConfirmado = /agendad|agendament|\bagenda\b|\bag\s*\d{1,2}\b/.test(retratacaoFinal)
      if (cancelamentoExplicito) return { classe: 'status-vermelho', texto: 'Cancelado' }
      if (agendamentoConfirmado) return { classe: 'status-laranja', texto: 'Agendamento' }
      if (/reembols/.test(estado)) return { classe: 'status-vermelho', texto: 'Cancelado' }
      if (/agendad|agendament|\bagenda\b/.test(estado)) return { classe: 'status-laranja', texto: 'Agendamento' }
      const acionamentoConfirmado = /\bacionad[oa]s?\b/.test(estado) && !/sem base acionad|nao acionad|sem acionamento/.test(estado)
      if (baseAcionada || acionamentoConfirmado) return { classe: 'status-verde', texto: 'Acionado' }
      return { classe: 'status-laranja', texto: 'Agendamento' }
    }
    function abrirDetalhesChamado(chamado) {
      chamadoEmEdicao = chamado
      const status = classificarChamado(chamado)
      const campos = [
        ['PROTOCOLO', chamado.protocolo], ['SEGURADORA', chamado.seguradora], ['SERVIÇO', chamado.servico],
        ['PRÉVIA DO SERVIÇO', chamado.previaServico], ['LOCALIDADE', chamado.localidade], ['BASE ACIONADA', chamado.baseAcionada],
        ['DATA MARCADA', chamado.dataMarcada], ['HORÁRIO MARCADO', chamado.horarioMarcado],
        ['RETRATAÇÃO INICIAL', chamado.retratacaoInicial], ['RETRATAÇÃO FINAL', chamado.retratacaoFinal],
        ['RESUMO TENTATIVAS', chamado.resumoTentativas], ['OBSERVAÇÃO', chamado.observacao]
      ]
      statusDetalhesChamado.className = `status-detalhe-chamado ${status.classe}`
      statusDetalhesChamado.textContent = status.texto
      camposDetalhesChamado.replaceChildren(...campos.map(([rotulo, valor]) => {
        const campo = criarElemento('div', ['campo-detalhe-chamado', rotulo === 'RESUMO TENTATIVAS' || rotulo === 'OBSERVAÇÃO' ? 'campo-detalhe-largo' : ''])
        campo.append(criarElemento('span', [], rotulo), criarElemento('strong', [], valor || 'Não informado'))
        return campo
      }))
      const chaves = ['protocolo', 'seguradora', 'servico', 'previaServico', 'localidade', 'baseAcionada', 'dataMarcada', 'horarioMarcado', 'retratacaoInicial', 'retratacaoFinal', 'resumoTentativas', 'observacao']
      camposDetalhesChamado.querySelectorAll('.campo-detalhe-chamado').forEach((campo, indice) => {
        const entrada = document.createElement(chaves[indice] === 'resumoTentativas' || chaves[indice] === 'observacao' ? 'textarea' : 'input')
        entrada.name = chaves[indice]
        entrada.value = chamado[chaves[indice]] || ''
        if (chaves[indice] === 'resumoTentativas' || chaves[indice] === 'observacao') entrada.rows = 4
        campo.replaceChild(entrada, campo.lastElementChild)
      })
      modalDetalhesChamado.classList.remove('oculto')
    }
    botaoSalvarEdicaoChamado.addEventListener('click', async () => {
      if (!chamadoEmEdicao || !usernameEmEdicao) return
      const dados = Object.fromEntries([...camposDetalhesChamado.querySelectorAll('[name]')].map((campo) => [campo.name, campo.value.trim()]))
      botaoSalvarEdicaoChamado.disabled = true
      try {
        const resposta = await requisicaoAutenticada(`/api/dashboard/analistas/${encodeURIComponent(usernameEmEdicao)}/chamados/${encodeURIComponent(chamadoEmEdicao.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dados }) })
        const resultado = await resposta.json()
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível salvar as alterações.')
        mostrarModalMensagem('Chamado atualizado', 'As alterações foram salvas com sucesso.')
        fecharDetalhesChamado()
        await carregarDashboard()
        await abrirDetalhesAnalista(usernameEmEdicao)
      } catch (erro) { mostrarModalMensagem('Falha ao atualizar', erro.message) } finally { botaoSalvarEdicaoChamado.disabled = false }
    })
    async function abrirDetalhesAnalista(username) {
      usernameEmEdicao = username
      const resposta = await requisicaoAutenticada(`/api/dashboard/analistas/${encodeURIComponent(username)}`)
      if (!resposta.ok) { mostrarModalMensagem('Não foi possível carregar', 'Tente novamente em instantes.'); return }
      const dados = await resposta.json()
      document.getElementById('tituloDetalhesAnalista').textContent = dados.analista.nome
      const totalResumo = criarElemento('div', ['resumo-detalhes-item'], 'Total de chamados')
      totalResumo.append(criarElemento('strong', [], String(dados.total)))
      const hojeResumo = criarElemento('div', ['resumo-detalhes-item'], 'Atendidos hoje')
      hojeResumo.append(criarElemento('strong', [], String(dados.atendimentosHoje)))
      const statusHoje = dados.statusHoje || { acionados: 0, pendentes: 0, cancelados: 0 }
      const acionadosResumo = criarElemento('div', ['resumo-detalhes-item'], 'Acionados hoje')
      acionadosResumo.append(criarElemento('strong', [], String(statusHoje.acionados)))
      const agendadosResumo = criarElemento('div', ['resumo-detalhes-item'], 'Agendados hoje')
      agendadosResumo.append(criarElemento('strong', [], String(statusHoje.pendentes)))
      const canceladosResumo = criarElemento('div', ['resumo-detalhes-item'], 'Cancelados hoje')
      canceladosResumo.append(criarElemento('strong', [], String(statusHoje.cancelados)))
      resumoDetalhes.replaceChildren(totalResumo, hojeResumo, acionadosResumo, agendadosResumo, canceladosResumo)
      listaDetalhes.replaceChildren(...(dados.chamados.length ? dados.chamados.map((chamado, indice) => {
        const status = classificarChamado(chamado)
        const item = criarElemento('article', ['item-detalhe-chamado', status.classe])
        item.tabIndex = 0
        item.setAttribute('role', 'button')
        item.dataset.chamadoIndice = String(indice)
        const cabecalho = criarElemento('div', ['item-detalhe-cabecalho'])
        cabecalho.append(criarElemento('span', [], 'Protocolo ' + (chamado.protocolo || '')), criarElemento('time', [], formatarDataPtBr(chamado.dataAtendimento)))
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
    await carregarSolicitacoesReset()
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
  const metricaAcionados = document.getElementById('metricaAcionados')
  const metricaPendentes = document.getElementById('metricaPendentes')
  const metricaCancelados = document.getElementById('metricaCancelados')
  const metricaTaxa = document.getElementById('metricaTaxa')

  // Elementos do Modal
  const modalConfirmacao = document.getElementById('modalConfirmacao')
  const fecharModal = document.getElementById('fecharModal')
  const botaoCancelarModal = document.getElementById('botaoCancelarModal')
  const botaoConfirmarGravacao = document.getElementById('botaoConfirmarGravacao')
  const avisoDuplicadoModal = document.getElementById('avisoDuplicadoModal')
  let chamadoEmEdicao = null
  const modalExclusaoChamado = document.getElementById('modalExclusaoChamado')
  const protocoloConfirmacaoExclusao = document.getElementById('protocoloConfirmacaoExclusao')
  const dataConfirmacaoExclusao = document.getElementById('dataConfirmacaoExclusao')
  const erroConfirmacaoExclusao = document.getElementById('erroConfirmacaoExclusao')
  const botaoConfirmarExclusao = document.getElementById('botaoConfirmarExclusao')
  let chamadoParaExcluir = null
  criarCalendarioData(dataConfirmacaoExclusao)
  const fecharModalExclusao = () => { modalExclusaoChamado.classList.add('oculto'); chamadoParaExcluir = null }
  const abrirModalExclusao = (chamado) => {
    chamadoParaExcluir = chamado
    protocoloConfirmacaoExclusao.value = ''
    dataConfirmacaoExclusao.value = ''
    dataConfirmacaoExclusao._atualizarCalendario?.()
    erroConfirmacaoExclusao.textContent = ''
    erroConfirmacaoExclusao.classList.add('oculto')
    modalExclusaoChamado.classList.remove('oculto')
    protocoloConfirmacaoExclusao.focus()
  }
  document.getElementById('fecharModalExclusao').addEventListener('click', fecharModalExclusao)
  document.getElementById('botaoCancelarExclusao').addEventListener('click', fecharModalExclusao)
  modalExclusaoChamado.addEventListener('click', (evento) => { if (evento.target === modalExclusaoChamado) fecharModalExclusao() })
  botaoConfirmarExclusao.addEventListener('click', async () => {
    if (!chamadoParaExcluir) return
    const dataHoje = formatarDataBrasilia()
    if (protocoloConfirmacaoExclusao.value.trim() !== String(chamadoParaExcluir.protocolo || '').trim() || dataConfirmacaoExclusao.value !== dataHoje) {
      erroConfirmacaoExclusao.textContent = 'Digite o protocolo exatamente como aparece e selecione a data de hoje.'
      erroConfirmacaoExclusao.classList.remove('oculto')
      return
    }
    botaoConfirmarExclusao.disabled = true
    try {
      const resposta = await requisicaoAutenticada(`/api/chamados/${encodeURIComponent(chamadoParaExcluir.linha)}`, { method: 'DELETE' })
      const resultado = await resposta.json()
      if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível excluir o chamado.')
      const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]').filter((item) => item.linha !== chamadoParaExcluir.linha)
      localStorage.setItem('historico_chamados', JSON.stringify(historico))
      const protocolo = chamadoParaExcluir.protocolo
      fecharModalExclusao()
      carregarHistorico()
      dispararToast('Chamado excluído', `O protocolo ${protocolo} foi excluído com sucesso.`, 'aviso')
    } catch (erro) {
      erroConfirmacaoExclusao.textContent = erro.message
      erroConfirmacaoExclusao.classList.remove('oculto')
    } finally { botaoConfirmarExclusao.disabled = false }
  })

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
  const campoObservacao = document.getElementById('campoObservacao')

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
  const filtroStatusHistorico = document.getElementById('filtroStatusHistorico')
  const filtroDataHistorico = document.getElementById('filtroDataHistorico')
  const seletorDataHistorico = document.getElementById('seletorDataHistorico')
  const botaoDataHistorico = document.getElementById('botaoDataHistorico')
  const calendarioHistorico = document.getElementById('calendarioHistorico')
  const mesAtualHistorico = document.getElementById('mesAtualHistorico')
  const diasCalendarioHistorico = document.getElementById('diasCalendarioHistorico')
  const mesAnteriorHistorico = document.getElementById('mesAnteriorHistorico')
  const mesSeguinteHistorico = document.getElementById('mesSeguinteHistorico')
  const limparDataHistorico = document.getElementById('limparDataHistorico')
  const hojeDataHistorico = document.getElementById('hojeDataHistorico')
  const seletorStatusHistorico = document.getElementById('seletorStatusHistorico')
  const botaoStatusHistorico = document.getElementById('botaoStatusHistorico')
  const opcoesStatusHistorico = document.getElementById('opcoesStatusHistorico')
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
    const hoje = formatarDataBrasilia()
    const atendimentosHoje = historico.filter((item) => !item.dataDia || item.dataDia === hoje)
    const acionadosHoje = atendimentosHoje.filter((item) => {
      const base = String(item.baseAcionada || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
      const texto = [item.servico, item.previaServico, item.baseAcionada, item.retratacaoInicial, item.retratacaoFinal, item.resumoTentativas, item.observacao].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const retratacaoFinal = String(item.retratacaoFinal || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      if (texto.includes('cancel') || texto.includes('reembols') || texto.includes('agendad') || texto.includes('agendament') || /\bag\s*\d{1,2}\b/.test(retratacaoFinal) || texto.includes('sem base acionad') || texto.includes('nao acionad') || texto.includes('sem acionamento')) return false
      return (base && !base.includes('nao acionad') && !base.includes('nao informado') && !base.includes('sem acionamento') && !base.includes('sem base')) || (/\bacionad[oa]s?\b/.test(texto) && !/sem base acionad|nao acionad|sem acionamento/.test(texto))
    }).length
    const canceladosHoje = atendimentosHoje.filter((item) => {
      const texto = [item.servico, item.previaServico, item.baseAcionada, item.retratacaoInicial, item.retratacaoFinal, item.resumoTentativas, item.observacao].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const retratacaoFinal = String(item.retratacaoFinal || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      return texto.includes('cancel') || (texto.includes('reembols') && !/agendad|agendament|\bagenda\b|\bag\s*\d{1,2}\b/.test(retratacaoFinal))
    }).length
    const pendentesHoje = Math.max(atendimentosHoje.length - acionadosHoje - canceladosHoje, 0)
    const taxaAcionamento = atendimentosHoje.length
      ? Math.round((acionadosHoje / atendimentosHoje.length) * 100)
      : 0

    metricaTotal.textContent = String(atendimentosHoje.length)
    metricaAcionados.textContent = String(acionadosHoje)
    metricaPendentes.textContent = String(pendentesHoje)
    metricaCancelados.textContent = String(canceladosHoje)
    metricaTaxa.textContent = `${taxaAcionamento}%`
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
  function classificarHistorico(item) {
    const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const estado = normalizar([item.servico, item.previaServico, item.baseAcionada, item.retratacaoInicial, item.retratacaoFinal, item.resumoTentativas, item.observacao].filter(Boolean).join(' '))
    const retratacaoFinal = normalizar(item.retratacaoFinal)
    if (/cancel/.test(estado)) return { classe: 'status-vermelho', texto: 'Cancelado' }
    if (/agendad|agendament|\bagenda\b|\bag\s*\d{1,2}\b/.test(retratacaoFinal)) return { classe: 'status-laranja', texto: 'Agendamento' }
    if (/reembols/.test(estado)) return { classe: 'status-vermelho', texto: 'Cancelado' }
    const base = normalizar(item.baseAcionada)
    const acionamentoConfirmado = /\bacionad[oa]s?\b/.test(estado) && !/sem base acionad|nao acionad|sem acionamento/.test(estado)
    if ((base && !/nao acionad|nao informado|sem acionamento|sem base/.test(base)) || acionamentoConfirmado) return { classe: 'status-verde', texto: 'Acionado' }
    return { classe: 'status-laranja', texto: 'Agendamento' }
  }

  function renderizarListaHistorico(filtro = '', statusFiltro = filtroStatusHistorico?.value || 'todos', dataFiltro = filtroDataHistorico?.value || '') {
    const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
    totalHistorico.textContent = historico.length
    listaHistorico.replaceChildren()

    const termo = filtro.trim().toLowerCase()
    const filtrados = historico.filter((item) => {
      const status = classificarHistorico(item)
      const correspondeStatus = statusFiltro === 'todos' || status.classe === statusFiltro
      const correspondeData = !dataFiltro || item.dataDia === dataFiltro
      if (!termo) return correspondeStatus && correspondeData
      return correspondeStatus && correspondeData && (
        item.protocolo.toLowerCase().includes(termo) ||
        item.seguradora.toLowerCase().includes(termo) ||
        item.servico.toLowerCase().includes(termo) ||
        (item.baseAcionada && item.baseAcionada.toLowerCase().includes(termo)) ||
        (item.observacao && item.observacao.toLowerCase().includes(termo))
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

    const gruposPorDia = new Map()
    filtrados.forEach((item) => {
      const dia = item.dataDia || 'sem-data'
      if (!gruposPorDia.has(dia)) gruposPorDia.set(dia, [])
      gruposPorDia.get(dia).push(item)
    })
    gruposPorDia.forEach((itens, dataDia) => {
      const grupo = document.createElement('section')
      grupo.className = 'grupo-historico-dia'
      const tituloDia = document.createElement('h3')
      tituloDia.className = 'titulo-historico-dia'
      tituloDia.textContent = dataDia === 'sem-data' ? 'Envios anteriores' : new Intl.DateTimeFormat('pt-BR', { timeZone: fusoBrasilia, weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${dataDia}T12:00:00Z`))
      grupo.appendChild(tituloDia)
      itens.forEach((item) => {
      const card = document.createElement('div')
      const status = classificarHistorico(item)
      card.className = `item-historico ${status.classe}`

      const detalhes = document.createElement('div')
      detalhes.className = 'item-historico-detalhes'

      const linhaPrincipal = document.createElement('strong')
      linhaPrincipal.textContent = `${item.protocolo} - ${item.seguradora}`

      const subLinha = document.createElement('span')
      subLinha.className = 'item-historico-sub'
      subLinha.textContent = `${item.servico} | Base: ${item.baseAcionada || 'Não informada'}`

      detalhes.append(linhaPrincipal, subLinha)

      const containerDireita = document.createElement('div')
      containerDireita.className = 'item-historico-direita'

      const hora = document.createElement('span')
      hora.style.color = 'var(--cor-texto-secundario)'
      hora.style.fontSize = '0.75rem'
      hora.textContent = item.dataHora

      const etiquetaStatus = document.createElement('span')
      etiquetaStatus.className = `status-item-historico ${status.classe}`
      etiquetaStatus.textContent = status.texto

      const botaoExcluirItem = document.createElement('button')
      botaoExcluirItem.type = 'button'
      botaoExcluirItem.className = 'botao-remover-item-historico'
      botaoExcluirItem.title = 'Remover do histórico local'
      botaoExcluirItem.textContent = '✕'
      botaoExcluirItem.addEventListener('click', (e) => {
        e.stopPropagation()
        abrirModalExclusao(item)
      })

      const botaoEditarItem = document.createElement('button')
      botaoEditarItem.type = 'button'
      botaoEditarItem.className = 'botao-editar-item-historico'
      botaoEditarItem.title = 'Editar chamado'
      botaoEditarItem.textContent = 'Editar'
      botaoEditarItem.addEventListener('click', (e) => {
        e.stopPropagation()
        chamadoEmEdicao = item.linha || null
        abrirModalComDados(item, false, item.linha)
      })

      containerDireita.append(etiquetaStatus, hora, botaoEditarItem, botaoExcluirItem)
      card.append(detalhes, containerDireita)
      grupo.appendChild(card)
      })
      listaHistorico.appendChild(grupo)
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
      observacao: dados.observacao || '',
      linha: linhaCriada,
      dataHora: formatarHoraBrasilia(),
      dataDia: formatarDataBrasilia()
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
      renderizarListaHistorico(e.target.value, filtroStatusHistorico?.value || 'todos', filtroDataHistorico?.value || '')
    })
  }
  let mesCalendarioHistorico = new Date()
  const formatarDataCalendario = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
  const atualizarTextoDataHistorico = () => {
    const valor = filtroDataHistorico?.value
    botaoDataHistorico.querySelector('span').textContent = valor ? valor.split('-').reverse().join('/') : 'Selecionar data'
  }
  const renderizarCalendarioHistorico = () => {
    const ano = mesCalendarioHistorico.getFullYear()
    const mes = mesCalendarioHistorico.getMonth()
    mesAtualHistorico.textContent = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesCalendarioHistorico)
    diasCalendarioHistorico.replaceChildren()
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate()
    const quantidadeDiasAnterior = new Date(ano, mes, 0).getDate()
    for (let indice = 0; indice < 42; indice += 1) {
      const deslocamento = indice - primeiroDia + 1
      const dia = document.createElement('button')
      dia.type = 'button'
      dia.className = 'dia-calendario-historico'
      let data
      if (deslocamento < 1) {
        data = new Date(ano, mes - 1, quantidadeDiasAnterior + deslocamento)
        dia.classList.add('outro-mes')
      } else if (deslocamento > quantidadeDias) {
        data = new Date(ano, mes + 1, deslocamento - quantidadeDias)
        dia.classList.add('outro-mes')
      } else {
        data = new Date(ano, mes, deslocamento)
      }
      const valor = formatarDataCalendario(data)
      dia.textContent = String(data.getDate())
      dia.dataset.date = valor
      if (valor === formatarDataCalendario(new Date())) dia.classList.add('hoje')
      if (valor === filtroDataHistorico.value) dia.classList.add('selecionado')
      dia.addEventListener('click', () => {
        filtroDataHistorico.value = valor
        atualizarTextoDataHistorico()
        fecharCalendarioHistorico()
        renderizarListaHistorico(campoPesquisaHistorico?.value || '', filtroStatusHistorico?.value || 'todos', valor)
      })
      diasCalendarioHistorico.appendChild(dia)
    }
  }
  const fecharCalendarioHistorico = () => {
    calendarioHistorico.hidden = true
    botaoDataHistorico.setAttribute('aria-expanded', 'false')
    seletorDataHistorico.classList.remove('aberto')
  }
  if (filtroDataHistorico && botaoDataHistorico && calendarioHistorico) {
    botaoDataHistorico.addEventListener('click', () => {
      const aberto = !calendarioHistorico.hidden
      calendarioHistorico.hidden = aberto
      botaoDataHistorico.setAttribute('aria-expanded', String(!aberto))
      seletorDataHistorico.classList.toggle('aberto', !aberto)
      if (!aberto) renderizarCalendarioHistorico()
    })
    mesAnteriorHistorico.addEventListener('click', () => { mesCalendarioHistorico.setMonth(mesCalendarioHistorico.getMonth() - 1); renderizarCalendarioHistorico() })
    mesSeguinteHistorico.addEventListener('click', () => { mesCalendarioHistorico.setMonth(mesCalendarioHistorico.getMonth() + 1); renderizarCalendarioHistorico() })
    limparDataHistorico.addEventListener('click', () => {
      filtroDataHistorico.value = ''
      atualizarTextoDataHistorico()
      fecharCalendarioHistorico()
      renderizarListaHistorico(campoPesquisaHistorico?.value || '', filtroStatusHistorico?.value || 'todos', '')
    })
    hojeDataHistorico.addEventListener('click', () => {
      const hoje = new Date()
      filtroDataHistorico.value = formatarDataCalendario(hoje)
      mesCalendarioHistorico = hoje
      atualizarTextoDataHistorico()
      fecharCalendarioHistorico()
      renderizarListaHistorico(campoPesquisaHistorico?.value || '', filtroStatusHistorico?.value || 'todos', filtroDataHistorico.value)
    })
    document.addEventListener('click', (evento) => {
      if (!seletorDataHistorico.contains(evento.target)) fecharCalendarioHistorico()
    })
  }

  const fecharOpcoesStatusHistorico = () => {
    if (!opcoesStatusHistorico || !botaoStatusHistorico || !seletorStatusHistorico) return
    opcoesStatusHistorico.hidden = true
    botaoStatusHistorico.setAttribute('aria-expanded', 'false')
    seletorStatusHistorico.classList.remove('aberto')
  }
  if (botaoStatusHistorico && opcoesStatusHistorico && seletorStatusHistorico && filtroStatusHistorico) {
    botaoStatusHistorico.addEventListener('click', () => {
      const aberto = !opcoesStatusHistorico.hidden
      opcoesStatusHistorico.hidden = aberto
      botaoStatusHistorico.setAttribute('aria-expanded', String(!aberto))
      seletorStatusHistorico.classList.toggle('aberto', !aberto)
    })
    opcoesStatusHistorico.querySelectorAll('[data-value]').forEach((opcao) => {
      opcao.addEventListener('click', () => {
        filtroStatusHistorico.value = opcao.dataset.value
        botaoStatusHistorico.querySelector('span').textContent = opcao.querySelector('span').textContent
        opcoesStatusHistorico.querySelectorAll('[data-value]').forEach((item) => item.setAttribute('aria-selected', String(item === opcao)))
        fecharOpcoesStatusHistorico()
        renderizarListaHistorico(campoPesquisaHistorico?.value || '', filtroStatusHistorico.value, filtroDataHistorico?.value || '')
      })
    })
    document.addEventListener('click', (evento) => {
      if (!seletorStatusHistorico.contains(evento.target)) fecharOpcoesStatusHistorico()
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
      dispararToast('Histórico atualizado', 'As informações foram atualizadas.', 'sucesso', 2000)
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
    campoObservacao.value = String(dados.observacao || '').trim()

    if (duplicado) {
      avisoDuplicadoModal.textContent = `Atenção: O protocolo "${campoProtocolo.value}" já existe no histórico do sistema (registro ${linha})!`
      avisoDuplicadoModal.classList.remove('oculto')
      dispararToast('Protocolo já cadastrado', 'Confira os dados antes de continuar.', 'aviso', 4000)
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
    if (botaoProcessar.disabled) return
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

      chamadoEmEdicao = null
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
      resumoTentativas: campoResumoTentativas.value.trim(),
      observacao: campoObservacao.value.trim()
    }

    botaoConfirmarGravacao.disabled = true
    botaoConfirmarGravacao.textContent = 'A formatar e gravar...'

    try {
      const emEdicao = Boolean(chamadoEmEdicao)
      const res = await requisicaoAutenticada(emEdicao ? `/api/chamados/${encodeURIComponent(chamadoEmEdicao)}` : '/api/gravar', {
        method: emEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emEdicao ? { dados: dadosParaGravar } : { dados: dadosParaGravar, username: abaAtual() })
      })

      const resposta = await res.json()
      if (!res.ok) throw new Error(resposta.erro || 'Falha ao gravar o chamado.')

      fecharModalEdicao()
      
      const idChamado = resposta.id
      if (emEdicao) {
        const historico = JSON.parse(localStorage.getItem('historico_chamados') || '[]')
        localStorage.setItem('historico_chamados', JSON.stringify(historico.map((item) => item.linha === chamadoEmEdicao ? { ...item, ...dadosParaGravar } : item)))
        chamadoEmEdicao = null
        carregarHistorico()
        dispararToast('Chamado atualizado', `Protocolo ${dadosParaGravar.protocolo} atualizado no sistema.`, 'sucesso')
      } else {

      dispararToast(
        'Gravação Concluída',
        `Protocolo ${dadosParaGravar.protocolo} salvo no sistema em ${resposta.dataAtendimento}.`,
        'sucesso',
        30000,
        {}
      )

      adicionarAoHistorico(dadosParaGravar, idChamado)
      }
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
