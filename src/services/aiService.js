import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { configuracaoAmbiente } from '../config/env.js'

const clienteInteligenciaArtificial = new GoogleGenerativeAI(configuracaoAmbiente.CHAVE_API_GEMINI)

export async function extrairDadosChamado(textoBruto) {
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
    - resumoTentativas: Resumo de todas as bases contactadas. Cada base DEVE começar obrigatoriamente numa nova linha usando quebra de linha real (\\n). Formato por linha:
      NOME DA BASE: T1 STATUS, T2 STATUS

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
        'resumoTentativas'
      ]
    }
  }

  const modelosDisponiveis = ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-latest']

  for (const nomeModelo of modelosDisponiveis) {
    try {
      const modeloGemini = clienteInteligenciaArtificial.getGenerativeModel({
        model: nomeModelo,
        generationConfig: configuracaoSchema
      })

      const resultadoGeracao = await modeloGemini.generateContent(instrucaoExtracao)
      const respostaTexto = resultadoGeracao.response.text()
      return JSON.parse(respostaTexto)
    } catch (erro) {
      console.warn(`Tentativa com ${nomeModelo} falhou: ${erro.message || erro}. Tentando próximo...`)
      if (erro.status === 429 || erro.status === 503 || erro.status === 404) {
        continue
      }
      throw erro
    }
  }

  throw new Error('Todos os modelos da linha Flash falharam. Verifique a cota ou chave de API.')
}
