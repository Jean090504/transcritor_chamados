import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { createHash } from 'node:crypto'
import { configuracaoAmbiente } from '../config/env.js'

const clienteInteligenciaArtificial = new GoogleGenerativeAI(configuracaoAmbiente.CHAVE_API_GEMINI)
const cacheAnalises = new Map()
const CACHE_ANALISE_TTL_MS = 5 * 60 * 1000
const LIMITE_CACHE_ANALISES = 50
const MODELOS_FLASH_FALLBACK = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']

function obterModelosDisponiveis() {
  return [configuracaoAmbiente.MODELO_GEMINI, ...MODELOS_FLASH_FALLBACK].filter((nomeModelo, indice, modelos) => nomeModelo && modelos.indexOf(nomeModelo) === indice)
}

function erroIAIndisponivel(falhas) {
  const status = [...new Set(falhas.map((falha) => falha.status).filter(Boolean))]
  const erro = new Error('NÃ£o foi possÃ­vel analisar agora. Tente novamente em instantes.')
  erro.codigo = 'IA_INDISPONIVEL'
  erro.status = status.includes(429) ? 429 : status.includes(401) || status.includes(403) ? 403 : 503
  erro.falhas = falhas
  if (erro.status === 429) erro.mensagemPublica = 'A cota da IA foi atingida. Aguarde alguns instantes e tente novamente.'
  else if (erro.status === 403) erro.mensagemPublica = 'A chave da IA nÃ£o tem permissÃ£o ou estÃ¡ invÃ¡lida. Verifique GEMINI_API_KEY na implantaÃ§Ã£o.'
  else erro.mensagemPublica = 'A IA estÃ¡ temporariamente indisponÃ­vel. Tente novamente em instantes.'
  return erro
}

function registrarFalhaModelo(falhas, nomeModelo, erro) {
  const status = Number(erro?.status) || null
  falhas.push({ modelo: nomeModelo, status, mensagem: String(erro?.message || erro).slice(0, 300) })
  console.warn(`Tentativa com ${nomeModelo} falhou [${status || 'sem status'}]: ${erro?.message || erro}`)
}

function chaveAnalise(texto) {
  return createHash('sha256').update(texto).digest('hex')
}

function registrarAnaliseCache(chave, dados) {
  cacheAnalises.set(chave, { dados, expiraEm: Date.now() + CACHE_ANALISE_TTL_MS })
  if (cacheAnalises.size > LIMITE_CACHE_ANALISES) {
    const primeiraChave = cacheAnalises.keys().next().value
    cacheAnalises.delete(primeiraChave)
  }
}

export async function extrairDadosChamado(textoBruto) {
  const chave = chaveAnalise(textoBruto)
  const resultadoEmCache = cacheAnalises.get(chave)
  if (resultadoEmCache && resultadoEmCache.expiraEm > Date.now()) return resultadoEmCache.dados
  if (resultadoEmCache) cacheAnalises.delete(chave)

  const inicioAnalise = performance.now()
  const horarioBrasilia = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date())

  const instrucaoExtracao = `
    És um assistente operacional. Analisa o texto do chamado fornecido e extrai as informações solicitadas estritamente em formato JSON válido.

    CAMPOS OBRIGATÓRIOS DO JSON:
    - protocolo: Código ou número identificador completo do protocolo (ex: "88301924/ 2").
    - seguradora: Nome da seguradora/produto (ex: "PORTO SEGURO", "BB SEGUROS").
    - servico: Tipo de serviço solicitado (ex: "DESENTUPIMENTO DE ESGOTO").
    - previaServico: Valor informado no campo PREVIA dentro dos dados do chamado (ex: "120 MIN", "90 MIN", "21/10 - 08H AS 12H"). Não confundir com a prévia da base acionada.
    - localidade: Cidade e sigla do estado (ex: "Salto - SP").
    - baseAcionada: Nome da base que aceitou ou confirmou o agendamento (indicada na seção "BASE ACIONADA"). Se não houver base confirmada, coloca "Nao acionada".
    - dataMarcada: Data agendada com a base acionada (ex: se na prévia da base acionada constar "24/10 - 18H00", a data é "24/10"). Se for imediato ou sem data futura, coloca "Imediato". Se não houver, "Nao informado".
    - horarioMarcado: Horário agendado com a base acionada (ex: se constar "24/10 - 18H00", o horário é "18H00"; se constar "QQ HORARIO", coloca "QQ HORARIO"). Se não houver, "Nao informado".
    - retratacaoInicial: Texto exato presente em "RETRATACAO -> INICIAL". Se estiver vazio, sem preenchimento ou ausente, preenche obrigatoriamente como "AGENDAMENTO".
    - retratacaoFinal: Texto presente em "[ RETRATACAO ] -> FINAL :". Se vazio ou ausente, retorne "AGENDAMENTO".
    - resumoTentativas: Resumo de todas as bases contactadas. Cada base DEVE começar obrigatoriamente numa nova linha usando quebra de linha real (\\n). Formato por linha:
      NOME DA BASE: T1 STATUS, T2 STATUS

    Datas devem permanecer no padrão brasileiro DD/MM e horários no padrão 24 horas HH:mm.
    Considere como referência a data e hora de Brasília: ${horarioBrasilia}.
    Nunca converta datas para o padrão americano MM/DD.

    Texto do chamado:
    ${textoBruto}
  `

  const configuracaoSchema = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        protocolo: { type: SchemaType.STRING },
        seguradora: { type: SchemaType.STRING },
        servico: { type: SchemaType.STRING },
        previaServico: { type: SchemaType.STRING },
        localidade: { type: SchemaType.STRING },
        baseAcionada: { type: SchemaType.STRING },
        dataMarcada: { type: SchemaType.STRING },
        horarioMarcado: { type: SchemaType.STRING },
        retratacaoInicial: { type: SchemaType.STRING },
        retratacaoFinal: { type: SchemaType.STRING },
        resumoTentativas: { type: SchemaType.STRING }
      },
      required: [
        'protocolo',
        'seguradora',
        'servico',
        'previaServico',
        'localidade',
        'baseAcionada',
        'dataMarcada',
        'horarioMarcado',
        'retratacaoInicial',
        'retratacaoFinal',
        'resumoTentativas'
      ]
    }
  }

  const modelosDisponiveis = obterModelosDisponiveis()
  const falhas = []

  for (const nomeModelo of modelosDisponiveis) {
    try {
      const modeloGemini = clienteInteligenciaArtificial.getGenerativeModel({
        model: nomeModelo,
        generationConfig: configuracaoSchema
      })

      const resultadoGeracao = await modeloGemini.generateContent(instrucaoExtracao, { timeout: 20000 })
      const respostaTexto = resultadoGeracao.response.text()
      const dadosExtraidos = JSON.parse(respostaTexto)
      registrarAnaliseCache(chave, dadosExtraidos)
      console.info(JSON.stringify({ evento: 'analise_chamado', modelo: nomeModelo, duracaoMs: Math.round(performance.now() - inicioAnalise), caracteres: textoBruto.length }))
      return dadosExtraidos
    } catch (erro) {
      console.warn(`Tentativa com ${nomeModelo} falhou: ${erro.message || erro}. Tentando próximo...`)
      registrarFalhaModelo(falhas, nomeModelo, erro)
      if ([400, 401, 403, 404, 408, 429, 500, 502, 503, 504].includes(Number(erro.status))) {
        continue
      }
      throw erro
    }
  }

  throw erroIAIndisponivel(falhas)
}

