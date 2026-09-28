export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  created_at: string;
}

export interface Basenji {
  id: string;
  dono_id: string;
  nome: string;
  data_nasc: string | null;
  sexo: 'macho' | 'femea';
  cor: string;
  foto_url: string | null;
  bio: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface Event {
  id: string;
  criador_id: string;
  titulo: string;
  descricao: string | null;
  local: string;
  cidade: string;
  estado: string;
  data_hora: string;
  created_at: string;
  profiles?: Profile;
  event_attendees?: EventAttendee[];
  _count?: { attendees: number };
}

export interface EventAttendee {
  id: string;
  evento_id: string;
  usuario_id: string;
  status: 'going' | 'not_going';
  updated_at: string;
  profiles?: Profile;
}

export type EstadoBR =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF'
  | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA'
  | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS'
  | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export const ESTADOS_BR: { sigla: EstadoBR; nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];
