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
  previaServico: zodValidacao.string().default('Nao informado'),
  localidade: zodValidacao.string(),
  baseAcionada: zodValidacao.string().default('Nao acionada'),
  dataMarcada: zodValidacao.string().default('Nao informado'),
  horarioMarcado: zodValidacao.string().default('Nao informado'),
  retratacaoInicial: zodValidacao.string().default('AGENDAMENTO'),
  retratacaoFinal: zodValidacao.string().default('AGENDAMENTO'),
  resumoTentativas: zodValidacao.string().default('Nao informado')
})
