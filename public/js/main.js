document.addEventListener('DOMContentLoaded', () => {
  const campoTexto = document.getElementById('textoChamado')
  const botaoProcessar = document.getElementById('botaoProcessar')
  const botaoColar = document.getElementById('botaoColar')
  const botaoLimpar = document.getElementById('botaoLimpar')
  const contadorCaracteres = document.getElementById('contadorCaracteres')
  const painelAlerta = document.getElementById('alertaFeedback')
  const conteudoBotao = botaoProcessar.querySelector('.conteudo-botao')
  const indicadorCarregamento = document.getElementById('indicadorCarregamento')

  function atualizarContador() {
    const qtd = campoTexto.value.length
    contadorCaracteres.textContent = `${qtd} caracteres`
  }

  campoTexto.addEventListener('input', atualizarContador)

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
      const textoCopiado = await navigator.clipboard.readText()
      if (textoCopiado) {
        campoTexto.value = textoCopiado
        atualizarContador()
      }
    } catch {
      campoTexto.focus()
    }
  })

  function alternarCarregamento(estaCarregando) {
    botaoProcessar.disabled = estaCarregando
    campoTexto.disabled = estaCarregando
    if (estaCarregando) {
      conteudoBotao.classList.add('oculto')
      indicadorCarregamento.classList.remove('oculto')
    } else {
      conteudoBotao.classList.remove('oculto')
      indicadorCarregamento.classList.add('oculto')
    }
  }

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

  function exibirSucesso(mensagem, dados) {
    limparAlerta()
    painelAlerta.className = 'painel-alerta alerta-sucesso'

    const cabecalhoMensagem = document.createElement('div')
    cabecalhoMensagem.className = 'alerta-titulo'

    const rotuloDestaque = document.createElement('strong')
    rotuloDestaque.textContent = 'Sucesso: '

    const textoMensagem = document.createTextNode(mensagem)
    cabecalhoMensagem.append(rotuloDestaque, textoMensagem)

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
        { 
          chave: 'AGENDAMENTO', 
          valor: `${dados.dataMarcada || 'Imediato'}${dados.horarioMarcado ? ` (${dados.horarioMarcado})` : ''}` 
        }
      ]

      itens.forEach((item) => {
        containerDetalhes.appendChild(criarChip(item.chave, item.valor))
      })

      painelAlerta.appendChild(containerDetalhes)
    }
  }

  function exibirErro(mensagem) {
    limparAlerta()
    painelAlerta.className = 'painel-alerta alerta-erro'

    const rotuloErro = document.createElement('strong')
    rotuloErro.textContent = 'Erro de Processamento: '

    const textoMensagem = document.createTextNode(mensagem)

    painelAlerta.append(rotuloErro, textoMensagem)
  }

  botaoProcessar.addEventListener('click', async () => {
    const conteudoTexto = campoTexto.value.trim()

    if (!conteudoTexto || conteudoTexto.length < 20) {
      exibirErro('Insira o texto completo do chamado antes de processar (mínimo de 20 caracteres).')
      return
    }

    alternarCarregamento(true)
    limparAlerta()

    try {
      const respostaServidor = await fetch('/api/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ textoManual: conteudoTexto })
      })

      const contentType = respostaServidor.headers.get('content-type')
      let dadosResposta

      if (contentType && contentType.includes('application/json')) {
        dadosResposta = await respostaServidor.json()
      } else {
        throw new Error(`O servidor respondeu com status ${respostaServidor.status}.`)
      }

      if (!respostaServidor.ok) {
        const mensagemErro = dadosResposta.listaErros
          ? dadosResposta.listaErros.join(', ')
          : (dadosResposta.erro || dadosResposta.mensagem || 'Falha ao processar chamado.')

        throw new Error(mensagemErro)
      }

      exibirSucesso(
        dadosResposta.mensagem || 'Registro inserido na planilha com sucesso.',
        dadosResposta.dados || dadosResposta.dadosProcessados
      )
      campoTexto.value = ''
      atualizarContador()
    } catch (erro) {
      exibirErro(erro.message || 'Erro de comunicação com a API. Tente novamente.')
    } finally {
      alternarCarregamento(false)
    }
  })
})
