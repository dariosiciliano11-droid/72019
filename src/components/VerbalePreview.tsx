import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Download, FileText, Printer, FileDown } from 'lucide-react';
import { motion } from 'motion/react';
import { exportToDocx } from '../utils/docxExport';

interface VerbalePreviewProps {
  content: string;
}

export const VerbalePreview: React.FC<VerbalePreviewProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);
  const [printError, setPrintError] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `verbale_72019_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
  };

  const handleDownloadDocx = async () => {
    const filename = `verbale_72019_${new Date().toISOString().split('T')[0]}`;
    await exportToDocx(content, filename);
  };

  const handlePrint = () => {
    try {
      // Set document title so the print dialog shows a nice name
      const originalTitle = document.title;
      const firstLine = content.split('\n')[0].replace('#', '').trim();
      document.title = firstLine || 'Verbale Associazione 72019';
      
      window.print();
      
      // Restore title
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } catch (err) {
      console.error("Print error:", err);
      setPrintError(true);
      setTimeout(() => setPrintError(false), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 print:space-y-0 print:transform-none print:opacity-100"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-sm print:hidden gap-4">
        <div className="flex items-center gap-3 text-stone-600">
          <FileText size={20} className="text-stone-400" />
          <span className="font-medium">Anteprima Verbale</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-600 flex items-center gap-2 text-sm font-medium"
            title="Copia negli appunti"
          >
            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
            {copied ? 'Copiato!' : 'Copia'}
          </button>
          <button
            onClick={handlePrint}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${printError ? 'bg-amber-50 text-amber-700' : 'hover:bg-stone-100 text-stone-600'}`}
            title={printError ? "Funzione bloccata dal browser" : "Stampa"}
          >
            <Printer size={18} />
            {printError ? 'Usa Word o apri in nuova scheda' : 'Stampa'}
          </button>
          <button
            onClick={handleDownloadDocx}
            className="p-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            title="Scarica come Word (.docx)"
          >
            <FileDown size={18} />
            Word (.docx)
          </button>
          <button
            onClick={handleDownloadMd}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-600 flex items-center gap-2 text-sm font-medium"
            title="Scarica come Markdown"
          >
            <Download size={18} />
            Markdown
          </button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-2xl border border-stone-200 shadow-sm min-h-[600px] print:shadow-none print:border-none print:p-0">
        <div className="markdown-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};
