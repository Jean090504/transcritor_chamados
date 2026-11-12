// Usuários operacionais iniciais. O seed só usa estes dados quando o usuário
// ainda não existe; nunca atualiza a senha de uma conta já cadastrada.
export const USUARIOS_OPERACIONAIS_INICIAIS = [
  {
    username: 'elaine.marreiros',
    nome: 'ELAINE MARREIROS',
    papel: 'operacional',
    aba: null,
    senhaHash: 'a78193e9ecd165a9419a9ae777ade731:7c9b3863d437c85abb0f719282115903a1c06fdf63fdb4f283c417405e25deeeeffd4c6838c1f0c122204dc17cc5a6c224de33427cbc3c3e1fadae0f3bd9fabb',
    trocarSenha: true
  },
  {
    username: 'flavio.marcolino',
    nome: 'FLAVIO MARCOLINO',
    papel: 'operacional',
    aba: null,
    senhaHash: '3fddad2f0215f8e2a086d8253ddd0a66:7d6b51c7d8fcc2617c6bf51121af0ef0d3aff11df112c4f7cad50fd43fe47a72be5a3636b5533c25a0dbcd9aee702a5492b32705d8c8408cb45ec18fe85a6bae',
    trocarSenha: true
  }
]
