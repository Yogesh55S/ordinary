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
          <span className="text-emerald-600 dark:text-emerald-450 font-bold">Active CRM</span> database entries
        </p>
      )
    },
    {
      title: 'Pending Messages',
      value: stats.pendingTasks,
      icon: Clock,
      colorClass: 'bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          In outreach queue list
        </p>
      )
    },
    {
      title: 'Sent Outreach',
      value: stats.sentMessages,
      icon: CheckCircle2,
      colorClass: 'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          <span className="text-emerald-605 dark:text-emerald-400 font-bold">Successfully</span> delivered to WhatsApp / Email
        </p>
      )
    },
    {
      title: 'Failed Delivery',
      value: stats.failedDelivery,
      icon: XCircle,
      colorClass: 'bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400',
      description: (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          Needs contact check or retry
        </p>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={idx} 
            className="bg-white dark:bg-[#111625] rounded-2xl p-5 border border-slate-150 dark:border-slate-800/60 shadow-xs hover:shadow-sm transition-all flex items-start justify-between"
          >
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{card.title}</span>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
              ) : (
                <h2 className="text-3xl font-extrabold text-slate-805 dark:text-slate-100 leading-none">{card.value}</h2>
              )}
              {card.description}
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${card.colorClass}`}>
              <IconComponent className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
