import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { configuracaoAmbiente } from '../config/env.js'

const clienteInteligenciaArtificial = new GoogleGenerativeAI(configuracaoAmbiente.CHAVE_API_GEMINI)

export async function extrairDadosChamado(textoBruto) {
  const instrucaoExtracao = `
    Analise o texto do chamado operacional e extraia todas as informacoes estritamente em formato JSON valido.
    
    Regras estritas de preenchimento dos campos:
- protocolo: codigo ou numero identificador completo do chamado
- seguradora: nome da empresa por extenso
- servico: tipo de servico por extenso
- previaServico: previa original do servico informada nos dados do chamado (exemplo: "90 MIN", "21/10 - 08H AS 12H", etc.)
- localidade: nome da cidade e sigla do estado por extenso (exemplo: Presidente Epitacio - SP)
- baseAcionada: nome da base/prestador que foi efetivamente acionado (se nao houver, "Nao acionada")
- dataMarcada: data confirmada de atendimento da base acionada (exemplo: "26/10", "21/10/2026"). Se nao houver data especifica ou for imediato, informe "Imediato" ou "Nao informado".
- horarioMarcado: horario confirmado de atendimento da base acionada (exemplo: "QQ HORARIO", "14H", "13H AS 17H"). Se nao houver, "Nao informado".
- baseIndicada: nome da base indicada pelo sistema e distancia por extenso (se nao houver distancia, apenas o nome da base ou "Nao informado")
- acionadaComIndicacao: "Sim", "Nao" ou "Em andamento"
- retratacaoInicial: texto exato da retratacao inicial. Se estiver em branco, ausente ou se for apenas agendamento sem retratacao, preencha estritamente como "AGENDAMENTO".
- retratacaoFinal: texto exato da retratacao final. Se estiver em branco, ausente ou se for apenas agendamento sem retratacao, preencha estritamente como "AGENDAMENTO".
- resumoTentativas: descreva as tentativas separadas por base.
  REGRA OBRIGATORIA DE FORMATACAO:
  1. Cada base DEVE ficar obrigatoriamente em uma nova linha usando quebra de linha real (\\n).
  2. Nao junte bases diferentes na mesma linha.
  3. Formato exato por linha:
     NOME DA BASE: T1 STATUS, T2 STATUS

    Texto bruto:
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
        localidade: { type: SchemaType.STRING },
        dataHoraEnvioRede: { type: SchemaType.STRING },
        dataHoraRetorno: { type: SchemaType.STRING },
        baseIndicada: { type: SchemaType.STRING },
        acionadaComIndicacao: { 
          type: SchemaType.STRING,
          enum: ['Sim', 'Nao', 'Em andamento']
        },
        resumoTentativas: { type: SchemaType.STRING }
      },
      required: [
        'protocolo',
        'seguradora',
        'servico',
        'localidade',
        'baseIndicada',
        'acionadaComIndicacao',
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
