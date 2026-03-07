export type ParticipantStatus = 'presente' | 'con delega';

export interface Participant {
  id: string;
  name: string;
  role?: string;
  status: ParticipantStatus;
  proxyTo?: string; // If status is 'con delega'
}

export interface Votazione {
  favorevoli: number;
  contrari: number;
  unanimitaFavorevole: boolean;
  unanimitaContraria: boolean;
}

export interface AgendaPoint {
  id: string;
  text: string;
  discussione: string;
  hasVotazione: boolean;
  votazione: Votazione;
}

export interface MeetingData {
  numeroVerbale: string;
  luogo: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  puntiOdG: AgendaPoint[];
  participants: Participant[];
}

export interface VerbaleResult {
  content: string;
}
