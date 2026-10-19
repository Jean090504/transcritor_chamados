import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { configuracaoAmbiente } from '../config/env.js'

const clienteInteligenciaArtificial = new GoogleGenerativeAI(configuracaoAmbiente.CHAVE_API_GEMINI)

export async function extrairDadosChamado(textoBruto) {
  const instrucaoExtracao = `
    Analise o texto do chamado operacional e extraia todas as informacoes sem utilizar nenhuma abreviacao.
    
    Regras estritas de preenchimento (nao abrevie):
- protocolo: codigo ou numero identificador completo
- seguradora: nome da empresa por extenso
- servico: tipo de servico por extenso (se houver mencao a "C", decodifique para "Cobertura")
- localidade: nome da cidade e nome do estado por extenso (exemplo: Fernandopolis - Sao Paulo, nao use siglas como SP)
- dataHoraEnvioRede: data e horario de envio na rede, ou "Nao informado" se ausente
- dataHoraRetorno: data e horario do retorno ou conclusao, ou "Nao informado" se ausente
- baseIndicada: nome da base e distancia por extenso (exemplo: LGI Refrigeracao - 214 KM)
- acionadaComIndicacao: "Sim", "Nao" ou "Em andamento"
- resumoTentativas: descreva as tentativas por extenso. Substitua termos como "SEM CTT" por "Sem Contato", "CX POSTAL" por "Caixa Postal", "T1" por "Tentativa 1", "T2" por "Tentativa 2".

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