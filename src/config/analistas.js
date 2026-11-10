export const ANALISTAS = [
  { username: 'sarah.silva', nome: 'Sarah Silva Da Costa Fernandes', aba: 'Sarah Silva' },
  { username: 'pedro.correa', nome: 'Pedro dos Reis Correa', aba: 'Pedro Correa' },
  { username: 'rayanne.silva', nome: 'Rayanne Vicente Da Silva', aba: 'Rayanne Silva' },
  { username: 'tatiana.barbosa', nome: 'Tatiana Ferreira Barbosa Da Silva', aba: 'Tatiana Barbosa' },
  { username: 'taynara.cunha', nome: 'Taynara Roberta Rocha Da Cunha', aba: 'Taynara Cunha' },
  { username: 'teresinha.lombardi', nome: 'Teresinha Lombardi', aba: 'Teresinha Lombardi' },
  { username: 'vitor.manoel', nome: 'Vitor Ferreira Manoel', aba: 'Vitor Manoel' },
  { username: 'adriana.maria', nome: 'Adriana - maria.souza', aba: 'Adriana Maria' },
  { username: 'barbara.lima', nome: 'BARBARA LIMA', aba: 'Barbara Lima' },
  { username: 'beatriz.silva', nome: 'Beatriz Cavalcante Da Silva', aba: 'Beatriz Silva' },
  { username: 'heidy.miranda', nome: 'HEIDY PROCOPIO MIRANDA', aba: 'Heidy Miranda' },
  { username: 'leidiane.silva', nome: 'Leidiane Maria Da Silva', aba: 'Leidiane Silva' },
  { username: 'paula.rodrigues', nome: 'Paula Amanda Rodrigues', aba: 'Paula Rodrigues' },
  { username: 'wesley.sena', nome: 'WESLEY ANDRADE SENA', aba: 'Wesley Sena' },
  { username: 'jean.asilva', nome: 'JEAN COSTA ALVES DA SILVA', aba: 'Jean Costa' }
]

export const USUARIOS_GLOBAIS = [
  { username: 'root', nome: 'Administrador', papel: 'root', aba: null },
  { username: 'sarah.silva', nome: 'Sarah Silva Da Costa Fernandes', papel: 'sarah', aba: 'Sarah Silva' }
]

export function obterAnalista(username) {
  return ANALISTAS.find((analista) => analista.username === username)
}
