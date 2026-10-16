import { z as zodValidacao } from 'zod'

export const esquemaTextoEntrada = zodValidacao.object({
  textoManual: zodValidacao
    .string()
    .trim()
    .min(20, 'O texto deve conter no minimo vinte caracteres')
    .max(8000, 'Texto muito longo para processamento')
})

export const esquemaChamadoEstruturado = zodValidacao.object({
  protocolo: zodValidacao.string(),
  seguradora: zodValidacao.string(),
  servico: zodValidacao.string(),
  localidade: zodValidacao.string(),
  dataHoraEnvioRede: zodValidacao.string().default('Nao informado'),
  dataHoraRetorno: zodValidacao.string().default('Nao informado'),
  baseIndicada: zodValidacao.string().default('Nao informado'),
  acionadaComIndicacao: zodValidacao.enum(['Sim', 'Nao', 'Em andamento']).default('Nao'),
  resumoTentativas: zodValidacao.string().default('Nao informado')
})