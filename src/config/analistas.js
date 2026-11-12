const equipeSarah = [
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

const equipeJunaide = [
  { username: 'yasmin.silva', nome: 'YASMIN RAFAELA SANTOS SILVA', aba: 'Yasmin Silva' }, { username: 'renata.almeida', nome: 'RENATA BEZERRA DE ALMEIDA', aba: 'Renata Almeida' }, { username: 'taina.costa', nome: 'TAINA ROZEBERTA DE LIMA COSTA', aba: 'Taina Costa' }, { username: 'julia.brito', nome: 'JULIA REGINA DE BRITO', aba: 'Julia Brito' }, { username: 'meirly.souza', nome: 'MEIRLY CLECIA DE ASSIS SOUZA', aba: 'Meirly Souza' }, { username: 'rafael.bernardo', nome: 'RAFAEL DOS SANTOS BERNARDO', aba: 'Rafael Bernardo' }, { username: 'gisele.carvalho', nome: 'GISELE MARIA DE CARVALHO', aba: 'Gisele Carvalho' }, { username: 'elena.firmino', nome: 'ELENA VITORIA DA SILVA FIRMINO', aba: 'Elena Firmino' }, { username: 'thaylla.santos', nome: 'THAYLLA OLIVEIRA DA SILVA SANTOS', aba: 'Thaylla Santos' }, { username: 'andreia.cabral', nome: 'ANDREIA CAMPANELLA CABRAL', aba: 'Andreia Cabral' }, { username: 'carlos.filho', nome: 'CARLOS ALBERTO GOMES DA SILVA FILHO', aba: 'Carlos Filho' }, { username: 'cleusa.durval', nome: 'CLEUSA MARIA DOS REIS DURVAL', aba: 'Cleusa Durval' }, { username: 'daylla.santos', nome: 'DAYLLA GOMES DOS SANTOS', aba: 'Daylla Santos' }, { username: 'evan.lima', nome: 'EVAN ALEXANDER ALVES DE LIMA', aba: 'Evan Lima' }, { username: 'isabel.pereira', nome: 'ISABEL DE ARAUJO PEREIRA', aba: 'Isabel Pereira' }, { username: 'jessica.santana', nome: 'JESSICA DA CUNHA PAIVA SANTANA', aba: 'Jessica Santana' }, { username: 'joana.gomes', nome: 'JOANA D ARC SILVEIRA GOMES', aba: 'Joana Gomes' }, { username: 'jose.silva', nome: 'JOSE CARLOS MENESES GOMES DA SILVA', aba: 'Jose Silva' }, { username: 'larissa.camelo', nome: 'LARISSA REGINA NASCIMENTO CAMELO', aba: 'Larissa Camelo' }, { username: 'lyldison.araujo', nome: 'LYLDISON SANTOS DE ARAUJO', aba: 'Lyldison Araujo' }, { username: 'maria.bezerra', nome: 'MARIA DO SOCORRO BEZERRA', aba: 'Maria Bezerra' }, { username: 'marlene.silva', nome: 'MARLENE ELIZABETH MENDES DA SILVA', aba: 'Marlene Silva' }, { username: 'michelle.viana', nome: 'MICHELLE SIMAO DE LIMA VIANA', aba: 'Michelle Viana' }, { username: 'nely.silva', nome: 'NELY BARBOSA DA SILVA', aba: 'Nely Silva' }, { username: 'nycolas.maximo', nome: 'NYCOLAS FERREIRA MAXIMO', aba: 'Nycolas Maximo' }, { username: 'talita.garcia', nome: 'TALITA SOARES DAMIAO GARCIA', aba: 'Talita Garcia' }, { username: 'tatiane.oliveira', nome: 'TATIANE COELHO SILVA DE OLIVEIRA', aba: 'Tatiane Oliveira' }
]

const criarAnalistas = (supervisor, equipe) => equipe.map((analista) => ({ ...analista, nome: analista.nome.toUpperCase(), supervisor }))
export const ANALISTAS = [...criarAnalistas('sarah.fernandes', equipeSarah), ...criarAnalistas('junaide.auzeni', equipeJunaide)]

export const USUARIOS_GLOBAIS = [
  { username: 'root', nome: 'ADMINISTRADOR', papel: 'root', aba: null },
  { username: 'sarah.fernandes', nome: 'SARAH SILVA DA COSTA FERNANDES', papel: 'supervisor', aba: null },
  { username: 'junaide.auzeni', nome: 'JUNAIDE AUZENI DE SOUSA', papel: 'supervisor', aba: null },
  { username: 'elaine.marreiros', nome: 'ELAINE MARREIROS', papel: 'operacional', aba: null },
  { username: 'flavio.marcolino', nome: 'FLAVIO MARCOLINO', papel: 'operacional', aba: null }
]

export function obterAnalista(username) {
  return ANALISTAS.find((analista) => analista.username === username)
}

export function obterAnalistasVisiveis(usuario) {
  if (usuario?.papel === 'root') return ANALISTAS
  if (usuario?.papel === 'supervisor') return ANALISTAS.filter((analista) => analista.supervisor === usuario.sub)
  return ANALISTAS.filter((analista) => analista.username === usuario?.sub)
}
