import { GoogleGenAI } from "@google/genai";
import { MeetingData } from "../types";

export async function generateVerbale(data: MeetingData): Promise<string> {
  // Try both process.env and import.meta.env (Vite)
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("Chiave API di Gemini mancante. Assicurati di aver configurato GEMINI_API_KEY nelle impostazioni di Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Sei un assistente esperto nella redazione di verbali formali per associazioni no-profit.
    Il tuo compito è redigere il verbale ufficiale di una riunione del Consiglio Direttivo dell'Associazione della Città del 2019.
    È fondamentale che il documento sia chiaramente identificato come "Verbale del Consiglio Direttivo".
    
    Dati della riunione:
    - Numero Verbale: ${data.numeroVerbale}
    - Luogo: ${data.luogo}
    - Data: ${data.data}
    - Ora Inizio: ${data.oraInizio}
    - Ora Fine: ${data.oraFine}
    - Partecipanti:
      ${data.participants.map(p => `- ${p.name} (${p.role || 'Membro'}): ${p.status}${p.proxyTo ? ` (delega a ${p.proxyTo})` : ''}`).join('\n      ')}
    
    Punti trattati all'Ordine del Giorno:
    ${data.puntiOdG.map((p, i) => `
    Punto ${i + 1}: ${p.text}
    - Discussione: ${p.discussione}
    ${p.hasVotazione ? `
    - Esito Votazione:
      - Favorevoli: ${p.votazione.unanimitaFavorevole ? 'All\'unanimità' : p.votazione.favorevoli}
      - Contrari: ${p.votazione.unanimitaContraria ? 'All\'unanimità' : p.votazione.contrari}
    ` : '- Votazione: Non prevista per questo punto.'}
    `).join('\n')}

    Linee guida per la redazione:
    1. Usa un linguaggio formale, burocratico e professionale tipico dei verbali italiani.
    2. Includi un'intestazione chiara con il nome dell'associazione.
    3. Struttura il documento in sezioni: Apertura, Appello, Trattazione dell'Ordine del Giorno, Chiusura.
    4. Per OGNI punto dell'ordine del giorno, crea una sottosezione che includa:
       - Esposizione e Discussione: trasforma gli appunti in un testo fluido.
       - Votazione (se presente): riporta i numeri dei votanti.
       - Deliberazione: DEVI inserire una frase del tipo: "Il Consiglio Direttivo approva [oppure rifiuta, in base ai voti] il punto X dell'ordine del giorno ([Testo del punto])".
    5. Assicurati che il tono sia istituzionale.
    6. Il risultato deve essere in formato Markdown.
    7. IMPORTANTE: NON utilizzare mai la frase "la sede sita in" o simili. Indica semplicemente il luogo della riunione.
    8. Nella sezione di chiusura, dopo la frase "dichiara formalmente chiusa la seduta", aggiungi sempre l'orario di chiusura indicato (${data.oraFine}).
    9. NON includere mai siti web o URL (come www.72019.it) nel documento.
    10. Il titolo del documento DEVE essere esattamente in questo formato (su due righe separate):
        # VERBALE DEL CONSIGLIO DIRETTIVO NUMERO ${data.numeroVerbale}
        # ASSOCIAZIONE 72019
    11. NON utilizzare mai linee di separazione orizzontali (come "---").
    12. Evita spazi eccessivi tra i paragrafi.
    13. NON utilizzare mai asterischi (*) nell'elenco dei presenti o in altre parti del testo (usa trattini "-" per gli elenchi puntati).
    14. NON utilizzare mai underscore (_) o linee tratteggiate per le firme del Presidente e del Segretario. Riporta solo i titoli e i nomi in modo testuale.
    15. All'inizio del verbale, quando indichi il luogo della riunione, usa la preposizione "presso" invece di "a" (es. "si è riunito presso [Luogo]" invece di "si è riunito a [Luogo]").
    16. Aggiungi uno spazio significativo (almeno due righe vuote) prima delle firme finali del Presidente e del Segretario per separarle nettamente dal testo della chiusura.
    17. Dopo la frase "Costatata la piena validità della seduta e la regolarità della convocazione, il Presidente dichiara aperta la riunione per la trattazione del seguente ordine del giorno", inserisci un elenco puntato che riepiloghi tutti i punti dell'ordine del giorno prima di procedere con la trattazione dettagliata di ciascuno.

    Esempio di struttura:
    # VERBALE DEL CONSIGLIO DIRETTIVO NUMERO [Numero Verbale]
    # ASSOCIAZIONE 72019
    
    **Data:** [Data]
    **Luogo:** [Luogo]
    **Ora Inizio:** [Ora Inizio]
    **Ora Fine:** [Ora Fine]
    
    ## 1. Apertura e Appello
    ...
    Costatata la piena validità della seduta e la regolarità della convocazione, il Presidente dichiara aperta la riunione per la trattazione del seguente ordine del giorno:
    - Punto 1: [Testo Punto 1]
    - Punto 2: [Testo Punto 2]
    ...

    ## 2. Trattazione dell'Ordine del Giorno
    
    ### 2.1 [Titolo Punto 1]
    [Discussione fluida...]
    [Esito Votazione...]
    **Delibera:** Il Consiglio Direttivo approva il punto 1 dell'ordine del giorno ([Testo del punto]).
    
    ### 2.2 [Titolo Punto 2]
    ...
    
    ## 3. Chiusura
    Esauriti i punti all'ordine del giorno, il Presidente dichiara formalmente chiusa la seduta alle ore [Ora Fine].
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Errore: Il modello non ha restituito alcun testo.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorString = JSON.stringify(error);
    if (errorString.includes("RESOURCE_EXHAUSTED") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("Quota esaurita per oggi o troppe richieste ravvicinate. Per favore, riprova tra un minuto.");
    }
    
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("La Chiave API fornita non è valida.");
    }
    throw error;
  }
}
