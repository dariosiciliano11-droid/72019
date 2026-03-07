import React from 'react';
import { MeetingData, Participant, ParticipantStatus, AgendaPoint } from '../types';
import { MapPin, Clock, Calendar, Users, ListTodo, MessageSquare, Send, Plus, Trash2, UserPlus, Hash, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Gavel, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface MeetingFormProps {
  onSubmit: (data: MeetingData) => void;
  isLoading: boolean;
}

const createEmptyPoint = (text: string = ''): AgendaPoint => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  text,
  discussione: '',
  hasVotazione: true,
  votazione: {
    favorevoli: 0,
    contrari: 0,
    unanimitaFavorevole: false,
    unanimitaContraria: false,
  }
});

export const MeetingForm: React.FC<MeetingFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<MeetingData>({
    numeroVerbale: '',
    luogo: ' ',
    data: new Date().toISOString().split('T')[0],
    oraInizio: '19:00',
    oraFine: '20:30',
    puntiOdG: [
      createEmptyPoint(''),
      createEmptyPoint('Varie ed eventuali')
    ],
    participants: [
      { id: '1', name: '', role: 'Presidente', status: 'presente' },
      { id: '2', name: '', role: 'Segretario', status: 'presente' },
    ],
  });

  const totalVoters = formData.participants.filter(p => p.status === 'presente' || p.status === 'con delega').length;

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      puntiOdG: prev.puntiOdG.map(p => {
        if (p.votazione.unanimitaFavorevole) {
          return { ...p, votazione: { ...p.votazione, favorevoli: totalVoters, contrari: 0 } };
        }
        if (p.votazione.unanimitaContraria) {
          return { ...p, votazione: { ...p.votazione, favorevoli: 0, contrari: totalVoters } };
        }
        return p;
      })
    }));
  }, [totalVoters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: check if all points with voting have correct total voters
    const invalidPoints = formData.puntiOdG.filter(p => 
      p.hasVotazione && (p.votazione.favorevoli + p.votazione.contrari !== totalVoters)
    );

    if (invalidPoints.length > 0) {
      alert(`Attenzione: Per alcuni punti il totale dei votanti (${totalVoters}) non corrisponde alla somma di favorevoli e contrari.`);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: '',
      role: 'Consigliere',
      status: 'presente'
    };
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  const removeParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addAgendaPoint = () => {
    setFormData(prev => {
      const lastPoint = prev.puntiOdG[prev.puntiOdG.length - 1];
      const newPoint = createEmptyPoint('');
      
      if (lastPoint?.text === 'Varie ed eventuali') {
        const newPoints = [...prev.puntiOdG];
        newPoints.splice(newPoints.length - 1, 0, newPoint);
        return { ...prev, puntiOdG: newPoints };
      }
      return {
        ...prev,
        puntiOdG: [...prev.puntiOdG, newPoint]
      };
    });
  };

  const removeAgendaPoint = (id: string) => {
    setFormData(prev => ({
      ...prev,
      puntiOdG: prev.puntiOdG.filter(p => p.id !== id)
    }));
  };

  const updateAgendaPoint = (id: string, updates: Partial<AgendaPoint>) => {
    setFormData(prev => ({
      ...prev,
      puntiOdG: prev.puntiOdG.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const updatePointVotazione = (pointId: string, updates: Partial<AgendaPoint['votazione']>) => {
    setFormData(prev => ({
      ...prev,
      puntiOdG: prev.puntiOdG.map(p => {
        if (p.id !== pointId) return p;
        
        const newVotazione = { ...p.votazione, ...updates };
        
        // Handle unanimity logic
        if (updates.unanimitaFavorevole) {
          newVotazione.unanimitaContraria = false;
          newVotazione.favorevoli = totalVoters;
          newVotazione.contrari = 0;
        } else if (updates.unanimitaContraria) {
          newVotazione.unanimitaFavorevole = false;
          newVotazione.contrari = totalVoters;
          newVotazione.favorevoli = 0;
        }

        return { ...p, votazione: newVotazione };
      })
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
      <div className="border-b border-stone-100 pb-4 mb-2">
        <h4 className="text-lg font-bold text-brand-blue">Nuovo Verbale del Consiglio Direttivo</h4>
        <p className="text-sm text-stone-400">Compila i campi sottostanti per generare il documento ufficiale.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Hash size={14} /> Verbale Numero
          </label>
          <input
            type="text"
            name="numeroVerbale"
            placeholder="es: 01/2026"
            value={formData.numeroVerbale}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <MapPin size={14} /> Luogo
          </label>
          <input
            type="text"
            name="luogo"
            value={formData.luogo}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Calendar size={14} /> Data
          </label>
          <input
            type="date"
            name="data"
            value={formData.data}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Clock size={14} /> Ora Inizio
          </label>
          <input
            type="time"
            name="oraInizio"
            value={formData.oraInizio}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Clock size={14} /> Ora Fine
          </label>
          <input
            type="time"
            name="oraFine"
            value={formData.oraFine}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all outline-none"
            required
          />
        </div>
      </div>

      {/* Participants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Users size={14} /> Partecipanti
          </label>
          <button
            type="button"
            onClick={addParticipant}
            className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1 hover:text-stone-600 transition-colors"
          >
            <UserPlus size={14} /> Aggiungi
          </button>
        </div>
        
        <div className="space-y-3">
          {formData.participants.map((p, index) => (
            <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="md:col-span-4 space-y-1">
                <input
                  type="text"
                  placeholder="Nome e Cognome"
                  value={p.name}
                  onChange={(e) => updateParticipant(p.id, { name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <input
                  type="text"
                  placeholder="Ruolo (es: Presidente)"
                  value={p.role}
                  onChange={(e) => updateParticipant(p.id, { role: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <div className="flex bg-white border border-stone-200 rounded-lg p-0.5 gap-0.5">
                  {(['presente', 'con delega'] as ParticipantStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateParticipant(p.id, { status })}
                      className={`flex-1 px-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                        p.status === status 
                          ? 'bg-brand-blue text-white shadow-sm' 
                          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {status === 'con delega' ? 'Delega' : status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                {p.status === 'con delega' && (
                  <input
                    type="text"
                    placeholder="Delega a..."
                    value={p.proxyTo || ''}
                    onChange={(e) => updateParticipant(p.id, { proxyTo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400"
                    required
                  />
                )}
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                  disabled={formData.participants.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agenda Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <ListTodo size={14} /> Ordine del Giorno e Trattazione
          </label>
          <button
            type="button"
            onClick={addAgendaPoint}
            className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1 hover:text-stone-600 transition-colors"
          >
            <Plus size={14} /> Aggiungi Punto
          </button>
        </div>
        
        <div className="space-y-8">
          {formData.puntiOdG.map((point, index) => (
            <div key={point.id} className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-100 relative group">
              <div className="flex gap-3 items-start">
                <span className="text-stone-400 font-mono text-sm mt-2 w-6">{index + 1}.</span>
                <div className="flex-1 space-y-4">
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Titolo del punto all'ordine del giorno..."
                      value={point.text}
                      onChange={(e) => updateAgendaPoint(point.id, { text: e.target.value })}
                      className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold outline-none focus:border-stone-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAgendaPoint(point.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      disabled={formData.puntiOdG.length <= 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                      <MessageSquare size={12} /> Discussione del punto
                    </label>
                    <textarea
                      rows={3}
                      value={point.discussione}
                      onChange={(e) => updateAgendaPoint(point.id, { discussione: e.target.value })}
                      placeholder="Riporta qui gli interventi e la discussione relativa a questo punto..."
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400 resize-none"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-stone-200/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                          <CheckCircle2 size={12} /> Votazione
                        </label>
                        <button
                          type="button"
                          onClick={() => updateAgendaPoint(point.id, { hasVotazione: !point.hasVotazione })}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                            point.hasVotazione ? 'text-brand-blue bg-brand-blue/5' : 'text-stone-400 bg-stone-100'
                          }`}
                        >
                          {point.hasVotazione ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {point.hasVotazione ? 'Inclusa' : 'Esclusa'}
                        </button>
                      </div>
                      
                      {point.hasVotazione && (
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 ${
                          (point.votazione.favorevoli + point.votazione.contrari === totalVoters)
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          <AlertCircle size={12} />
                          Votanti: {point.votazione.favorevoli + point.votazione.contrari} / {totalVoters}
                        </div>
                      )}
                    </div>

                    {point.hasVotazione && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 p-4 rounded-xl border border-stone-200/50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                              <ThumbsUp size={14} className="text-emerald-500" /> Favorevoli
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={totalVoters}
                              value={point.votazione.favorevoli}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updatePointVotazione(point.id, { 
                                  favorevoli: val,
                                  unanimitaFavorevole: val === totalVoters && totalVoters > 0,
                                  unanimitaContraria: false
                                });
                              }}
                              className="w-16 px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:border-stone-400"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                              <ThumbsDown size={14} className="text-red-500" /> Contrari
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={totalVoters}
                              value={point.votazione.contrari}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updatePointVotazione(point.id, { 
                                  contrari: val,
                                  unanimitaContraria: val === totalVoters && totalVoters > 0,
                                  unanimitaFavorevole: false
                                });
                              }}
                              className="w-16 px-2 py-1 bg-white border border-stone-200 rounded text-xs outline-none focus:border-stone-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 p-2 bg-white border border-stone-200 rounded-lg cursor-pointer hover:border-brand-blue/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={point.votazione.unanimitaFavorevole}
                              onChange={(e) => updatePointVotazione(point.id, { unanimitaFavorevole: e.target.checked })}
                              className="w-3.5 h-3.5 text-brand-blue rounded border-stone-300"
                            />
                            <span className="text-[10px] font-bold text-stone-600 uppercase">Favorevoli all'unanimità</span>
                          </label>
                          <label className="flex items-center gap-2 p-2 bg-white border border-stone-200 rounded-lg cursor-pointer hover:border-brand-blue/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={point.votazione.unanimitaContraria}
                              onChange={(e) => updatePointVotazione(point.id, { unanimitaContraria: e.target.checked })}
                              className="w-3.5 h-3.5 text-brand-blue rounded border-stone-300"
                            />
                            <span className="text-[10px] font-bold text-stone-600 uppercase">Contrari all'unanimità</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand-blue text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/10"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Send size={18} /> Genera Verbale
          </>
        )}
      </button>
    </form>
  );
};
