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

  botaoLimpar.addEventListener('click', () => {
    campoTexto.value = ''
    atualizarContador()
    painelAlerta.className = 'painel-alerta oculto'
    painelAlerta.innerHTML = ''
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

  function exibirSucesso(mensagem, dados) {
    painelAlerta.className = 'painel-alerta alerta-sucesso'

    let detalhesHtml = ''
    if (dados) {
      detalhesHtml = `
        <div class="detalhes-extracao">
          <span class="chip-info">Protocolo: ${dados.protocolo || 'N/D'}</span>
          <span class="chip-info">Seguradora: ${dados.seguradora || 'N/D'}</span>
          <span class="chip-info">Serviço: ${dados.servico || 'N/D'}</span>
          <span class="chip-info">Acionada: ${dados.acionadaComIndicacao || 'N/D'}</span>
        </div>
      `
    }

    painelAlerta.innerHTML = `
      <strong>✔ Sucesso!</strong> ${mensagem}
      ${detalhesHtml}
    `
  }

  function exibirErro(mensagem) {
    painelAlerta.className = 'painel-alerta alerta-erro'
    painelAlerta.innerHTML = `<strong>✖ Atenção:</strong> ${mensagem}`
  }

  botaoProcessar.addEventListener('click', async () => {
    const conteudoTexto = campoTexto.value.trim()

    if (!conteudoTexto || conteudoTexto.length < 20) {
      exibirErro('Insira o texto completo do chamado antes de processar (mínimo de 20 caracteres).')
      return
    }

    alternarCarregamento(true)
    painelAlerta.className = 'painel-alerta oculto'

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
        dadosResposta.mensagem || 'Chamado gravado com sucesso no Google Sheets.',
        dadosResposta.dadosProcessados
      )
      campoTexto.value = ''
      atualizarContador()
    } catch (erro) {
      exibirErro(erro.message || 'Erro ao conectar ao servidor. Tente novamente.')
    } finally {
      alternarCarregamento(false)
    }
  })
})