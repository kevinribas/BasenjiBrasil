export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  created_at: string;
}

export type CategoriaSaude =
  | 'sensibilidade_digestiva'
  | 'fanconi'
  | 'figado_ipsid'
  | 'alergias_pele'
  | 'renal'
  | 'outra';

export type StatusCondicaoSaude =
  | 'em_tratamento'
  | 'controlado'
  | 'resolvido'
  | 'preventivo';

export interface CondicaoSaude {
  categoria: CategoriaSaude;
  titulo: string;
  status: StatusCondicaoSaude;
  descricao?: string;
  compartilhar_comunidade: boolean;
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
  condicoes_saude?: CondicaoSaude[] | null;
  profiles?: Profile;
}

export const CONDICOES_PREDEFINIDAS: {
  categoria: CategoriaSaude;
  titulo: string;
  descricaoCurta: string;
}[] = [
  {
    categoria: 'sensibilidade_digestiva',
    titulo: 'Sensibilidade Digestiva / Diarreia Recorrente',
    descricaoCurta: 'Muito comum em Basenjis, exigindo ração de alta digestibilidade ou alimentação natural guiada.',
  },
  {
    categoria: 'fanconi',
    titulo: 'Síndrome de Fanconi',
    descricaoCurta: 'Doença genética renal característica da raça; monitoramento com tiras de glicosúria é fundamental.',
  },
  {
    categoria: 'figado_ipsid',
    titulo: 'Problemas Hepáticos / Intestinais (IPSID)',
    descricaoCurta: 'Doença imunoproliferativa do intestino delgado, requer acompanhamento contínuo.',
  },
  {
    categoria: 'alergias_pele',
    titulo: 'Alergias de Pele / Alimentar',
    descricaoCurta: 'Dermatites atópicas ou intolerâncias alimentares frequentes.',
  },
  {
    categoria: 'renal',
    titulo: 'Problemas Renais',
    descricaoCurta: 'Nefropatias ou necessidade de controle de hidratação e função renal.',
  },
  {
    categoria: 'outra',
    titulo: 'Outra Condição',
    descricaoCurta: 'Outra condição acompanhada pelo médico veterinário.',
  },
];

export const STATUS_SAUDE_CONFIG: Record<
  StatusCondicaoSaude,
  { label: string; bg: string; text: string; border: string }
> = {
  em_tratamento: {
    label: 'Em tratamento',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  controlado: {
    label: 'Controlado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  resolvido: {
    label: 'Resolvido',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  preventivo: {
    label: 'Preventivo',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
};

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
