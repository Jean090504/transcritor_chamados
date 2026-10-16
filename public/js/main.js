const campoTextoManual = document.getElementById('campoTextoManual')
const botaoEnviar = document.getElementById('botaoEnviar')
const elementoStatus = document.getElementById('elementoStatus')

async function enviarFormulario() {
  const conteudoTexto = campoTextoManual.value.trim()

  if (!conteudoTexto) {
    elementoStatus.className = 'status erro'
    elementoStatus.innerText = 'Cole um texto de chamado antes de processar.'
    elementoStatus.style.display = 'block'
    return
  }

  botaoEnviar.disabled = true
  botaoEnviar.innerText = 'Processando...'
  elementoStatus.style.display = 'none'

  try {
    const respostaServidor = await fetch('/api/processar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ textoManual: conteudoTexto })
    })

    const dadosResposta = await respostaServidor.json()

    if (!respostaServidor.ok) {
      const mensagemErroRetornada = dadosResposta.listaErros
        ? dadosResposta.listaErros.join(', ')
        : dadosResposta.erro

      throw new Error(mensagemErroRetornada)
    }

    elementoStatus.className = 'status sucesso'
    elementoStatus.innerText = `${dadosResposta.mensagem} | Protocolo: ${dadosResposta.dados.protocolo}`
    elementoStatus.style.display = 'block'
    campoTextoManual.value = ''
  } catch (erroCapturado) {
    elementoStatus.className = 'status erro'
    elementoStatus.innerText = erroCapturado.message || 'Erro inesperado ao conectar ao servidor.'
    elementoStatus.style.display = 'block'
  } finally {
    botaoEnviar.disabled = false
    botaoEnviar.innerText = 'Processar e Gravar'
  }
}

botaoEnviar.addEventListener('click', enviarFormulario)