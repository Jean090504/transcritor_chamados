import { z as zodValidacao } from 'zod'

export const esquemaTextoEntrada = zodValidacao.object({
  textoManual: zodValidacao
    .string()
    .trim()
    .min(20, 'O texto deve conter no minimo vinte caracteres')
    .max(8000, 'Texto muito longo para processamento')
})

const textoCampo = zodValidacao.string().trim().max(500, 'Campo muito longo')
export const esquemaUsername = zodValidacao.string().trim().toLowerCase().max(64).regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, 'Usuário inválido')

export const esquemaLogin = zodValidacao.object({
  username: esquemaUsername,
  senha: zodValidacao.string().min(1).max(128)
})

export const esquemaNovaSenha = zodValidacao.object({
  novaSenha: zodValidacao.string().min(8).max(128)
})

export const esquemaChamadoEstruturado = zodValidacao.object({
  protocolo: textoCampo.max(100),
  seguradora: textoCampo,
  servico: textoCampo,
  previaServico: textoCampo.default('Nao informado'),
  localidade: textoCampo,
  baseAcionada: textoCampo.default('Nao acionada'),
  dataMarcada: textoCampo.default('Nao informado'),
  horarioMarcado: textoCampo.default('Nao informado'),
  retratacaoInicial: textoCampo.default('AGENDAMENTO'),
  retratacaoFinal: textoCampo.default('AGENDAMENTO'),
  resumoTentativas: zodValidacao.string().trim().max(2000).default('Nao informado')
})
