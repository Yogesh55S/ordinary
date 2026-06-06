import { Terminal, Copy, Check } from 'lucide-react';

export default function SetupGuide({ copiedCmd, onCopyCmd }) {
  return (
    <div className="bg-white dark:bg-[#111625] border border-slate-150 dark:border-slate-800/60 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-905 dark:bg-slate-900/40 flex items-center space-x-2 text-slate-850 dark:text-slate-200">
        <Terminal className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Local Setup Guide</h3>
      </div>

      <div className="p-5 space-y-4 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
        <p>Because WhatsApp Web session socket nodes run locally, you must run the background automation worker daemon on your machine:</p>
        
        <ol className="list-decimal list-inside space-y-3 font-semibold text-slate-705 dark:text-slate-200 pl-1">
          <li>
            <span className="font-normal text-slate-600 dark:text-slate-350">Ensure Supabase environment variables are written inside <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-700 dark:text-indigo-400">.env.local</code>.</span>
          </li>
          <li>
            <span className="font-normal text-slate-600 dark:text-slate-350">Open your terminal console in the project root directory.</span>
          </li>
          <li>
            <span className="font-normal text-slate-600 dark:text-slate-350">Launch the local worker process command:</span>
            <div className="relative mt-2 p-3 bg-slate-900 dark:bg-[#0e1320] border border-slate-800 dark:border-slate-800 rounded-xl text-slate-200 dark:text-slate-100 font-mono text-[10px] flex items-center justify-between shadow-xs">
              <span>npm run whatsapp-worker</span>
              <button
                onClick={onCopyCmd}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-900"
                title="Copy script command"
              >
                {copiedCmd ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Copy className="h-4.5 w-4.5" />}
              </button>
            </div>
          </li>
          <li>
            <span className="font-normal text-slate-600 dark:text-slate-350">Keep the terminal window running. The status panel on the left will update automatically.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