export async function extrairDadosOperacionais(textoBruto) {
  const chave = chaveAnalise(`operacional:${textoBruto}`)
  const resultadoEmCache = cacheAnalises.get(chave)
  if (resultadoEmCache && resultadoEmCache.expiraEm > Date.now()) return resultadoEmCache.dados
  if (resultadoEmCache) cacheAnalises.delete(chave)

  const instrucaoExtracao = `
    Analise o chamado abaixo e retorne somente JSON válido, sem markdown. Este registro será enviado para uma planilha operacional.
    Extraia os campos abaixo. Se algo não estiver no texto, use uma string vazia. Não invente dados.
    - protocolo: protocolo completo, preservando o sufixo /barra quando existir, por exemplo 72224206/1.
    - assistencia: seguradora, assistência ou produto.
    - outraAssist: outra assistência citada, ou vazio.
    - servico: serviço solicitado.
    - cidade: somente a cidade.
    - uf: somente a sigla do estado.
    - cliente: nome do cliente.
    - dataHoraSolicitacao: data e hora da solicitação em YYYY-MM-DDTHH:mm.
    - dataHoraRetorno: data e hora do retorno em YYYY-MM-DDTHH:mm.
    - porQuePedimosAuxilio: motivo do pedido de auxílio.
    - houveAtuacaoRede: SIM, NÃO ou descrição objetiva.
    - retornoAuxilio: retorno recebido do auxílio.
    - servicoBaseIndicada: serviço acionado com a base indicada.
    - resolucaoAcionamento: como o acionamento foi resolvido.
    - baseAcionada: base acionada.
    Use o fuso de Brasília (America/Sao_Paulo), datas brasileiras e horário de 24 horas. O número depois da barra do protocolo é a barra do atendimento e nunca é duração.

    Texto do chamado:
    ${textoBruto}
  `
  const configuracaoSchema = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        protocolo: { type: SchemaType.STRING }, assistencia: { type: SchemaType.STRING }, outraAssist: { type: SchemaType.STRING },
        servico: { type: SchemaType.STRING }, cidade: { type: SchemaType.STRING }, uf: { type: SchemaType.STRING },
        cliente: { type: SchemaType.STRING }, dataHoraSolicitacao: { type: SchemaType.STRING }, dataHoraRetorno: { type: SchemaType.STRING },
        porQuePedimosAuxilio: { type: SchemaType.STRING }, houveAtuacaoRede: { type: SchemaType.STRING }, retornoAuxilio: { type: SchemaType.STRING },
        servicoBaseIndicada: { type: SchemaType.STRING }, resolucaoAcionamento: { type: SchemaType.STRING }, baseAcionada: { type: SchemaType.STRING }
      },
      required: ['protocolo', 'assistencia', 'outraAssist', 'servico', 'cidade', 'uf', 'cliente', 'dataHoraSolicitacao', 'dataHoraRetorno', 'porQuePedimosAuxilio', 'houveAtuacaoRede', 'retornoAuxilio', 'servicoBaseIndicada', 'resolucaoAcionamento', 'baseAcionada']
    }
  }
  const modelosDisponiveis = obterModelosDisponiveis()
  const falhas = []
  for (const nomeModelo of modelosDisponiveis) {
    try {
      const modeloGemini = clienteInteligenciaArtificial.getGenerativeModel({ model: nomeModelo, generationConfig: configuracaoSchema })
      const resultadoGeracao = await modeloGemini.generateContent(instrucaoExtracao, { timeout: 20000 })
      const dados = JSON.parse(resultadoGeracao.response.text())
      registrarAnaliseCache(chave, dados)
      return dados
    } catch (erro) {
      registrarFalhaModelo(falhas, nomeModelo, erro)
      if ([400, 401, 403, 404, 408, 429, 500, 502, 503, 504].includes(Number(erro.status))) continue
      throw erro
    }
  }
  throw erroIAIndisponivel(falhas)
}
