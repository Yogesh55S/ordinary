import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Consistent page heading used by every top-level screen.
 *
 * Layout
 * - Mobile: title → description → actions; actions share the row equally so
 *   primary CTAs are full-width, thumb-friendly targets.
 * - sm and up: title block on the left, actions aligned to the right, never
 *   wrapping their labels onto two lines.
 */
export default function PageHeader({ title, description, icon: Icon, actions, backHref, backLabel, meta }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel || 'Back'}</span>
          </Link>
        )}
        <h1 className="flex items-center gap-2.5 text-2xl sm:text-[28px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
          {Icon && <Icon className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />}
          <span className="truncate">{title}</span>
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        )}
        {meta && <div className="mt-2.5">{meta}</div>}
      </div>

      {actions && (
        <div className="flex flex-col xs:flex-row shrink-0 items-stretch xs:items-center gap-2 sm:gap-2.5 [&>*]:w-full xs:[&>*]:w-auto sm:[&>*]:flex-none sm:[&>*]:whitespace-nowrap">
          {actions}
        </div>
      )}
    </header>
  );
}
