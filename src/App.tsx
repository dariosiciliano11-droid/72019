import React from 'react';
import { MeetingForm } from './components/MeetingForm';
import { VerbalePreview } from './components/VerbalePreview';
import { Logo } from './components/Logo';
import { MeetingData } from './types';
import { generateVerbale } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, History, Trash2 } from 'lucide-react';

interface SavedVerbale {
  id: string;
  date: string;
  content: string;
  title: string;
}

export default function App() {
  const [verbale, setVerbale] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<SavedVerbale[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('verbale_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (content: string) => {
    const newEntry: SavedVerbale = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      content,
      title: content.split('\n')[0].replace('#', '').trim() || 'Verbale senza titolo'
    };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('verbale_history', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('verbale_history', JSON.stringify(updated));
  };

  const handleGenerate = async (data: MeetingData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateVerbale(data);
      setVerbale(result);
      saveToHistory(result);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Si è verificato un errore durante la generazione. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setVerbale(null)}>
            <Logo size={48} />
            <div>
              <h1 className="font-sans text-xl font-bold tracking-tight text-brand-blue">Verbali Consiglio Direttivo</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">ASSOCIAZIONE 72019</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${showHistory ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <History size={16} />
              Archivio ({history.length})
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 space-y-12 print:p-0 print:m-0 print:max-w-none">
        {showHistory ? (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-sans font-bold text-stone-800">Ultimi Verbali Generati</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-sm font-bold uppercase tracking-wider text-stone-400 hover:text-stone-900"
              >
                Chiudi
              </button>
            </div>
            
            {history.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-4">
                <History size={48} className="mx-auto text-stone-200" />
                <p className="text-stone-500">Non hai ancora generato alcun verbale.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setVerbale(item.content);
                      setShowHistory(false);
                    }}
                    className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:border-stone-400 transition-all cursor-pointer group flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-stone-900">{item.title}</h4>
                      <p className="text-xs text-stone-400 mt-1">{item.date}</p>
                    </div>
                    <button 
                      onClick={(e) => deleteFromHistory(item.id, e)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        ) : (
          <>
            {/* Hero Section */}
            <section className="text-center space-y-4 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles size={12} /> AI Powered Document Generator
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-sans font-bold text-stone-900 tracking-tight">
                Crea verbali del Consiglio Direttivo in pochi secondi.
              </h2>
              <p className="text-stone-500 text-lg leading-relaxed">
                Inserisci i dettagli della riunione e lascia che l'intelligenza artificiale rediga un documento formale e pronto per la firma.
              </p>
            </section>

            {/* Form Section */}
            <section className="max-w-3xl mx-auto">
              <MeetingForm onSubmit={handleGenerate} isLoading={isLoading} />
              {error && (
                <p className="mt-4 text-center text-red-600 text-sm font-medium">{error}</p>
              )}
            </section>
          </>
        )}

        {/* Result Section */}
        <AnimatePresence>
          {verbale && !showHistory && (
            <section className="max-w-4xl mx-auto pt-8">
              <VerbalePreview content={verbale} />
            </section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-200 pt-12 pb-8 print:hidden">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <p className="text-stone-400 text-sm">
            © {new Date().getFullYear()} Associazione 72019. Tutti i diritti riservati.
          </p>
          <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-widest text-stone-300">
            <span>Privacy Policy</span>
            <span>Termini di Servizio</span>
            <span>Contatti</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
