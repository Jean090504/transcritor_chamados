import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { configuracaoAmbiente } from '../config/env.js'

const clienteInteligenciaArtificial = new GoogleGenerativeAI(configuracaoAmbiente.CHAVE_API_GEMINI)

export async function extrairDadosChamado(textoBruto) {
  const instrucaoExtracao = `
    Analise o texto do chamado operacional e extraia todas as informacoes em formato JSON valido.
    
    Regras estritas de preenchimento:
- protocolo: codigo ou numero identificador completo
- seguradora: nome da empresa por extenso
- servico: tipo de servico por extenso
- localidade: nome da cidade e nome do estado por extenso (exemplo: Fernandopolis - SP)
- dataHoraEnvioRede: data e horario de envio na rede, ou "Nao informado" se ausente
- dataHoraRetorno: data e horario do retorno ou conclusao, ou "Nao informado" se ausente
- baseIndicada: nome da base e distancia por extenso (exemplo: LGI Refrigeracao - 214 KM) - nunca utilize quilometragem ou quilometros, sempre escreva por extenso (exemplo: 214 KM)
- acionadaComIndicacao: "Sim", "Nao" ou "Em andamento"
- resumoTentativas: descreva as tentativas separadas por base.
  REGRA OBRIGATORIA DE FORMATACAO:
  1. Cada base DEVE ficar obrigatoriamente em uma nova linha usando quebra de linha real (\\n).
  2. Nao junte bases diferentes na mesma linha.
  3. Formato exato por linha:
     NOME DA BASE: T1 STATUS, T2 STATUS
  4. Exemplos de padronizacao:
     CLIMA MS: T1 SEM CTT, T2 CX POSTAL, T3 OCUPADO
     MS REFRIGERACAO: T1 SEM AGENDA
     PANTANAL CLIMATIZACAO: T1 FORA DO RAIO
     SOS AR CONDICIONADO: T1 AGENDAMENTO CONFIRMADO

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