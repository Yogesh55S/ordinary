import { Users, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function StatsGrid({ stats, loading }) {
  const cards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      colorClass: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500 inline mr-1 shrink-0 align-text-bottom" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active CRM</span> entries
        </p>
      ),
    },
    {
      title: 'Pending',
      value: stats.pendingTasks,
      icon: Clock,
      colorClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          In outreach queue
        </p>
      ),
    },
    {
      title: 'Sent',
      value: stats.sentMessages,
      icon: CheckCircle2,
      colorClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Delivered</span> to WhatsApp/Email
        </p>
      ),
    },
    {
      title: 'Failed',
      value: stats.failedDelivery,
      icon: XCircle,
      colorClass: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          Needs retry or fix
        </p>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-ink-800 rounded-2xl p-3.5 sm:p-5 border border-slate-150 dark:border-slate-800/60 shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-2.5 sm:gap-3"
          >
            {/* Top row: label + icon */}
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-snug line-clamp-2">
                {card.title}
              </span>
              <div className={`p-1.5 sm:p-2.5 rounded-xl shrink-0 ${card.colorClass}`}>
                <IconComponent className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
            </div>

            {/* Value */}
            {loading ? (
              <div className="h-7 w-14 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-none tabular-nums">
                {card.value}
              </p>
            )}

            {/* Description — visible from sm up */}
            <div className="hidden sm:block">{card.description}</div>
          </div>
        );
      })}
    </div>
  );
}
